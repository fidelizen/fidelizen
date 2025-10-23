import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";
import { v4 as uuidv4 } from "uuid";
import path from "path";
import fs from "fs";
import sharp from "sharp";
import { PKPass } from "passkit-generator";

/**
 * 🔄 Fonction utilitaire pour générer le strip avec tampons.
 */
async function generateDynamicStrip({
  merchantName,
  scanCount,
  scansRequired,
  remaining,
  outputDir,
}) {
  const modelDir = path.join(process.cwd(), "wallet-template.pass");
  const stampPath = path.join(modelDir, "stamp.png");

  const width = 750;
  const height = 246;
  const stamp = fs.readFileSync(stampPath);

  let img = sharp({
    create: {
      width,
      height,
      channels: 4,
      background: { r: 16, g: 185, b: 129, alpha: 1 },
    },
  });

  const columns = Math.min(scansRequired, 5);
  const rows = Math.ceil(scansRequired / columns);
  const cellSize = 40;
  const gap = 10;
  const gridWidth = columns * cellSize + (columns - 1) * gap;
  const gridHeight = rows * cellSize + (rows - 1) * gap;
  const gridOffsetX = (width - gridWidth) / 2;
  const gridOffsetY = height - gridHeight - 20;

  const positions = [];
  for (let i = 0; i < scansRequired; i++) {
    const col = i % columns;
    const row = Math.floor(i / columns);
    positions.push({
      x: gridOffsetX + col * (cellSize + gap),
      y: gridOffsetY + row * (cellSize + gap),
    });
  }

  const cells = positions.map((p) => ({
    input: Buffer.from(
      `<svg width="${cellSize}" height="${cellSize}">
        <rect width="100%" height="100%" rx="8" ry="8"
          fill="none" stroke="white" stroke-width="3" opacity="0.9"/>
      </svg>`
    ),
    left: Math.round(p.x),
    top: Math.round(p.y),
  }));
  img = img.composite(cells);

  const stampComposites = [];
  const stampSize = 30;
  for (let i = 0; i < scanCount && i < positions.length; i++) {
    const resizedStamp = await sharp(stamp).resize(stampSize, stampSize).toBuffer();
    stampComposites.push({
      input: resizedStamp,
      left: Math.round(positions[i].x + (cellSize - stampSize) / 2),
      top: Math.round(positions[i].y + (cellSize - stampSize) / 2),
    });
  }
  if (stampComposites.length > 0) img = img.composite(stampComposites);

  const titleSvg = `
    <svg width="${width}" height="100">
      <text x="50%" y="50" text-anchor="middle"
        font-size="32" font-weight="bold"
        fill="white" font-family="Arial, sans-serif">
        ${merchantName.replace(/&/g, "&amp;")}
      </text>
      <text x="50%" y="90" text-anchor="middle"
        font-size="18" fill="white" font-family="Arial, sans-serif">
        ${remaining} passage${remaining > 1 ? "s" : ""} restant${remaining > 1 ? "s" : ""}
      </text>
    </svg>`;
  img = img.composite([{ input: Buffer.from(titleSvg), top: 10, left: 0 }]);

  const stripPath = path.join(outputDir, "strip.png");
  const strip2xPath = path.join(outputDir, "strip@2x.png");

  await img.toFile(stripPath);
  await img.resize(width * 2, height * 2).toFile(strip2xPath);
}

/**
 * 🚀 Apple appelle ce endpoint pour re-télécharger le pass après une notification push.
 */
export async function GET(req, { params }) {
  let tempDir = null;

  try {
    // Ces identifiants sont statiques ici mais tu peux les rendre dynamiques
    const merchantId = "e1dc0c31-1605-4f81-a1a4-85634d24a5dc";
    const customerId = "f00a5861-88ec-42a1-aa5e-cb871b6bcfca";

    // Récupération de la progression client
    const { data: progress, error } = await supabaseServer
      .from("v_loyalty_progress")
      .select("*")
      .eq("merchant_id", merchantId)
      .eq("customer_id", customerId)
      .maybeSingle();

    if (error || !progress) throw new Error("Progression introuvable.");

    const scanCount = progress.current_stamps || 0;
    const maxScans = progress.scans_required || 10;
    const remaining = Math.max(0, maxScans - scanCount);
    const merchantName = progress.merchant_name || "Commerce local";

    // Dossier temporaire pour la génération
    tempDir = path.join(process.cwd(), ".tmp", `update-${uuidv4()}.pass`);
    fs.mkdirSync(tempDir, { recursive: true });

    // Génération du strip dynamique
    await generateDynamicStrip({
      merchantName,
      scanCount,
      scansRequired: maxScans,
      remaining,
      outputDir: tempDir,
    });

    // Lecture du modèle et certificats
    const certDir = path.join(process.cwd(), "certs");
    const modelDir = path.join(process.cwd(), "wallet-template.pass");
    const passJsonPath = path.join(modelDir, "pass.json");
    const basePass = JSON.parse(fs.readFileSync(passJsonPath, "utf8"));

    // Ajout des données dynamiques
    basePass.userInfo = { customer_id: customerId, merchant_id: merchantId };
    basePass.generic.primaryFields = [
      { key: "merchant", label: "Commerce", value: merchantName },
    ];
    basePass.generic.secondaryFields = [
      { key: "progress", label: "Progression", value: `${scanCount}/${maxScans}` },
    ];
    basePass.generic.auxiliaryFields = [
      { key: "remaining", label: "Restant", value: `${remaining}` },
    ];
    basePass.generic.backFields = [
      {
        key: "info",
        label: "Information",
        value: "Présentez cette carte en magasin pour valider vos tampons.",
      },
    ];

    // Nouveau numéro de série (pour forcer la mise à jour côté Apple Wallet)
    basePass.serialNumber = `${merchantId}-${customerId}-${Date.now()}`;

    // Copie des images
    const assets = [
      "icon.png", "icon@2x.png",
      "logo.png", "logo@2x.png",
      "background.png", "background@2x.png",
      "stamp.png", "strip.png", "strip@2x.png",
    ];
    for (const file of assets) {
      const src = path.join(file.includes("strip") ? tempDir : modelDir, file);
      const dest = path.join(tempDir, file);
      if (fs.existsSync(src)) fs.copyFileSync(src, dest);
    }

    // Écrit le pass modifié
    fs.writeFileSync(path.join(tempDir, "pass.json"), JSON.stringify(basePass, null, 2));

    // Génère et signe le pass
    const pass = await PKPass.from(
      {
        model: tempDir,
        certificates: {
          wwdr: fs.readFileSync(path.join(certDir, "WWDR.pem")),
          signerCert: fs.readFileSync(path.join(certDir, "certificate.pem")),
          signerKey: fs.readFileSync(path.join(certDir, "key.pem")),
        },
      },
      {}
    );

    const buffer = pass.getAsBuffer();
    fs.rmSync(tempDir, { recursive: true, force: true });

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/vnd.apple.pkpass",
        "Content-Disposition": `attachment; filename=fidelizen-${merchantName.replace(/[^a-zA-Z0-9]/g, "-")}-update.pkpass`,
      },
    });
  } catch (err) {
    console.error("❌ Erreur mise à jour Wallet :", err);
    if (tempDir && fs.existsSync(tempDir)) fs.rmSync(tempDir, { recursive: true, force: true });
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

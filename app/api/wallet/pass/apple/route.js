// app/api/wallet/pass/apple/route.js
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import path from "path";
import fs from "fs";
import { PKPass } from "passkit-generator";
import { supabaseServer } from "@/lib/supabaseServer";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const merchantId = searchParams.get("merchant_id");
    const customerId = searchParams.get("customer_id");

    if (!merchantId || !customerId) {
      return NextResponse.json(
        { error: "Missing merchant_id or customer_id" },
        { status: 400 }
      );
    }

    // --- Récupération Supabase
    const { data: progress, error } = await supabaseServer
      .from("v_loyalty_progress")
      .select("*")
      .eq("merchant_id", merchantId)
      .eq("customer_id", customerId)
      .maybeSingle();

    if (error || !progress) {
      throw new Error("Impossible de récupérer les données de fidélité");
    }

    const scanCount = progress.current_stamps || 0;
    const maxScans = progress.scans_required || 10;
    const merchantName = progress.merchant_name || "Commerce local";
    const rewardDescription =
      progress.reward_description || "Récompense à débloquer";

    const certDir = path.join(process.cwd(), "certs");
    const modelDir = path.join(process.cwd(), "wallet-template.pass");

    // --- Vérifie existence du modèle
    const passJsonPath = path.join(modelDir, "pass.json");
    if (!fs.existsSync(passJsonPath)) {
      throw new Error(`Le fichier pass.json est introuvable : ${passJsonPath}`);
    }

    // --- Lis et adapte le modèle JSON
    const basePass = JSON.parse(fs.readFileSync(passJsonPath, "utf8"));
    basePass.serialNumber = uuidv4();
    basePass.description = `Carte de fidélité ${merchantName}`;
    basePass.logoText = merchantName;
    basePass.organizationName = "Fidélizen";

    // --- Met à jour les champs de fidélité
    basePass.storeCard.primaryFields = [
      { key: "progress", label: "Tampons", value: `${scanCount} / ${maxScans}` },
    ];
    basePass.storeCard.secondaryFields = [
      { key: "merchant", label: "Commerce", value: merchantName },
    ];
    basePass.storeCard.auxiliaryFields = [
      { key: "reward", label: "Récompense", value: rewardDescription },
    ];
    basePass.storeCard.backFields = [
      { key: "info", label: "Fidélizen", value: "Merci de soutenir le commerce local 💚" },
    ];

    // --- Code QR dynamique
    basePass.barcodes = [
      {
        format: "PKBarcodeFormatQR",
        message: `https://fidelizen.app/scan/${merchantId}/${customerId}`,
        messageEncoding: "iso-8859-1",
      },
    ];

    // --- Création du pass à partir du JSON modifié
    const pass = await PKPass.from(
      {
        model: modelDir,
        certificates: {
          wwdr: fs.readFileSync(path.join(certDir, "WWDR.pem")),
          signerCert: fs.readFileSync(path.join(certDir, "certificate.pem")),
          signerKey: fs.readFileSync(path.join(certDir, "key.pem")),
        },
      },
      basePass // <= on injecte ici notre JSON modifié
    );

    const buffer = pass.getAsBuffer();

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/vnd.apple.pkpass",
        "Content-Disposition": `attachment; filename=fidelizen-${merchantName
          .replace(/\s+/g, "-")
          .toLowerCase()}.pkpass`,
      },
    });
  } catch (err) {
    console.error("Erreur génération Apple Wallet:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

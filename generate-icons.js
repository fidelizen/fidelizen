import fs from "fs";
import { createCanvas } from "canvas";

// Fonction pour générer une icône simple (fond vert + texte blanc)
function createIcon(size, fileName, bgColor = "#10B981", text = "F") {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext("2d");

  // Fond vert Fidélizen
  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, size, size);

  // Texte blanc centré
  ctx.fillStyle = "#FFFFFF";
  ctx.font = `${Math.floor(size * 0.7)}px sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, size / 2, size / 2);

  // Sauvegarde en PNG
  const buffer = canvas.toBuffer("image/png");
  fs.writeFileSync(fileName, buffer);
  console.log(`✅ ${fileName} créé (${size}x${size})`);
}

// Crée les deux icônes Apple Wallet
createIcon(29, "./wallet-template.pass/icon.png");
createIcon(58, "./wallet-template.pass/icon@2x.png");

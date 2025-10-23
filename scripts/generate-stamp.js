import sharp from "sharp";

async function generateStamp() {
  const size = 60; // taille de base du tampon
  const color = "#e11d48"; // Rouge Fidélizen (équivaut à Tailwind red-600)

  // --- Création du SVG ---
  const svg = `
    <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
      <!-- Cercle rouge -->
      <circle cx="${size / 2}" cy="${size / 2}" r="${size / 2 - 3}"
        fill="${color}" stroke="white" stroke-width="3" opacity="0.95" />

      <!-- Texte "F" centré (pour Fidélizen) -->
      <text
        x="50%"
        y="55%"
        text-anchor="middle"
        font-family="Arial, sans-serif"
        font-size="${size * 0.5}"
        fill="white"
        font-weight="bold">
        F
      </text>
    </svg>
  `;

  // --- Génération du PNG ---
  await sharp(Buffer.from(svg))
    .png()
    .toFile("./wallet-template.pass/stamp.png");

  console.log("✅ Tampon rouge Fidélizen généré avec succès !");
}

generateStamp().catch(console.error);

import sharp from "sharp";

const input = "./wallet-template.pass/background.svg";
const output = "./wallet-template.pass/background@2x.png";

async function convert() {
  try {
    await sharp(input)
      .resize(1248, 624) // dimensions Apple Wallet @2x
      .png()
      .toFile(output);

    console.log("✅ Conversion réussie :", output);
  } catch (err) {
    console.error("❌ Erreur lors de la conversion :", err);
  }
}

convert();

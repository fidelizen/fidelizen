import https from "https";
import fs from "fs";
import path from "path";

/**
 * Envoie une notification Apple Wallet pour mettre à jour un pass.
 * 
 * @param {string} pushToken - Le token APNS de l’appareil Apple (depuis wallet_devices)
 * @param {string} passTypeIdentifier - Identifiant du type de pass (ex: pass.com.fidelizen.merchant)
 * @param {string} serialNumber - Numéro de série du pass à mettre à jour
 * @param {boolean} [sandbox=false] - Mode sandbox Apple
 */
export async function pushWalletUpdate(pushToken, passTypeIdentifier, serialNumber, sandbox = false) {
  try {
    const gateway = sandbox
      ? "gateway.sandbox.push.apple.com"
      : "gateway.push.apple.com";

    const options = {
      hostname: gateway,
      port: 2195,
      method: "POST",
      key: fs.readFileSync(path.join(process.cwd(), "certs/key.pem")),
      cert: fs.readFileSync(path.join(process.cwd(), "certs/push.pem")),
    };

    const req = https.request(options, (res) => {
      if (res.statusCode === 200) {
        console.log("✅ Notification Apple Wallet envoyée avec succès !");
      } else {
        console.error("⚠️ Échec de l’envoi de la notification :", res.statusCode);
      }
    });

    req.on("error", (err) => {
      console.error("❌ Erreur lors de la connexion à Apple :", err);
    });

    // Apple attend une ligne contenant le passTypeIdentifier + serialNumber
    // Format : {passTypeIdentifier} {serialNumber}\n
    req.write(`${passTypeIdentifier} ${serialNumber}\n`);
    req.end();

  } catch (err) {
    console.error("❌ Erreur dans pushWalletUpdate :", err);
  }
}

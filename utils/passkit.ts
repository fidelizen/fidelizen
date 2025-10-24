import { PKPass } from "passkit-generator";
import path from "path";
import fs from "fs";

export async function createPass(data: any) {
  const certDir = path.join(process.cwd(), "certs");
  const modelDir = path.join(process.cwd(), "wallet-template.pass");

  // ✅ Création du pass via la méthode moderne
  const pass = await PKPass.from(
    {
      model: modelDir,
      certificates: {
        wwdr: fs.readFileSync(path.join(certDir, "WWDR.pem")),
        signerCert: fs.readFileSync(path.join(certDir, "certificate.pem")),
        signerKey: fs.readFileSync(path.join(certDir, "key.pem")),
      },
    },
    data
  );

  return pass;
}

// utils/passkit.ts
import { PKPass } from 'passkit-generator';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Nécessaire car __dirname n'existe pas en ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ Types pour les données pass
export interface PassData {
  serialNumber: string;
  description: string;
  organizationName: string;
  logoText?: string;
  foregroundColor?: string;
  backgroundColor?: string;
  labelColor?: string;
  [key: string]: any; // pour champs additionnels dynamiques
}

// ✅ Génère un PKPass à partir d’un template .pass
export const createPassFromTemplate = async (
  templateDir: string,
  data: PassData
): Promise<PKPass> => {
  const certPath = process.env.PASSKIT_CERT_PATH!;
  const keyPath = process.env.PASSKIT_KEY_PATH!;
  const password = process.env.PASSKIT_KEY_PASSWORD!;

  // Lecture des fichiers de certificats
  const cert = fs.readFileSync(certPath);
  const key = fs.readFileSync(keyPath);

  // Chargement du template
  const templatePath = path.join(__dirname, templateDir);
  const template = fs.readFileSync(templatePath);

  // Création du pass
  const pass = new PKPass(template, data);

  // Configuration des certificats
  pass.setCertificate(cert);
  pass.setPrivateKey(key, password);

  // Exemple : ajout d’un champ personnalisé
  if (data.serialNumber) {
    pass.primaryFields.push({
      key: 'serial',
      label: 'Carte n°',
      value: data.serialNumber,
    });
  }

  return pass;
};

// types/qrcode.d.ts
// Déclaration de module pour "qrcode"
// Corrige les erreurs TypeScript sur Vercel :
// "Could not find a declaration file for module 'qrcode'"

declare module "qrcode" {
  interface QRCodeToDataURLOptions {
    errorCorrectionLevel?: "L" | "M" | "Q" | "H";
    margin?: number;
    scale?: number;
    color?: {
      dark?: string;
      light?: string;
    };
  }

  interface QRCode {
    toDataURL(text: string, options?: QRCodeToDataURLOptions): Promise<string>;
  }

  const QRCode: QRCode;
  export = QRCode;
}

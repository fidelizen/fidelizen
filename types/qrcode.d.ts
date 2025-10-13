// types/qrcode.d.ts
// Déclaration minimale pour le module 'qrcode' (correction build TypeScript)

declare module "qrcode" {
  type QRCodeOptions = Record<string, unknown>;
  interface QRCode {
    toDataURL(
      text: string,
      options?: QRCodeOptions
    ): Promise<string>;
  }
  const QRCode: QRCode;
  export = QRCode;
}

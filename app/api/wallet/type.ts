// app/api/wallet/types.ts

export interface WalletRegistration {
  deviceLibraryIdentifier: string;
  passTypeIdentifier: string;
  serialNumber: string;
  pushToken?: string;
}

export interface WalletLog {
  event: string;
  timestamp: string;
  deviceLibraryIdentifier?: string;
  serialNumber?: string;
}

export interface WalletPassResponse {
  status: number;
  body?: Buffer | string | object;
  headers?: Record<string, string>;
}

import * as QRcode from 'qrcode';

export interface QrCodeOptions {
  width?: number;
  margin?: number;
}

/**
 * Generate QR Code base64
 * @param data string yang ingin di encode (misal ticketCode atau wristbandCode)
 * @param options optional styling
 * @returns base64 image
 */

export async function generateQrCode(data: string, options?: QrCodeOptions) : Promise<string> {

    const qrOption = {
        width: options?.width || 256,
        margin: options?.margin || 4,
    }

  return QRcode.toDataURL(data, qrOption);
}

/**
 * Konfigurasi biaya resmi Xendit (2025)
 * Semua biaya belum termasuk PPN 11%
 */


export const XenditFeeConfig = {
  // Virtual Account (VA)
  virtual_accounts: {
    mandiri: 4000,
    bni: 4000,
    bri: 4000,
    permata: 4000,
    bsi: 4000,
    bss: 4000,
    bjb: 4000,
    cimb: 4000,
    bca_switcher: { note: 'BCA + 2000' },
    bca_aggregator: 4000,
    dbs_switcher: { note: 'DBS + 5000' },
  },

  // Kartu Kredit
  credit_card: {
    visa_mastercard: { percent: 0.029, flat: 2000 },
    jcb_amex: { note: 'Biaya Bank + 2000' },
  },

  // Retail Outlet
  retail_outlets: {
    alfamart: 5000,
  },

  // eWallets
  ewallets: {
    dana: { percent: 0.015 },
    astrapay: { percent: 0.015 },
    ovo: {
      local_non_digital: { percent: 0.015 },
      local_digital: { percent: 0.0273 },
      foreign_non_digital: { percent: 0.023 },
      foreign_digital: { percent: 0.0318 },
    },
    linkaja: {
      local_digital_gaming: { percent: 0.027 },
      foreign_digital_gaming: { percent: 0.0315 },
      other: { percent: 0.015 },
    },
    jeniuspay: { percent: 0.02 },
    shopeepay: {
      non_digital: { percent: 0.018 },
      digital: { percent: 0.036 },
    },
  },

  // QR Code (QRIS)
  qris: {
    percent: 0.0063,
  },

  // PayLater
  paylater: {
    kredivo: { percent: 0.023 },
    akulaku: { percent: 0.017 },
    uangme: { percent: 0.018 },
    indodana: { percent: 0.0175 },
    atome: { percent: 0.05 },
  },

  // Direct Debit
  direct_debit: {
    bri: { percent: 0.019 },
    bca_klikpay: { flat: 2500, note: 'Biaya Bank +' },
    mandiri: { flat: 4500 },
  },

  // Disbursement (kirim pembayaran)
  disbursements: {
    direct_bank: 2500,
    direct_ewallet: 2500,
    batch_bank: 2500,
    batch_ewallet: 2500,
  },

  // Pajak PPN 11%
  tax: {
    percent: 0.11,
  },
};

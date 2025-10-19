# Quick Install: QR Scanner

## 📦 Installation

```bash
cd frontend
npm install html5-qrcode
```

## ✅ What's Included

### Files Created:
1. `/frontend/src/components/QrScanner.tsx` - QR Scanner component
2. `/frontend/QR_SCANNER_SETUP.md` - Detailed documentation

### Files Updated:
1. `/frontend/src/app/redeem/page.tsx` - Added QR scan buttons for ticket & wristband
2. `/frontend/src/app/checkin/page.tsx` - Added QR scan button for wristband

## 🚀 Features

- ✅ **Scan QR Code** dengan camera device
- ✅ **Auto-fill input** setelah scan berhasil
- ✅ **Modern UI** dengan modal overlay
- ✅ **Error handling** untuk camera permission
- ✅ **Responsive design** untuk mobile & desktop

## 📱 Usage

### Redeem Page
- Klik tombol **Scan** (icon camera) di sebelah input Ticket Code
- Klik tombol **Scan** (icon camera) di sebelah input Wristband Code
- Arahkan camera ke QR code
- Input akan otomatis terisi setelah scan berhasil

### Check-in Page
- Klik tombol **Scan** (icon camera) di sebelah input Wristband Code
- Arahkan camera ke QR code
- Input akan otomatis terisi setelah scan berhasil

## ⚠️ Requirements

- **HTTPS** atau **localhost** (camera API requirement)
- **Camera permission** dari user
- **Modern browser** (Chrome 53+, Firefox 36+, Safari 11+)

## 🔧 Troubleshooting

**Camera tidak muncul?**
- Pastikan menggunakan HTTPS atau localhost
- Check browser permission untuk camera
- Pastikan device memiliki camera

**QR code tidak terdeteksi?**
- Pastikan pencahayaan cukup
- Jaga jarak 10-30cm dari camera
- Pastikan QR code dalam frame scan box

## 📖 Full Documentation

Lihat `/frontend/QR_SCANNER_SETUP.md` untuk dokumentasi lengkap.

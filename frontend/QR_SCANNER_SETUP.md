# QR Scanner Setup & Usage

Fitur QR Scanner untuk Redeem Ticket dan Check-in Wristband.

## Installation

Install library `html5-qrcode`:

```bash
cd frontend
npm install html5-qrcode
```

## Files Created

### 1. **QrScanner Component** (`/frontend/src/components/QrScanner.tsx`)

Reusable QR scanner component dengan fitur:
- Camera selection (prioritas back camera)
- Real-time QR code scanning
- Error handling
- Modal overlay dengan UI modern
- Responsive design

**Props:**
- `isOpen: boolean` - Control modal visibility
- `onScan: (decodedText: string) => void` - Callback saat QR berhasil di-scan
- `onClose: () => void` - Callback untuk close modal
- `label?: string` - Custom label untuk scanner (optional)

### 2. **Updated Pages**

#### Redeem Page (`/frontend/src/app/redeem/page.tsx`)
- ✅ Tombol scan untuk Ticket Code
- ✅ Tombol scan untuk Wristband Code
- ✅ Dynamic import QR Scanner (avoid SSR issues)
- ✅ State management untuk scanner

#### Check-in Page (`/frontend/src/app/checkin/page.tsx`)
- ✅ Tombol scan untuk Wristband Code
- ✅ Dynamic import QR Scanner
- ✅ Auto-fill input setelah scan

## Usage

### Redeem Page

```typescript
// State management
const [scannerOpen, setScannerOpen] = useState(false);
const [scanningFor, setScanningFor] = useState<'ticket' | 'wristband'>('ticket');

// Handler functions
const handleScanTicket = () => {
  setScanningFor('ticket');
  setScannerOpen(true);
};

const handleScanWristband = () => {
  setScanningFor('wristband');
  setScannerOpen(true);
};

const handleScanResult = (decodedText: string) => {
  if (scanningFor === 'ticket') {
    setTicketCode(decodedText);
  } else {
    setWristbandCode(decodedText);
  }
  setScannerOpen(false);
};

// QR Scanner Component
<QrScanner
  isOpen={scannerOpen}
  onScan={handleScanResult}
  onClose={() => setScannerOpen(false)}
  label={scanningFor === 'ticket' ? 'Scan Ticket QR Code' : 'Scan Wristband QR Code'}
/>
```

### Check-in Page

```typescript
// State management
const [scannerOpen, setScannerOpen] = useState(false);

// Handler functions
const handleScanWristband = () => {
  setScannerOpen(true);
};

const handleScanResult = (decodedText: string) => {
  setWristbandCode(decodedText);
  setScannerOpen(false);
};

// QR Scanner Component
<QrScanner
  isOpen={scannerOpen}
  onScan={handleScanResult}
  onClose={() => setScannerOpen(false)}
  label="Scan Wristband QR Code"
/>
```

## Features

### 1. **Camera Access**
- Automatic camera permission request
- Prefer back camera if available
- Fallback to front camera
- Error handling for no camera/permission denied

### 2. **QR Code Detection**
- Real-time scanning (10 FPS)
- 250x250px scan box
- Auto-stop after successful scan
- Continuous scanning until success

### 3. **UI/UX**
- Modal overlay dengan backdrop blur
- Modern gradient header
- Loading states
- Error messages dengan retry button
- Close button (X) di top-right
- Cancel button di footer

### 4. **Performance**
- Dynamic import untuk avoid SSR issues
- Proper cleanup on unmount
- Memory leak prevention

## Browser Compatibility

QR Scanner membutuhkan:
- ✅ HTTPS (atau localhost untuk development)
- ✅ Camera permission
- ✅ Modern browser dengan MediaDevices API support

**Supported Browsers:**
- Chrome/Edge 53+
- Firefox 36+
- Safari 11+
- Opera 40+

## Troubleshooting

### Camera Not Working

1. **Check HTTPS**: Camera API hanya bekerja di HTTPS atau localhost
2. **Check Permissions**: Pastikan user memberikan camera permission
3. **Check Browser**: Gunakan browser modern yang support MediaDevices API

### QR Code Not Detected

1. **Lighting**: Pastikan pencahayaan cukup
2. **Distance**: Jarak optimal 10-30cm dari camera
3. **Focus**: Pastikan QR code dalam frame scan box
4. **Quality**: QR code harus jelas dan tidak blur

### Build Errors

Jika ada error saat build:
```bash
# Clear cache dan reinstall
rm -rf node_modules .next
npm install
npm run build
```

## Example QR Code Format

QR Code harus berisi string code:
- **Ticket Code**: `TCK123ABC456`
- **Wristband Code**: `WB789XYZ012`

Format bebas, yang penting string yang di-scan sesuai dengan format code di database.

## Security Notes

- ✅ Camera access hanya saat scanner modal dibuka
- ✅ Camera otomatis di-stop saat modal ditutup
- ✅ No data stored/transmitted selain scan result
- ✅ Client-side processing only

## Future Enhancements

Possible improvements:
- [ ] Barcode support (selain QR code)
- [ ] Multiple QR code detection
- [ ] Scan history
- [ ] Sound/vibration feedback
- [ ] Torch/flashlight control
- [ ] Camera switch button (front/back)

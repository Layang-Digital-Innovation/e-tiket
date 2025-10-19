# Redeem & Check-in Module Documentation

## Overview
Module frontend untuk mengelola proses redeem ticket dan check-in wristband pada event. Module ini terdiri dari 2 halaman utama:
1. **Redeem Page** (`/redeem`) - Untuk menukar ticket code dengan wristband code
2. **Check-in Page** (`/checkin`) - Untuk check-in peserta menggunakan wristband code

## Arsitektur

### 1. Types & Interfaces
**File:** `frontend/src/types/index.ts`

#### Redeem Types
```typescript
export interface RedeemRequest {
  ticketCode: string;
  wristbandCode: string;
}

export interface RedeemResponse {
  message: string;
  ticketCode: string;
  wristbandCode: string;
}
```

#### Check-in Types
```typescript
export interface CheckInRequest {
  wristbandCode: string;
}

export interface CheckInResponse {
  message: string;
  wristbandCode: string;
  ticketCode: string;
  checkedInAt: string;
}
```

#### Wristband Types
```typescript
export interface Wristband {
  id: string;
  wristbandCode: string;
  status: 'unused' | 'assigned' | 'checked_in';
  assignedAt?: string;
  checkedInAt?: string;
  assignedTicket?: Ticket;
  event?: Event;
  category?: TicketCategory;
  createdAt: string;
  updatedAt: string;
}
```

#### Ticket Types
```typescript
export interface Ticket {
  id: string;
  ticketCode: string;
  status: 'unused' | 'redeemed' | 'checked_in';
  redeemedAt?: string;
  assignedWristband?: Wristband;
  orderItem?: OrderItemDetail;
  createdAt: string;
  updatedAt: string;
}
```

### 2. API Service
**File:** `frontend/src/services/api.ts`

#### Redeem API Methods
```typescript
// Redeem ticket ke wristband
async redeemTicket(redeemData: { ticketCode: string; wristbandCode: string })

// Get list wristband yang sudah assigned
async getRedeemList()

// Get redeem by ID
async getRedeemById(id: string)
```

#### Check-in API Methods
```typescript
// Check-in wristband
async checkIn(checkInData: { wristbandCode: string })

// Get list assigned wristbands
async getAssignedWristbands()
```

### 3. Custom Hooks

#### Redeem Hooks
**File:** `frontend/src/hooks/useRedeem.ts`

```typescript
// Hook untuk redeem ticket
useRedeemTicket() - Mutation hook untuk redeem ticket ke wristband

// Hook untuk get list redeem
useRedeemList() - Query hook untuk mendapatkan list wristband yang sudah assigned

// Hook untuk get redeem by ID
useRedeemById(id: string) - Query hook untuk mendapatkan detail redeem
```

#### Check-in Hooks
**File:** `frontend/src/hooks/useCheckIn.ts`

```typescript
// Hook untuk check-in
useCheckIn() - Mutation hook untuk check-in wristband

// Hook untuk get assigned wristbands
useAssignedWristbands() - Query hook untuk mendapatkan list wristband yang bisa di-checkin
```

## Halaman

### 1. Redeem Page (`/redeem`)
**File:** `frontend/src/app/redeem/page.tsx`

#### Fitur:
- **Form Redeem**
  - Input ticket code
  - Input wristband code
  - Validasi input
  - Success/error message
  - Loading state saat processing
  
- **Recent Redeems List**
  - Menampilkan list wristband yang sudah di-redeem
  - Informasi ticket yang terkait
  - Event dan category details
  - Timestamp assigned
  - Real-time update setelah redeem

#### Flow:
1. User memasukkan ticket code dan wristband code
2. Klik "Redeem Ticket"
3. System validasi:
   - Ticket harus status `UNUSED`
   - Wristband harus status `UNUSED`
4. Jika valid:
   - Ticket status → `REDEEMED`
   - Wristband status → `ASSIGNED`
   - Ticket dan wristband di-link
5. Success message ditampilkan
6. List recent redeems di-refresh

#### UI Components:
- Gradient background (blue to purple)
- Card-based layout
- Icon indicators (Ticket, Wristband, QrCode)
- Status badges
- Responsive design

### 2. Check-in Page (`/checkin`)
**File:** `frontend/src/app/checkin/page.tsx`

#### Fitur:
- **Form Check-in**
  - Input wristband code (dengan autofocus untuk scanner)
  - Validasi input
  - Success/error message dengan timestamp
  - Loading state saat processing
  
- **Statistics Dashboard**
  - Ready to Check-in count
  - Checked In count
  
- **Wristband Status List**
  - **Ready to Check-in Section**
    - Wristband dengan status `assigned`
    - Highlight blue
  - **Checked In Section**
    - Wristband dengan status `checked_in`
    - Highlight green
    - Timestamp check-in

#### Flow:
1. User scan atau input wristband code
2. Klik "Check-in" atau press Enter
3. System validasi:
   - Wristband harus sudah assigned ke ticket
   - Wristband belum checked in
   - Ticket belum checked in
4. Jika valid:
   - Wristband status → `CHECKED_IN`
   - Ticket status → `CHECKED_IN`
   - Timestamp check-in disimpan
5. Success message dengan detail check-in
6. List wristbands di-refresh
7. Statistics di-update

#### UI Components:
- Gradient background (green to blue)
- Card-based layout
- Icon indicators (Wristband, CheckCircle, Clock)
- Status badges dengan color coding
- Stats cards
- Responsive design
- Auto-scroll lists

## Backend Integration

### Redeem Endpoints
```
POST   /api/redeem              - Redeem ticket to wristband
GET    /api/redeem              - Get list of assigned wristbands
GET    /api/redeem/:id          - Get redeem by ID
```

### Check-in Endpoints
```
POST   /api/check-in            - Check-in wristband
GET    /api/check-in            - Get list of assigned wristbands
```

### Request/Response Examples

#### Redeem Request
```json
POST /api/redeem
{
  "ticketCode": "TKT-ABC123",
  "wristbandCode": "WB-XYZ789"
}
```

#### Redeem Response
```json
{
  "message": "Ticket successfully redeemed to wristband",
  "ticketCode": "TKT-ABC123",
  "wristbandCode": "WB-XYZ789"
}
```

#### Check-in Request
```json
POST /api/check-in
{
  "wristbandCode": "WB-XYZ789"
}
```

#### Check-in Response
```json
{
  "message": "Check-in successful",
  "wristbandCode": "WB-XYZ789",
  "ticketCode": "TKT-ABC123",
  "checkedInAt": "2024-10-19T13:00:00.000Z"
}
```

## Status Flow

### Ticket Status Flow
```
UNUSED → REDEEMED → CHECKED_IN
```

### Wristband Status Flow
```
UNUSED → ASSIGNED → CHECKED_IN
```

## Error Handling

### Redeem Errors
- **Ticket already redeemed or checked in**
  - Ticket sudah pernah di-redeem atau sudah checked in
  
- **Wristband already assigned**
  - Wristband sudah di-assign ke ticket lain

### Check-in Errors
- **Wristband not assigned to any ticket**
  - Wristband belum di-assign ke ticket
  
- **Wristband already checked in**
  - Wristband sudah pernah checked in
  
- **Ticket already checked in**
  - Ticket yang terkait sudah checked in

## Security & Authorization

### Redeem Page
- Memerlukan authentication (JWT)
- Hanya user dengan role `event_organizer` atau `admin` yang bisa akses
- Protected dengan `JwtAuthGuard` dan `RolesGuard`

### Check-in Page
- Bisa diakses tanpa authentication (untuk staff gate)
- Atau bisa ditambahkan simple PIN authentication untuk keamanan

## UI/UX Features

### Design System
- **Colors**
  - Redeem: Blue to Purple gradient
  - Check-in: Green to Blue gradient
  - Success: Green
  - Error: Red
  - Warning: Yellow

- **Icons** (Lucide React)
  - Ticket, Wristband, QrCode
  - CheckCircle, AlertCircle
  - Loader2, Clock

- **Typography**
  - Headers: Bold, 2xl-4xl
  - Body: Regular, sm-base
  - Labels: Medium, sm

### Responsive Design
- Mobile-first approach
- Grid layout: 1 column (mobile), 2 columns (desktop)
- Scrollable lists dengan max-height
- Touch-friendly buttons dan inputs

### User Experience
- Autofocus pada input untuk scanner
- Real-time validation
- Instant feedback (success/error messages)
- Auto-clear form setelah success
- Loading states untuk prevent double submission
- Smooth transitions dan animations

## Testing Checklist

### Redeem Page
- [ ] Form validation works
- [ ] Redeem ticket successfully
- [ ] Error handling untuk ticket sudah redeemed
- [ ] Error handling untuk wristband sudah assigned
- [ ] Recent redeems list updates real-time
- [ ] Loading states display correctly
- [ ] Responsive pada mobile

### Check-in Page
- [ ] Form validation works
- [ ] Check-in successfully
- [ ] Error handling untuk wristband belum assigned
- [ ] Error handling untuk sudah checked in
- [ ] Statistics update correctly
- [ ] Wristband lists update real-time
- [ ] Status badges display correctly
- [ ] Loading states display correctly
- [ ] Responsive pada mobile

## Future Enhancements

1. **QR Code Scanner Integration**
   - Integrate dengan camera untuk scan QR code
   - Auto-fill code dari hasil scan

2. **Offline Mode**
   - Cache data untuk offline operation
   - Sync when online

3. **Bulk Operations**
   - Bulk redeem multiple tickets
   - Bulk check-in

4. **Advanced Filtering**
   - Filter by event
   - Filter by category
   - Filter by date range
   - Search functionality

5. **Export Reports**
   - Export check-in data to CSV/Excel
   - Generate attendance reports

6. **Real-time Updates**
   - WebSocket integration untuk real-time updates
   - Live dashboard untuk monitoring

7. **Analytics Dashboard**
   - Check-in rate over time
   - Peak hours analysis
   - Category breakdown

8. **Multi-language Support**
   - i18n integration
   - Support Bahasa Indonesia & English

## Dependencies

```json
{
  "@tanstack/react-query": "^5.x",
  "axios": "^1.x",
  "date-fns": "^3.x",
  "lucide-react": "^0.x",
  "next": "^14.x",
  "react": "^18.x",
  "tailwindcss": "^3.x"
}
```

## File Structure

```
frontend/
├── src/
│   ├── app/
│   │   ├── redeem/
│   │   │   └── page.tsx          # Redeem page
│   │   └── checkin/
│   │       └── page.tsx          # Check-in page
│   ├── hooks/
│   │   ├── useRedeem.ts          # Redeem hooks
│   │   └── useCheckIn.ts         # Check-in hooks
│   ├── services/
│   │   └── api.ts                # API service (updated)
│   └── types/
│       └── index.ts              # Types (updated)
```

## Usage Examples

### Accessing Pages
```
http://localhost:3000/redeem      # Redeem page
http://localhost:3000/checkin     # Check-in page
```

### Using Hooks in Components
```typescript
import { useRedeemTicket } from '@/hooks/useRedeem';
import { useCheckIn } from '@/hooks/useCheckIn';

// In component
const redeemMutation = useRedeemTicket();
const checkInMutation = useCheckIn();

// Redeem
await redeemMutation.mutateAsync({
  ticketCode: 'TKT-123',
  wristbandCode: 'WB-456'
});

// Check-in
await checkInMutation.mutateAsync({
  wristbandCode: 'WB-456'
});
```

## Notes

- Module ini sudah terintegrasi dengan backend API yang ada
- Menggunakan React Query untuk state management dan caching
- Semua API calls menggunakan `withCredentials: true` untuk cookie-based auth
- Error handling sudah diimplementasikan di semua level
- UI menggunakan Tailwind CSS untuk styling
- Icons menggunakan Lucide React
- Date formatting menggunakan date-fns

## Support

Untuk pertanyaan atau issue, silakan hubungi tim development atau buat issue di repository.

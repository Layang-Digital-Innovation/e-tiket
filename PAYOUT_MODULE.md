# Modul Organizer Payout Management

**Versi:** 1.1  
**Tanggal:** 25 Oktober 2025  
**Penulis:** Mohammad Anjas Ferdiansyah

## 📋 Daftar Isi
1. [Latar Belakang](#latar-belakang)
2. [Tujuan](#tujuan)
3. [Peran Pengguna](#peran-pengguna)
4. [Alur Proses](#alur-proses)
5. [Entity & Database](#entity--database)
6. [API Endpoints](#api-endpoints)
7. [Contoh Implementasi](#contoh-implementasi)

---

## 🎯 Latar Belakang

Platform ini memungkinkan organizer menjual tiket event melalui sistem. Setelah penjualan berhasil dan pembayaran diterima (status PAID), dana tersebut menjadi hak organizer. Namun, pencairan (payout) baru dilakukan setelah diverifikasi dan disetujui oleh admin.

Modul Payout Organizer bertujuan menyediakan mekanisme transparan untuk:
- Menghitung total pendapatan tiket organizer
- Mengajukan payout
- Mencatat proses verifikasi admin

---

## 💡 Tujuan

1. **Visibilitas Pendapatan**: Memberi visibilitas kepada organizer tentang total hasil penjualan tiket mereka
2. **Sistem Request Payout**: Menyediakan sistem request payout yang diverifikasi secara manual oleh admin
3. **Keamanan & Auditability**: Menjamin keamanan dan auditability seluruh transaksi payout
4. **Simplifikasi Manajemen**: Menyederhanakan manajemen payout tanpa sistem saldo terpisah

---

## 👥 Peran Pengguna

| Role | Deskripsi | Akses |
|------|-----------|-------|
| **Organizer** | Pemilik event yang mengajukan pencairan hasil penjualan tiket | Melihat total pendapatan, mengajukan payout, memantau status payout |
| **Admin** | Pihak platform yang memverifikasi dan memproses payout | Melihat seluruh request payout, menyetujui atau menolak |

---

## 📊 Alur Proses

### a. Perhitungan Dinamis Pendapatan

```
Total Pendapatan Kotor = SUM(ticket.price) 
  WHERE ticket.status = 'PAID' 
  AND event.organizer_id = organizer_id
```

- Admin atau sistem dapat menghitung biaya platform/potongan (jika ada)
- Organizer melihat nilai total pendapatan bersih (setelah potongan)

### b. Pengajuan Payout

1. Organizer membuat request payout
   - Nominal yang disarankan sistem atau diinput manual ≤ total pendapatan
   - Data rekening bank dimasukkan atau menggunakan data yang sudah tersimpan
2. Request masuk ke panel admin dengan status `pending`

### c. Verifikasi dan Persetujuan Admin

Admin meninjau data payout dan memvalidasi nominal. Admin dapat:

- **Approve**: Payout dianggap sah, dana siap dikirim (status: `approved` → `paid`)
- **Reject**: Payout ditolak dengan alasan (status: `rejected`)

Jika disetujui, pencairan dapat dilakukan manual atau otomatis (fase 2 dengan integrasi API).

---

## 🗄️ Entity & Database

### Payout Entity

```typescript
@Entity('payouts')
export class Payout extends AuditEntity {
  id: string (UUID)
  organizer: User (ManyToOne)
  event?: Event (ManyToOne, nullable)
  
  // Nominal
  grossAmount: decimal (15,2)      // Total pendapatan kotor
  platformFee: decimal (15,2)      // Biaya platform
  netAmount: decimal (15,2)        // Pendapatan bersih
  
  // Status
  status: PayoutStatus             // pending | approved | rejected | paid | cancelled
  
  // Bank Details
  bankAccountName: string
  bankAccountNumber: string
  bankType: BankType              // bca | mandiri | bni | cimb | permata | other
  bankBranch?: string
  
  // Notes & Reason
  notes?: string
  rejectionReason?: string
  referenceNumber?: string
  
  // Timestamps
  approvedAt?: Date
  paidAt?: Date
  rejectedAt?: Date
  approvedBy?: User (ManyToOne)
  
  // Audit
  createdAt: Date
  updatedAt: Date
}
```

### PayoutStatus Enum

```typescript
enum PayoutStatus {
  PENDING = 'pending',      // Menunggu approval admin
  APPROVED = 'approved',    // Disetujui admin, siap dicairkan
  REJECTED = 'rejected',    // Ditolak admin
  PAID = 'paid',           // Sudah dicairkan
  CANCELLED = 'cancelled'  // Dibatalkan
}
```

### BankType Enum

```typescript
enum BankType {
  BCA = 'bca',
  MANDIRI = 'mandiri',
  BNI = 'bni',
  CIMB = 'cimb',
  PERMATA = 'permata',
  OTHER = 'other'
}
```

---

## 🔌 API Endpoints

### 1. Hitung Revenue Organizer

```http
GET /api/payouts/revenue?eventId=xxx
Authorization: Bearer {token}
```

**Query Parameters:**
- `eventId` (optional): Filter by specific event

**Response:**
```json
{
  "success": true,
  "data": {
    "revenue": 5000000
  }
}
```

---

### 2. Buat Request Payout

```http
POST /api/payouts
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "netAmount": 4500000,
  "bankAccountName": "PT Organizer Event",
  "bankAccountNumber": "1234567890",
  "bankType": "bca",
  "bankBranch": "Jakarta Pusat",
  "notes": "Payout untuk event Konser 2025",
  "eventId": "event-uuid-123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Payout request berhasil dibuat",
  "data": {
    "id": "payout-uuid-123",
    "organizer": { "id": "...", "firstName": "..." },
    "grossAmount": 5000000,
    "platformFee": 500000,
    "netAmount": 4500000,
    "status": "pending",
    "bankAccountName": "PT Organizer Event",
    "bankAccountNumber": "1234567890",
    "bankType": "bca",
    "createdAt": "2025-10-25T10:00:00Z"
  }
}
```

---

### 3. Dapatkan Payout Organizer

```http
GET /api/payouts/organizer/{organizerId}?status=pending
Authorization: Bearer {token}
```

**Query Parameters:**
- `status` (optional): Filter by status (pending, approved, rejected, paid, cancelled)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "payout-uuid-123",
      "organizer": { "id": "...", "firstName": "..." },
      "grossAmount": 5000000,
      "platformFee": 500000,
      "netAmount": 4500000,
      "status": "pending",
      "bankAccountName": "PT Organizer Event",
      "bankAccountNumber": "1234567890",
      "bankType": "bca",
      "createdAt": "2025-10-25T10:00:00Z"
    }
  ]
}
```

---

### 4. Dapatkan Semua Payout (Admin Only)

```http
GET /api/payouts?status=pending&organizerId=xxx
Authorization: Bearer {admin-token}
```

**Query Parameters:**
- `status` (optional): Filter by status
- `organizerId` (optional): Filter by organizer

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "payout-uuid-123",
      "organizer": { "id": "...", "firstName": "..." },
      "status": "pending",
      "netAmount": 4500000,
      "createdAt": "2025-10-25T10:00:00Z"
    }
  ]
}
```

---

### 5. Dapatkan Detail Payout

```http
GET /api/payouts/{payoutId}
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "payout-uuid-123",
    "organizer": { "id": "...", "firstName": "..." },
    "event": { "id": "...", "title": "..." },
    "grossAmount": 5000000,
    "platformFee": 500000,
    "netAmount": 4500000,
    "status": "pending",
    "bankAccountName": "PT Organizer Event",
    "bankAccountNumber": "1234567890",
    "bankType": "bca",
    "bankBranch": "Jakarta Pusat",
    "notes": "Payout untuk event Konser 2025",
    "createdAt": "2025-10-25T10:00:00Z"
  }
}
```

---

### 6. Approve Payout (Admin Only)

```http
PATCH /api/payouts/{payoutId}/approve
Authorization: Bearer {admin-token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "notes": "Approved - Transfer ke rekening sudah dilakukan",
  "referenceNumber": "TRF-20251025-001"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Payout berhasil diapprove",
  "data": {
    "id": "payout-uuid-123",
    "status": "approved",
    "approvedAt": "2025-10-25T11:00:00Z",
    "approvedBy": { "id": "admin-uuid", "firstName": "Admin" },
    "referenceNumber": "TRF-20251025-001"
  }
}
```

---

### 7. Reject Payout (Admin Only)

```http
PATCH /api/payouts/{payoutId}/reject
Authorization: Bearer {admin-token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "rejectionReason": "Nomor rekening tidak valid"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Payout berhasil ditolak",
  "data": {
    "id": "payout-uuid-123",
    "status": "rejected",
    "rejectedAt": "2025-10-25T11:00:00Z",
    "rejectionReason": "Nomor rekening tidak valid"
  }
}
```

---

### 8. Mark Payout as Paid (Admin Only)

```http
PATCH /api/payouts/{payoutId}/mark-paid
Authorization: Bearer {admin-token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "referenceNumber": "TRF-20251025-001"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Payout berhasil dimark sebagai paid",
  "data": {
    "id": "payout-uuid-123",
    "status": "paid",
    "paidAt": "2025-10-25T12:00:00Z",
    "referenceNumber": "TRF-20251025-001"
  }
}
```

---

### 9. Cancel Payout

```http
PATCH /api/payouts/{payoutId}/cancel
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "message": "Payout berhasil dibatalkan",
  "data": {
    "id": "payout-uuid-123",
    "status": "cancelled"
  }
}
```

---

## 🔐 Authorization

| Endpoint | Organizer | Admin | Unauthenticated |
|----------|-----------|-------|-----------------|
| GET /api/payouts/revenue | ✅ | ✅ | ❌ |
| POST /api/payouts | ✅ | ✅ | ❌ |
| GET /api/payouts/organizer/{id} | ✅ (own) | ✅ | ❌ |
| GET /api/payouts | ❌ | ✅ | ❌ |
| GET /api/payouts/{id} | ✅ (own) | ✅ | ❌ |
| PATCH /api/payouts/{id}/approve | ❌ | ✅ | ❌ |
| PATCH /api/payouts/{id}/reject | ❌ | ✅ | ❌ |
| PATCH /api/payouts/{id}/mark-paid | ❌ | ✅ | ❌ |
| PATCH /api/payouts/{id}/cancel | ✅ (own, pending) | ✅ | ❌ |

---

## 📝 Contoh Implementasi

### Organizer Flow

```
1. Organizer login
2. GET /api/payouts/revenue
   → Lihat total pendapatan: 5,000,000
3. POST /api/payouts
   → Buat request payout: 4,500,000
   → Status: pending
4. GET /api/payouts/organizer/{organizerId}
   → Monitor status payout
5. (Tunggu admin approval)
```

### Admin Flow

```
1. Admin login
2. GET /api/payouts?status=pending
   → Lihat semua pending payout requests
3. GET /api/payouts/{payoutId}
   → Review detail payout
4. PATCH /api/payouts/{payoutId}/approve
   → Approve payout
5. PATCH /api/payouts/{payoutId}/mark-paid
   → Mark sebagai paid setelah transfer manual
```

---

## 🔄 Status Transitions

```
PENDING
  ├─→ APPROVED (admin approve)
  ├─→ REJECTED (admin reject)
  └─→ CANCELLED (organizer cancel)

APPROVED
  ├─→ PAID (admin mark as paid)
  └─→ CANCELLED (admin cancel)

REJECTED
  └─→ (final state)

PAID
  └─→ (final state)

CANCELLED
  └─→ (final state)
```

---

## 🚀 Fase Pengembangan

### Phase 1 (Current)
- ✅ Entity & Database Schema
- ✅ CRUD Operations
- ✅ Manual Approval Flow
- ✅ Revenue Calculation

### Phase 2 (Future)
- 🔲 Integrasi Payment Gateway (Xendit, Doku, dll)
- 🔲 Automatic Transfer
- 🔲 Webhook untuk notifikasi
- 🔲 Batch Processing
- 🔲 Audit Log

### Phase 3 (Future)
- 🔲 Analytics & Reporting
- 🔲 Tax Calculation
- 🔲 Multi-currency Support
- 🔲 Scheduled Payouts

---

## 📞 Support

Untuk pertanyaan atau issue, hubungi tim development.

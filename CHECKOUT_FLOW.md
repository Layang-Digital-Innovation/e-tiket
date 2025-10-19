# Checkout Flow Documentation

## Overview
Sistem checkout untuk pembelian tiket event dengan 3 tahap:
1. **Pilih Tiket & Quantity** - Di halaman detail event
2. **Data Peserta** - Form untuk setiap peserta
3. **Data Pembeli** - Informasi pembeli untuk invoice
4. **Pembayaran** - Konfirmasi dan pembayaran

## Halaman yang Dibuat

### 1. `/events` - Halaman List Events Public
**File:** `frontend/src/app/events/page.tsx`

**Fitur:**
- Menampilkan semua event yang published
- Search bar untuk mencari event berdasarkan nama atau lokasi
- Card design yang menarik dengan informasi event
- Link ke halaman detail event

**Komponen:**
- Hero section dengan search
- Grid layout untuk event cards
- Loading skeleton
- Empty state

### 2. `/events/[slug]` - Halaman Detail Event
**File:** `frontend/src/app/events/[slug]/page.tsx`

**Fitur:**
- Informasi lengkap event (tanggal, lokasi, deskripsi)
- List ticket categories dengan harga
- Pilih quantity untuk setiap kategori tiket (max 10 per kategori)
- Real-time calculation total harga
- Order summary sidebar (sticky)
- Validasi stok tiket tersedia
- Button checkout yang menyimpan data ke sessionStorage

**Flow:**
1. User memilih kategori tiket dan quantity
2. Total harga dihitung otomatis
3. Klik "Lanjut ke Checkout" → redirect ke `/checkout/[slug]`
4. Data disimpan di sessionStorage

### 3. `/checkout/[slug]` - Halaman Checkout Multi-Step
**File:** `frontend/src/app/checkout/[slug]/page.tsx`

**Fitur:**
- Progress indicator untuk 3 steps
- Validasi form di setiap step
- Sticky order summary sidebar
- Navigation buttons (Back/Next)

#### Step 1: Data Peserta
- Form untuk setiap peserta sesuai jumlah tiket
- Field: Nama, Email, No. HP
- Menampilkan kategori tiket untuk setiap peserta
- Validasi required fields dan format email

#### Step 2: Data Pembeli
- Form data pembeli (untuk invoice dan pengiriman tiket)
- Field: Nama, Email, No. HP
- Info bahwa tiket akan dikirim ke email ini
- Validasi required fields dan format

#### Step 3: Pembayaran
- Ringkasan lengkap pesanan
- Detail tiket yang dibeli
- Total pembayaran
- Data pembeli
- Button "Konfirmasi Pesanan"
- Integrasi dengan API untuk create order

## API Integration

### Types & Interfaces
**File:** `frontend/src/types/index.ts`

Ditambahkan:
```typescript
- OrderItem
- AttendeeData
- CreateOrderRequest
- Order
- OrderItemDetail
- CheckoutState
```

### API Service
**File:** `frontend/src/services/api.ts`

Methods baru:
```typescript
- createOrder(orderData)
- getOrders(params)
- getOrder(id)
- getOrderByNumber(orderNumber)
```

### Custom Hooks
**File:** `frontend/src/hooks/useOrders.ts`

Hooks:
```typescript
- useOrders() - Get list orders
- useOrder(id) - Get order by ID
- useOrderByNumber(orderNumber) - Get by order number
- useCreateOrder() - Create new order mutation
```

## Data Flow

### 1. Event Selection
```
Homepage → /events → User browses events → Click event card
```

### 2. Ticket Selection
```
/events/[slug] → User selects tickets & quantity → Click "Lanjut ke Checkout"
→ Save to sessionStorage → Redirect to /checkout/[slug]
```

### 3. Checkout Process
```
/checkout/[slug] Step 1 → Fill attendee data → Validate → Next
→ Step 2 → Fill buyer data → Validate → Next
→ Step 3 → Review & Confirm → Submit order → API call
→ Success → Clear sessionStorage → Redirect to /events
```

## SessionStorage Structure

```json
{
  "eventId": "uuid",
  "eventSlug": "event-slug",
  "selectedTickets": {
    "categoryId1": 2,
    "categoryId2": 1
  },
  "currentStep": 1
}
```

## Backend Integration Required

Untuk menyelesaikan flow ini, backend perlu menyediakan endpoint:

### Order Endpoints
```
POST   /api/order              - Create new order
GET    /api/order              - Get user orders
GET    /api/order/:id          - Get order by ID
GET    /api/order/number/:num  - Get order by number
PATCH  /api/order/:id/payment  - Update payment status
```

### Order Request Body
```json
{
  "eventId": "uuid",
  "items": [
    {
      "ticketCategoryId": "uuid",
      "quantity": 2,
      "unitPrice": 150000
    }
  ],
  "attendees": [
    {
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "08123456789",
      "ticketCategoryId": "uuid"
    }
  ],
  "buyerName": "Jane Doe",
  "buyerEmail": "jane@example.com",
  "buyerPhone": "08987654321"
}
```

## UI/UX Features

### Design
- Modern, clean interface dengan Tailwind CSS
- Responsive design (mobile-first)
- Loading states & skeletons
- Error handling dengan user-friendly messages
- Smooth transitions & animations

### User Experience
- Clear progress indicator
- Real-time validation
- Sticky order summary untuk easy reference
- Back navigation support
- Auto-save to sessionStorage (prevent data loss)
- Disabled states untuk prevent double submission

## Next Steps / Improvements

1. **Payment Integration**
   - Integrate payment gateway (Midtrans, Xendit, etc.)
   - Payment proof upload
   - Payment status tracking

2. **Order Confirmation Page**
   - Success page dengan order details
   - Download/print invoice
   - QR code untuk tiket

3. **Email Notifications**
   - Order confirmation email
   - E-ticket delivery
   - Payment reminder

4. **User Dashboard**
   - My Orders page
   - Order history
   - Ticket management

5. **Enhanced Features**
   - Promo code support
   - Multiple payment methods
   - Save buyer info for faster checkout
   - Guest checkout vs logged-in user

## Testing Checklist

- [ ] Event list loads correctly
- [ ] Event detail shows all information
- [ ] Ticket selection works (add/remove)
- [ ] Total calculation is accurate
- [ ] Checkout data persists in sessionStorage
- [ ] Form validation works on all steps
- [ ] Back/Next navigation works
- [ ] Order submission successful
- [ ] Error handling works
- [ ] Responsive on mobile devices
- [ ] Loading states display correctly

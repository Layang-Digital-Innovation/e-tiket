# Redeem API Endpoints

API endpoints untuk redeem ticket dan mengelola wristband assignments.

## Endpoints

### 1. POST `/api/redeem` - Redeem Ticket to Wristband

Menukar ticket code dengan wristband code.

**Authentication:** Required (JWT)

**Request Body:**
```json
{
  "ticketCode": "ABC123XYZ",
  "wristbandCode": "WB456DEF"
}
```

**Response:**
```json
{
  "message": "Ticket successfully redeemed to wristband",
  "ticketCode": "ABC123XYZ",
  "wristbandCode": "WB456DEF"
}
```

**Error Cases:**
- `400 Bad Request` - Ticket already redeemed or checked in
- `400 Bad Request` - Wristband already assigned
- `404 Not Found` - Ticket or wristband not found

---

### 2. GET `/api/redeem` - Get Redeem List

Mendapatkan list semua wristband yang sudah di-assign (status: ASSIGNED).

**Authentication:** Required (JWT)

**Response:**
```json
[
  {
    "id": "uuid",
    "wristbandCode": "WB456DEF",
    "status": "assigned",
    "assignedAt": "2024-01-15T10:30:00Z",
    "assignedTicket": {
      "id": "uuid",
      "ticketCode": "ABC123XYZ",
      "status": "redeemed"
    },
    "event": {
      "id": "uuid",
      "title": "Music Festival 2024",
      "slug": "music-festival-2024"
    },
    "category": {
      "id": "uuid",
      "name": "VIP",
      "price": 500000
    }
  }
]
```

---

### 3. GET `/api/redeem/:id` - Get Redeem by ID

Mendapatkan detail wristband yang sudah di-assign berdasarkan ID.

**Authentication:** Required (JWT)

**Response:**
```json
{
  "id": "uuid",
  "wristbandCode": "WB456DEF",
  "status": "assigned",
  "assignedAt": "2024-01-15T10:30:00Z",
  "assignedTicket": {
    "id": "uuid",
    "ticketCode": "ABC123XYZ",
    "status": "redeemed"
  },
  "event": {
    "id": "uuid",
    "title": "Music Festival 2024"
  },
  "category": {
    "id": "uuid",
    "name": "VIP"
  }
}
```

---

## Status Flow

### Ticket Status:
- `unused` → `redeemed` (saat redeem)
- `redeemed` → `checked_in` (saat check-in)

### Wristband Status:
- `unused` → `assigned` (saat redeem)
- `assigned` → `checked_in` (saat check-in)

---

## Frontend Integration

### Hooks Available:

```typescript
// Redeem ticket
const redeemMutation = useRedeemTicket();
await redeemMutation.mutateAsync({
  ticketCode: 'ABC123',
  wristbandCode: 'WB456'
});

// Get redeem list
const { data: redeemList } = useRedeemList();
```

### API Service Methods:

```typescript
// Redeem ticket
await apiService.redeemTicket({
  ticketCode: 'ABC123',
  wristbandCode: 'WB456'
});

// Get redeem list
const wristbands = await apiService.getRedeemList();

// Get by ID
const wristband = await apiService.getRedeemById('uuid');
```

# 🎫 Redeem & Check-in Flow by Strategy

## 📋 Alur Lengkap

### **Phase 1: Generate Test Data**
```bash
POST /api/ticket/test/generate?categoryId=<UUID>&quantity=5
```
Response: Tickets dengan eventId dan ticketCategoryId

---

### **Phase 2: Generate Redeem Items (Bulk)**
```bash
POST /api/redeem/generate-items
{
  "ticketCategoryId": "<UUID>",
  "quantity": 5
}
```
Response: Redeem items dengan status `GENERATED`

---

### **Phase 3: Assign Redeem Item ke Ticket**
```bash
POST /api/redeem/assign
{
  "ticketCode": "TKT-CRHBYDSBZN",
  "itemCode": "PU6XP1U45L",
  "eventId": "<UUID>"
}
```
Response: Assignment success

**Status Changes:**
- Ticket: `UNUSED` → `REDEEMED`
- RedeemItem: `GENERATED` → `ASSIGNED`

---

### **Phase 4: Check-in (Berdasarkan Strategi)**

#### **A. WRISTBAND / BIB Strategy - Scan ItemCode**
```bash
POST /api/check-in
{
  "itemCode": "PU6XP1U45L"
}
```

**Response:**
```json
{
  "message": "Check-in successful",
  "itemCode": "PU6XP1U45L",
  "ticketCode": "TKT-CRHBYDSBZN",
  "checkedInAt": "2024-11-07T08:30:00Z"
}
```

**Status Changes:**
- Ticket: `REDEEMED` → `CHECKED_IN`
- RedeemItem: `ASSIGNED` → `CHECKED_IN`

---

#### **B. NONE Strategy - Scan TicketCode**
```bash
POST /api/check-in
{
  "ticketCode": "TKT-CRHBYDSBZN"
}
```

**Response:**
```json
{
  "message": "Check-in successful",
  "ticketCode": "TKT-CRHBYDSBZN",
  "checkedInAt": "2024-11-07T08:30:00Z"
}
```

**Status Changes:**
- Ticket: `UNUSED` → `CHECKED_IN` (langsung, tanpa redeem)

---

#### **C. Legacy - Scan WristbandCode**
```bash
POST /api/check-in
{
  "wristbandCode": "WB-123456"
}
```

---

## 🔄 Status Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│           WRISTBAND / BIB STRATEGY                          │
└─────────────────────────────────────────────────────────────┘

Ticket:
  UNUSED ──[Assign]──> REDEEMED ──[Check-in]──> CHECKED_IN

RedeemItem:
  GENERATED ──[Assign]──> ASSIGNED ──[Check-in]──> CHECKED_IN

┌─────────────────────────────────────────────────────────────┐
│              NONE STRATEGY                                  │
└─────────────────────────────────────────────────────────────┘

Ticket:
  UNUSED ──[Check-in]──> CHECKED_IN

RedeemItem: (tidak ada)
  -

```

---

## 🧪 Testing Checklist

### **WRISTBAND/BIB Strategy:**
- [ ] Generate test tickets
- [ ] Generate redeem items
- [ ] Assign redeem item ke ticket
- [ ] Check-in dengan itemCode
- [ ] Verify ticket status: UNUSED → REDEEMED → CHECKED_IN
- [ ] Verify redeem item status: GENERATED → ASSIGNED → CHECKED_IN

### **NONE Strategy:**
- [ ] Generate test tickets
- [ ] Check-in langsung dengan ticketCode
- [ ] Verify ticket status: UNUSED → CHECKED_IN
- [ ] Verify tidak ada redeem item

### **Error Cases:**
- [ ] Check-in dengan itemCode yang tidak ada
- [ ] Check-in dengan itemCode yang sudah di-check-in
- [ ] Check-in dengan ticketCode yang sudah di-check-in
- [ ] Assign itemCode yang sudah di-assign
- [ ] Assign itemCode ke ticket yang sudah redeemed

---

## 📊 Check-in Service Methods

### **1. checkIn(checkInDto)**
Main entry point yang auto-detect tipe check-in:
- Jika ada `itemCode` → `checkInByItemCode()`
- Jika ada `ticketCode` → `checkInByTicketCode()`
- Jika ada `wristbandCode` → `checkInByWristband()` (legacy)

### **2. checkInByItemCode(itemCode)**
- Find RedeemItem by itemCode
- Validate status: ASSIGNED
- Update: ASSIGNED → CHECKED_IN
- Update ticket: REDEEMED → CHECKED_IN

### **3. checkInByTicketCode(ticketCode)**
- Find Ticket by ticketCode
- Validate status: UNUSED (untuk NONE strategy)
- Update ticket: UNUSED → CHECKED_IN
- Tidak ada redeem item

### **4. checkInByWristband(checkInDto)**
- Legacy method untuk backward compatibility
- Find Wristband by wristbandCode
- Update wristband dan ticket status

---

## 🎯 API Endpoints Summary

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/ticket/test/generate` | Generate test tickets |
| POST | `/api/redeem/generate-items` | Generate redeem items |
| POST | `/api/redeem/assign` | Assign item ke ticket |
| POST | `/api/check-in` | Check-in (auto-detect strategy) |
| GET | `/api/check-in/event/:eventId` | Get check-in list |

---

## 🔐 Authorization

- **Organizer**: Can check-in for own events only
- **Admin**: Can check-in for any event
- Check-in tanpa auth: Bisa untuk public check-in

---

## 📝 Notes

1. **Atomic Transactions**: Semua operasi menggunakan database transactions
2. **Strategy Detection**: Check-in auto-detect berdasarkan input (itemCode/ticketCode/wristbandCode)
3. **Status Validation**: Semua status changes di-validate sebelum update
4. **Error Handling**: Detailed error messages untuk debugging

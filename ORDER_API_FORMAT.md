# Order API Format

## Request Body Structure

### POST /api/order

```json
{
  "buyerFullName": "Yogasara",
  "buyerEmail": "anjasferdiansyah123@gmail.com",
  "buyerIdentityType": "KTP",  // Optional
  "buyerIdentityNumber": "3175012309870001",  // Optional
  "buyerPhoneNumber": "+6281234567890",
  "items": [
    {
      "categoryId": "90ed3fac-edce-4a1b-9085-18fabc6d9dfa",
      "quantity": 1,
      "detailAtendee": [
        {
          "fullName": "Siti Aminah",
          "email": "mohammadanjas82@gmail.com",
          "phoneNumber": "+628123000001",
          "identityType": "KTP",  // Optional
          "identityNumber": "3212234211990002"  // Optional
        }
      ]
    }
  ]
}
```

## TypeScript Interfaces

### AttendeeDetail
```typescript
export interface AttendeeDetail {
  fullName: string;
  email: string;
  phoneNumber: string;
  identityType?: string;      // Optional
  identityNumber?: string;    // Optional
}
```

### OrderItem
```typescript
export interface OrderItem {
  categoryId: string;          // UUID of ticket category
  quantity: number;            // Number of tickets
  detailAtendee: AttendeeDetail[];  // Array of attendee details
}
```

### CreateOrderRequest
```typescript
export interface CreateOrderRequest {
  buyerFullName: string;
  buyerEmail: string;
  buyerIdentityType?: string;     // Optional (KTP, SIM, Passport, etc.)
  buyerIdentityNumber?: string;   // Optional
  buyerPhoneNumber: string;
  items: OrderItem[];
}
```

## Notes

1. **identityType** dan **identityNumber** adalah **optional** untuk buyer dan attendee
2. **quantity** di OrderItem harus sama dengan jumlah element di **detailAtendee** array
3. Setiap attendee harus memiliki **fullName**, **email**, dan **phoneNumber** (required)
4. **categoryId** menggunakan UUID format
5. Phone number format: `+62` prefix untuk Indonesia

## Example with Multiple Categories

```json
{
  "buyerFullName": "John Doe",
  "buyerEmail": "john@example.com",
  "buyerPhoneNumber": "+6281234567890",
  "items": [
    {
      "categoryId": "uuid-category-vip",
      "quantity": 2,
      "detailAtendee": [
        {
          "fullName": "Person 1",
          "email": "person1@example.com",
          "phoneNumber": "+6281111111111"
        },
        {
          "fullName": "Person 2",
          "email": "person2@example.com",
          "phoneNumber": "+6282222222222"
        }
      ]
    },
    {
      "categoryId": "uuid-category-regular",
      "quantity": 1,
      "detailAtendee": [
        {
          "fullName": "Person 3",
          "email": "person3@example.com",
          "phoneNumber": "+6283333333333"
        }
      ]
    }
  ]
}
```

## Frontend Implementation

File: `frontend/src/app/checkout/[slug]/page.tsx`

The checkout page automatically:
1. Groups attendees by ticket category
2. Converts internal `AttendeeData` format to `AttendeeDetail` format
3. Creates proper `OrderItem` structure with `detailAtendee` array
4. Submits to backend with correct format

## Migration from Old Format

### Old Format (Deprecated)
```typescript
{
  eventId: string;
  items: [{ ticketCategoryId, quantity, unitPrice }];
  attendees: [{ name, email, phone, ticketCategoryId }];
  buyerName: string;
  buyerEmail: string;
  buyerPhone: string;
}
```

### New Format (Current)
```typescript
{
  buyerFullName: string;
  buyerEmail: string;
  buyerPhoneNumber: string;
  buyerIdentityType?: string;
  buyerIdentityNumber?: string;
  items: [{
    categoryId: string;
    quantity: number;
    detailAtendee: [{
      fullName: string;
      email: string;
      phoneNumber: string;
      identityType?: string;
      identityNumber?: string;
    }]
  }]
}
```

## Key Changes

1. ✅ Removed `eventId` from request (backend can get from categoryId)
2. ✅ Removed `unitPrice` from items (backend calculates from category)
3. ✅ Changed `ticketCategoryId` → `categoryId`
4. ✅ Changed `buyerName` → `buyerFullName`
5. ✅ Changed `buyerPhone` → `buyerPhoneNumber`
6. ✅ Attendees now nested inside each item as `detailAtendee`
7. ✅ Added optional identity fields for buyer and attendees
8. ✅ Changed attendee field names to match backend format

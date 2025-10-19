# Auto Update Base Price Feature

## Overview
Fitur ini secara otomatis mengupdate kolom `basePrice` pada tabel `events` dengan harga termurah dari semua ticket categories yang terkait dengan event tersebut.

## Cara Kerja

### Automatic Update
BasePrice akan otomatis diupdate ketika:

1. **Ticket Category Dibuat** - Saat ticket category baru dibuat, sistem akan menghitung ulang basePrice
2. **Ticket Category Diupdate** - Saat harga ticket category diubah, basePrice akan diupdate
3. **Ticket Category Dihapus** - Saat ticket category dihapus, basePrice akan dihitung ulang dari sisa ticket categories

### Logic
- Jika event memiliki ticket categories, `basePrice` = harga termurah dari semua ticket categories
- Jika event tidak memiliki ticket categories, `basePrice` = 0

## Implementation

### Backend Services

#### EventsService (`events.service.ts`)
```typescript
async updateBasePrice(eventId: string): Promise<void> {
  const ticketCategories = await this.ticketCategoriesRepository.find({
    where: { eventId },
  });

  if (ticketCategories.length === 0) {
    await this.eventsRepository.update(eventId, { basePrice: 0 });
    return;
  }

  const minPrice = Math.min(...ticketCategories.map(tc => tc.price));
  await this.eventsRepository.update(eventId, { basePrice: minPrice });
}
```

#### TicketCategoriesService (`ticket_categories.service.ts`)
Service ini memanggil `updateBasePrice` pada:
- `create()` - Setelah ticket category dibuat
- `update()` - Setelah harga ticket category diupdate
- `remove()` - Setelah ticket category dihapus

## Manual Update Script

Untuk mengupdate basePrice pada semua event yang sudah ada:

```bash
cd backend
npm run script:update-base-prices
```

Script ini akan:
1. Mengambil semua event dari database
2. Menghitung harga termurah dari ticket categories masing-masing event
3. Mengupdate kolom `basePrice` untuk setiap event

## Database Schema

```sql
-- Column basePrice pada tabel events
basePrice DECIMAL(10, 2) DEFAULT 0
```

## Example Usage

### Frontend Display
```typescript
// Menampilkan harga mulai dari
const event = await getEvent(eventId);
console.log(`Harga mulai dari: ${formatCurrency(event.basePrice)}`);
// Output: "Harga mulai dari: Rp 150.000"
```

### API Response
```json
{
  "id": "event-123",
  "title": "Tech Conference 2025",
  "basePrice": 150000,
  "ticketCategories": [
    { "name": "Regular", "price": 150000 },
    { "name": "VIP", "price": 500000 },
    { "name": "VVIP", "price": 1000000 }
  ]
}
```

## Benefits

1. **Performance** - Tidak perlu query ticket categories setiap kali ingin menampilkan harga mulai dari
2. **Consistency** - BasePrice selalu sinkron dengan harga ticket categories
3. **User Experience** - User langsung melihat harga mulai dari di list events
4. **SEO Friendly** - Harga dapat diindex oleh search engine

## Logging

Service akan log setiap update basePrice:
```
💰 Updated event basePrice for event {eventId}
```

## Error Handling

- Jika event tidak ditemukan, akan throw `NotFoundException`
- Jika terjadi error saat update, akan throw `BadRequestException`
- Transaction rollback otomatis jika terjadi error

## Testing

Untuk test fitur ini:

1. Buat event baru
2. Tambahkan ticket category dengan harga 100.000
3. Check basePrice event (harus 100.000)
4. Tambahkan ticket category dengan harga 50.000
5. Check basePrice event (harus 50.000)
6. Hapus ticket category 50.000
7. Check basePrice event (harus kembali ke 100.000)
8. Hapus semua ticket categories
9. Check basePrice event (harus 0)

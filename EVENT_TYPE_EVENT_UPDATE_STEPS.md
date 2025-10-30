# ✅ Langkah Perubahan Modul Event (Event Type & Redeem Strategy)

Dokumen ini merinci langkah demi langkah untuk menambahkan dukungan **Event Type** dan **Redeem Strategy** pada modul Event. Fokus hanya pada perubahan yang berkaitan langsung dengan manajemen event; modul Redeem/Check-in akan ditangani terpisah.

---

## 1. 🗄️ Database & Entity

### 1.1 Tambah Kolom pada Entity `Event`
File: `backend/src/events/entities/event.entity.ts`

1. Import enum baru (nanti didefinisikan di langkah 1.2):
   ```typescript
   import { EventType, RedeemStrategy } from '../enums/event.enums';
   ```
2. Tambahkan kolom baru pada `@Entity()`:
   ```typescript
   @Column({
     type: 'enum',
     enum: EventType,
     default: EventType.CONCERT,
   })
   eventType: EventType;

   @Column({
     type: 'enum',
     enum: RedeemStrategy,
     default: RedeemStrategy.WRISTBAND,
   })
   redeemStrategy: RedeemStrategy;
   ```

### 1.2 Buat Enum Event
File: `backend/src/events/enums/event.enums.ts`

```typescript
export enum EventType {
  CONCERT = 'CONCERT',
  RUNNING = 'RUNNING',
  SEMINAR = 'SEMINAR',
  WORKSHOP = 'WORKSHOP',
  CONFERENCE = 'CONFERENCE',
}

export enum RedeemStrategy {
  WRISTBAND = 'WRISTBAND',
  BIB = 'BIB',
  CERTIFICATE = 'CERTIFICATE',
  NONE = 'NONE',
}
```

### 1.3 Buat Migration Tambahan Kolom
1. Jalankan CLI TypeORM/Nest untuk generate migration:
   ```bash
   npx typeorm migration:generate src/migrations/AddEventTypeToEvents
   ```
2. Pastikan migration menambahkan kolom enum `event_type` & `redeem_strategy` dengan default nilai.
3. (Opsional) Tambahkan index jika dibutuhkan query berdasarkan event type.
4. Jalankan migration:
   ```bash
   npx typeorm migration:run
   ```

---

## 2. 📥 DTO & Validation

### 2.1 Update `CreateEventDto`
File: `backend/src/events/dto/create-event.dto.ts`

1. Import enum:
   ```typescript
   import { EventType, RedeemStrategy } from '../enums/event.enums';
   ```
2. Tambahkan field dengan validasi:
   ```typescript
   @IsEnum(EventType)
   eventType: EventType;

   @IsEnum(RedeemStrategy)
   redeemStrategy: RedeemStrategy;
   ```
3. Jika ingin auto-map redeem strategy dari event type, sementara tetap biarkan input manual (mapping bisa di service).

### 2.2 Update `UpdateEventDto`
File: `backend/src/events/dto/update-event.dto.ts`

Tambahkan field opsional:
```typescript
@IsEnum(EventType)
@IsOptional()
eventType?: EventType;

@IsEnum(RedeemStrategy)
@IsOptional()
redeemStrategy?: RedeemStrategy;
```

---

## 3. 🧠 Service Logic

### 3.1 EventService - Create
File: `backend/src/events/events.service.ts`

1. Saat create event, set `eventType` & `redeemStrategy` dari DTO.
2. (Opsional) Implementasi mapping otomatis:
   ```typescript
   const defaultStrategy = this.getDefaultRedeemStrategy(createEventDto.eventType);
   const event = this.eventRepository.create({
     ...createEventDto,
     redeemStrategy: createEventDto.redeemStrategy ?? defaultStrategy,
   });
   ```
3. Tambahkan helper `getDefaultRedeemStrategy(eventType: EventType): RedeemStrategy`.

### 3.2 EventService - Update
- Pastikan method `update` meng-handle perubahan `eventType` dan `redeemStrategy`.
- Tambahkan validasi: jika eventType berubah, `redeemStrategy` otomatis disesuaikan kecuali user override.

---

## 4. 🎮 Controller & Response

### 4.1 EventController - Create & Update
File: `backend/src/events/events.controller.ts`

- Pastikan endpoint `POST /events` dan `PATCH /events/:id` menerima field baru.
- Tambahkan dokumentasi di Swagger (jika menggunakan `@ApiProperty`).

### 4.2 Response DTO / Serializer
- Pastikan response event (misal `EventResponseDto`) menyertakan `eventType` & `redeemStrategy`.
- Update mapper yang mengubah entity → response.

---

## 5. 🌱 Seeder / Sample Data (Opsional)
- Update seeder event agar menyertakan `eventType` dan `redeemStrategy`.
- Gunakan kombinasi realistis (Concert → Wristband, Running → Bib, Seminar → None).

---

## 6. 🧪 Testing Checklist
- [ ] Unit test EventService create/update dengan eventType & redeemStrategy.
- [ ] Integration test endpoint `POST /events` & `PATCH /events/:id`.
- [ ] Migration test (up & down) berjalan tanpa error.

---

## 7. 📌 TODO Summary
1. Tambahkan enum `EventType` & `RedeemStrategy`.
2. Update entity `Event` dengan kolom enum baru.
3. Generate & jalankan migration.
4. Update DTO (`CreateEventDto`, `UpdateEventDto`).
5. Update `EventService` (create/update logic & mapping default strategy).
6. Update controller & response DTO.
7. Opsional: update seeder & tests.

Setelah langkah di atas selesai, modul Event siap mendukung dynamic redeem/check-in yang akan diimplementasikan pada langkah berikutnya.

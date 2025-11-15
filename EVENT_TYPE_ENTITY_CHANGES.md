# 🧱 Entity Updates & Additions for Event Type Module

Panduan ini merangkum entity yang perlu **diupdate** dan **ditambahkan** untuk mendukung Event Type serta alur redeem/check-in dinamis.

---

## 1. ✏️ Entity yang Diperbarui

### 1.1 `Event`
@backend/src/events/entities/event.entity.ts

- ✅ Sudah ditambahkan kolom enum:
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
- Relasi tambahan (opsional, setelah entity baru dibuat):
  ```typescript
  @OneToMany(() => RedeemItem, (item) => item.event)
  redeemItems: RedeemItem[];

  @OneToMany(() => CheckInRecord, (record) => record.event)
  checkInRecords: CheckInRecord[];
  ```

> ✅ Langkah selanjutnya: generate migration untuk kolom baru & update DTO/service/controller.

---

## 2. ➕ Entity Baru yang Harus Dibuat

### 2.1 `RedeemItem`
**Lokasi:** `backend/src/redeem/entities/redeem-item.entity.ts`

```typescript
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToOne,
} from 'typeorm';
import { Event } from '../../events/entities/event.entity';
import { Ticket } from '../../tickets/entities/ticket.entity';
import { User } from '../../users/entities/user.entity';
import { AuditEntity } from '../../common/entities/audit.entity';
import { RedeemItemType, RedeemItemStatus } from '../enums/redeem-item.enums';

@Entity('redeem_items')
export class RedeemItem extends AuditEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Event, (event) => event.redeemItems, { eager: true })
  @JoinColumn({ name: 'event_id' })
  event: Event;

  @OneToOne(() => Ticket, (ticket) => ticket.redeemItem, { eager: true })
  @JoinColumn({ name: 'ticket_id' })
  ticket: Ticket;

  @Column({
    type: 'enum',
    enum: RedeemItemType,
  })
  itemType: RedeemItemType;

  @Column({ name: 'item_code', unique: true })
  itemCode: string;

  @Column({ name: 'item_qr_code', type: 'text', nullable: true })
  itemQrCode?: string;

  @Column({
    type: 'enum',
    enum: RedeemItemStatus,
    default: RedeemItemStatus.GENERATED,
  })
  status: RedeemItemStatus;

  @Column({ name: 'checked_in_at', type: 'timestamp', nullable: true })
  checkedInAt?: Date;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'checked_in_by_id' })
  checkedInBy?: User;

  @Column({ name: 'check_in_location', nullable: true })
  checkInLocation?: string;
}
```

### 2.2 `CheckInRecord`
**Lokasi:** `backend/src/check-in/entities/check-in-record.entity.ts`

```typescript
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Event } from '../../events/entities/event.entity';
import { RedeemItem } from '../../redeem/entities/redeem-item.entity';
import { Ticket } from '../../tickets/entities/ticket.entity';
import { User } from '../../users/entities/user.entity';
import { Attendee } from '../../attendees/entities/attendee.entity';
import { AuditEntity } from '../../common/entities/audit.entity';
import { CheckInType } from '../enums/check-in.enums';

@Entity('check_in_records')
export class CheckInRecord extends AuditEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Event, (event) => event.checkInRecords)
  @JoinColumn({ name: 'event_id' })
  event: Event;

  @ManyToOne(() => RedeemItem, { nullable: true })
  @JoinColumn({ name: 'redeem_item_id' })
  redeemItem?: RedeemItem;

  @ManyToOne(() => Ticket, { nullable: true })
  @JoinColumn({ name: 'ticket_id' })
  ticket?: Ticket;

  @Column({
    type: 'enum',
    enum: CheckInType,
  })
  checkInType: CheckInType;

  @Column({ name: 'check_in_code' })
  checkInCode: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'checked_in_by_id' })
  checkedInBy: User;

  @ManyToOne(() => Attendee, { nullable: true })
  @JoinColumn({ name: 'attendee_id' })
  attendee?: Attendee;

  @Column({ name: 'check_in_location', nullable: true })
  checkInLocation?: string;

  @Column({ name: 'checked_in_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  checkedInAt: Date;
}
```

---

## 3. 📚 Enum Pendukung Baru

### 3.1 Redeem Item Enums
`backend/src/redeem/enums/redeem-item.enums.ts`
```typescript
export enum RedeemItemType {
  WRISTBAND = 'WRISTBAND',
  BIB = 'BIB',
  CERTIFICATE = 'CERTIFICATE',
  NONE = 'NONE',
}

export enum RedeemItemStatus {
  GENERATED = 'GENERATED',
  ASSIGNED = 'ASSIGNED',
  CHECKED_IN = 'CHECKED_IN',
  USED = 'USED',
}
```

### 3.2 Check-in Enums
`backend/src/check-in/enums/check-in.enums.ts`
```typescript
export enum CheckInType {
  WRISTBAND = 'WRISTBAND',
  BIB = 'BIB',
  TICKET = 'TICKET',
  CERTIFICATE = 'CERTIFICATE',
}
```

---

## 4. 🔁 Relasi yang Perlu Ditambahkan

Setelah entity baru dibuat:
- `Ticket` → `RedeemItem`
  ```typescript
  @OneToOne(() => RedeemItem, (item) => item.ticket)
  redeemItem?: RedeemItem;
  ```
- `TicketCategory` tidak perlu perubahan.
- `Attendee` optional relasi ke `CheckInRecord` (history).

---

## 5. ✅ Checklist Implementasi

- [x] Update `Event` entity dengan enum kolom baru.
- [ ] Buat entity `RedeemItem` beserta enums pendukung.
- [ ] Buat entity `CheckInRecord` beserta enums pendukung.
- [ ] Tambah relasi di `Ticket`, `Event`, dan entity terkait.
- [ ] Generate migration untuk tabel dan kolom baru.
- [ ] Update repository/service setelah entity tersedia.

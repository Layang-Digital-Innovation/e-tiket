# 📋 Event Type & Dynamic Redeem/Check-in System Design

## 1. 📘 Overview

Sistem ini memberikan fleksibilitas dalam manajemen event dengan mendukung berbagai jenis acara (Concert, Running, Seminar, dll) yang masing-masing memiliki logika redeem dan check-in yang berbeda.

### Contoh Use Cases:
- **Concert Event**: Tiket → Wristband Code (gelang masuk)
- **Running Event**: Tiket → Bib Number (nomor dada pelari)
- **Seminar Event**: Tiket → Direct Check-in (hanya scan, tanpa item fisik)
- **Workshop Event**: Tiket → Certificate Code (kode sertifikat)

---

## 2. 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     Event Management                         │
├─────────────────────────────────────────────────────────────┤
│  Event Entity                                                 │
│  ├── eventType: EventType (CONCERT, RUNNING, SEMINAR, etc)  │
│  └── redeemStrategy: RedeemStrategy (WRISTBAND, BIB, NONE)  │
│                                                               │
├─────────────────────────────────────────────────────────────┤
│                    Redeem Flow                                │
├─────────────────────────────────────────────────────────────┤
│  Ticket (UNUSED)                                             │
│       ↓                                                       │
│  Redeem Service (Strategy Pattern)                           │
│       ├── Check Event Type                                   │
│       ├── Get Redeem Strategy                                │
│       └── Execute Strategy                                   │
│       ↓                                                       │
│  Generate Redeem Item (Wristband/Bib/None)                  │
│       ↓                                                       │
│  Ticket (REDEEMED) + Redeem Item                             │
│                                                               │
├─────────────────────────────────────────────────────────────┤
│                   Check-in Flow                               │
├─────────────────────────────────────────────────────────────┤
│  Redeem Item / Ticket Code                                   │
│       ↓                                                       │
│  Check-in Service (Strategy Pattern)                         │
│       ├── Check Event Type                                   │
│       ├── Get Check-in Strategy                              │
│       └── Execute Strategy                                   │
│       ↓                                                       │
│  Validate & Record Check-in                                  │
│       ↓                                                       │
│  Check-in Record (timestamp, location, etc)                  │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. 📊 Database Schema

### 3.1 Event Entity (Modified)
```sql
CREATE TABLE events (
  id UUID PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  
  -- NEW: Event Type & Redeem Strategy
  event_type ENUM('CONCERT', 'RUNNING', 'SEMINAR', 'WORKSHOP', 'CONFERENCE') NOT NULL DEFAULT 'CONCERT',
  redeem_strategy ENUM('WRISTBAND', 'BIB', 'NONE', 'CERTIFICATE') NOT NULL DEFAULT 'WRISTBAND',
  
  organizer_id UUID NOT NULL REFERENCES users(id),
  start_date TIMESTAMP NOT NULL,
  end_date TIMESTAMP NOT NULL,
  location VARCHAR(255),
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 3.2 Redeem Item Entity (New)
```sql
CREATE TABLE redeem_items (
  id UUID PRIMARY KEY,
  ticket_id UUID NOT NULL UNIQUE REFERENCES tickets(id),
  event_id UUID NOT NULL REFERENCES events(id),
  
  item_type ENUM('WRISTBAND', 'BIB', 'CERTIFICATE', 'NONE') NOT NULL,
  item_code VARCHAR(100) NOT NULL UNIQUE,
  item_qr_code TEXT,
  
  status ENUM('GENERATED', 'ASSIGNED', 'CHECKED_IN', 'USED') NOT NULL DEFAULT 'GENERATED',
  
  checked_in_at TIMESTAMP,
  checked_in_by_id UUID REFERENCES users(id),
  check_in_location VARCHAR(255),
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_redeem_items_ticket_id ON redeem_items(ticket_id);
CREATE INDEX idx_redeem_items_event_id ON redeem_items(event_id);
CREATE INDEX idx_redeem_items_item_code ON redeem_items(item_code);
```

### 3.3 Check-in Record Entity (New)
```sql
CREATE TABLE check_in_records (
  id UUID PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES events(id),
  redeem_item_id UUID REFERENCES redeem_items(id),
  ticket_id UUID REFERENCES tickets(id),
  
  check_in_type ENUM('WRISTBAND', 'BIB', 'TICKET', 'CERTIFICATE') NOT NULL,
  check_in_code VARCHAR(100) NOT NULL,
  
  checked_in_by_id UUID NOT NULL REFERENCES users(id),
  attendee_id UUID REFERENCES attendees(id),
  
  check_in_location VARCHAR(255),
  checked_in_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_check_in_records_event_id ON check_in_records(event_id);
CREATE INDEX idx_check_in_records_check_in_code ON check_in_records(check_in_code);
```

---

## 4. 🎯 Enums & Constants

### 4.1 EventType Enum
```typescript
enum EventType {
  CONCERT = 'CONCERT',           // Konser musik
  RUNNING = 'RUNNING',           // Lari marathon
  SEMINAR = 'SEMINAR',           // Seminar/workshop
  WORKSHOP = 'WORKSHOP',         // Workshop interaktif
  CONFERENCE = 'CONFERENCE',     // Konferensi
  EXHIBITION = 'EXHIBITION',     // Pameran
  SPORTS = 'SPORTS',             // Olahraga
  FESTIVAL = 'FESTIVAL',         // Festival
}
```

### 4.2 RedeemStrategy Enum
```typescript
enum RedeemStrategy {
  WRISTBAND = 'WRISTBAND',       // Generate wristband code + QR
  BIB = 'BIB',                   // Generate bib number + QR
  CERTIFICATE = 'CERTIFICATE',  // Generate certificate code
  NONE = 'NONE',                 // Direct check-in, no item
}
```

### 4.3 RedeemItemType & Status Enums
```typescript
enum RedeemItemType {
  WRISTBAND = 'WRISTBAND',
  BIB = 'BIB',
  CERTIFICATE = 'CERTIFICATE',
  NONE = 'NONE',
}

enum RedeemItemStatus {
  GENERATED = 'GENERATED',       // Item sudah di-generate
  ASSIGNED = 'ASSIGNED',         // Item sudah di-assign ke peserta
  CHECKED_IN = 'CHECKED_IN',     // Peserta sudah check-in
  USED = 'USED',                 // Item sudah digunakan
}
```

---

## 5. 🔄 Strategy Pattern - Redeem

### 5.1 Redeem Strategy Interface
```typescript
interface IRedeemStrategy {
  generateRedeemItem(ticket: Ticket, event: Event): Promise<RedeemItem>;
  getRedeemItemForDisplay(ticket: Ticket): Promise<RedeemItemDTO>;
  validateRedeemCode(code: string, event: Event): Promise<boolean>;
}
```

### 5.2 Strategy Factory
```typescript
@Injectable()
export class RedeemStrategyFactory {
  constructor(
    private wristbandStrategy: WristbandRedeemStrategy,
    private bibStrategy: BibRedeemStrategy,
    private noneStrategy: NoneRedeemStrategy,
  ) {}
  
  getStrategy(redeemStrategy: RedeemStrategy): IRedeemStrategy {
    switch (redeemStrategy) {
      case RedeemStrategy.WRISTBAND:
        return this.wristbandStrategy;
      case RedeemStrategy.BIB:
        return this.bibStrategy;
      case RedeemStrategy.NONE:
        return this.noneStrategy;
      default:
        throw new Error(`Unknown redeem strategy: ${redeemStrategy}`);
    }
  }
}
```

---

## 6. 🔄 Strategy Pattern - Check-in

### 6.1 Check-in Strategy Interface
```typescript
interface ICheckInStrategy {
  validateCheckInCode(code: string, event: Event): Promise<CheckInValidation>;
  getAttendeeInfo(code: string, event: Event): Promise<AttendeeDTO>;
  recordCheckIn(
    code: string,
    event: Event,
    checkedInBy: User,
    location?: string,
  ): Promise<CheckInRecord>;
}

interface CheckInValidation {
  isValid: boolean;
  message?: string;
  attendeeId?: string;
  redeemItemId?: string;
}
```

### 6.2 Strategy Factory
```typescript
@Injectable()
export class CheckInStrategyFactory {
  constructor(
    private wristbandStrategy: WristbandCheckInStrategy,
    private bibStrategy: BibCheckInStrategy,
    private noneStrategy: NoneCheckInStrategy,
  ) {}
  
  getStrategy(redeemStrategy: RedeemStrategy): ICheckInStrategy {
    switch (redeemStrategy) {
      case RedeemStrategy.WRISTBAND:
        return this.wristbandStrategy;
      case RedeemStrategy.BIB:
        return this.bibStrategy;
      case RedeemStrategy.NONE:
        return this.noneStrategy;
      default:
        throw new Error(`Unknown check-in strategy: ${redeemStrategy}`);
    }
  }
}
```

---

## 7. 📦 Service Layer

### 7.1 RedeemService
```typescript
@Injectable()
export class RedeemService {
  constructor(
    private strategyFactory: RedeemStrategyFactory,
    private eventService: EventsService,
    private ticketRepository: Repository<Ticket>,
    private redeemItemRepository: Repository<RedeemItem>,
  ) {}
  
  async redeemTicket(ticketId: string, eventId: string): Promise<RedeemItemDTO> {
    const ticket = await this.ticketRepository.findOne({
      where: { id: ticketId, eventId },
    });
    const event = await this.eventService.findOne(eventId);
    
    if (!ticket) throw new NotFoundException('Tiket tidak ditemukan');
    if (ticket.status !== TicketStatus.UNUSED) {
      throw new BadRequestException('Tiket sudah di-redeem');
    }
    
    const strategy = this.strategyFactory.getStrategy(event.redeemStrategy);
    const redeemItem = await strategy.generateRedeemItem(ticket, event);
    
    ticket.status = TicketStatus.REDEEMED;
    await this.ticketRepository.save(ticket);
    
    return await strategy.getRedeemItemForDisplay(ticket);
  }
}
```

### 7.2 CheckInService
```typescript
@Injectable()
export class CheckInService {
  constructor(
    private checkInStrategyFactory: CheckInStrategyFactory,
    private eventService: EventsService,
    private checkInRecordRepository: Repository<CheckInRecord>,
  ) {}
  
  async checkIn(
    code: string,
    eventId: string,
    checkedInBy: User,
    location?: string,
  ): Promise<CheckInRecord> {
    const event = await this.eventService.findOne(eventId);
    const strategy = this.checkInStrategyFactory.getStrategy(event.redeemStrategy);
    
    const validation = await strategy.validateCheckInCode(code, event);
    if (!validation.isValid) {
      throw new BadRequestException(validation.message);
    }
    
    return await strategy.recordCheckIn(code, event, checkedInBy, location);
  }
}
```

---

## 8. 🎮 API Endpoints

### Event Management
- `POST /api/events` - Create event dengan event type & redeem strategy
- `GET /api/events/:id` - Get event details
- `PATCH /api/events/:id` - Update event

### Redeem Operations
- `POST /api/redeem` - Redeem ticket
- `GET /api/redeem/ticket/:ticketId` - Get redeem item details
- `GET /api/redeem/event/:eventId/items` - Get all redeem items

### Check-in Operations
- `POST /api/check-in` - Check-in dengan code
- `GET /api/check-in/event/:eventId/stats` - Get check-in statistics
- `GET /api/check-in/event/:eventId/records` - Get all check-in records

---

## 9. 🚀 Implementation Roadmap

### Phase 1: Core Infrastructure (Week 1-2)
- [ ] Create database schema & migrations
- [ ] Create enums & constants
- [ ] Create entities (Event, RedeemItem, CheckInRecord)
- [ ] Create repositories

### Phase 2: Strategy Implementation (Week 2-3)
- [ ] Implement RedeemStrategyFactory & strategies
- [ ] Implement CheckInStrategyFactory & strategies
- [ ] Unit tests untuk setiap strategy

### Phase 3: Service Layer (Week 3-4)
- [ ] Implement RedeemService
- [ ] Implement CheckInService
- [ ] Integration tests

### Phase 4: Controller & API (Week 4-5)
- [ ] Implement EventController modifications
- [ ] Implement RedeemController modifications
- [ ] Implement CheckInController modifications
- [ ] E2E tests & API documentation

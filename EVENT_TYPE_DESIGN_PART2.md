# 📋 Event Type System - Concrete Strategy Implementations

## 1. 🔄 Redeem Strategy Implementations

### 1.1 WristbandRedeemStrategy
```typescript
@Injectable()
export class WristbandRedeemStrategy implements IRedeemStrategy {
  constructor(
    private redeemItemRepository: Repository<RedeemItem>,
    private qrCodeService: QRCodeService,
    private codeGeneratorService: CodeGeneratorService,
  ) {}
  
  async generateRedeemItem(ticket: Ticket, event: Event): Promise<RedeemItem> {
    // 1. Generate unique wristband code (e.g., WB-CONCERT-001)
    const wristbandCode = await this.codeGeneratorService.generateUniqueCode(
      'WB',
      event.id,
      6, // 6 digit number
    );
    
    // 2. Generate QR code
    const qrCode = await this.qrCodeService.generateQRCode(wristbandCode);
    
    // 3. Create redeem item
    const redeemItem = this.redeemItemRepository.create({
      ticketId: ticket.id,
      eventId: event.id,
      itemType: RedeemItemType.WRISTBAND,
      itemCode: wristbandCode,
      itemQrCode: qrCode,
      status: RedeemItemStatus.GENERATED,
    });
    
    return await this.redeemItemRepository.save(redeemItem);
  }
  
  async getRedeemItemForDisplay(ticket: Ticket): Promise<RedeemItemDTO> {
    const redeemItem = await this.redeemItemRepository.findOne({
      where: { ticketId: ticket.id },
    });
    
    if (!redeemItem) {
      throw new NotFoundException('Redeem item tidak ditemukan');
    }
    
    return {
      type: 'WRISTBAND',
      code: redeemItem.itemCode,
      qrCode: redeemItem.itemQrCode,
      status: redeemItem.status,
      message: 'Simpan kode wristband ini untuk check-in',
    };
  }
  
  async validateRedeemCode(code: string, event: Event): Promise<boolean> {
    const redeemItem = await this.redeemItemRepository.findOne({
      where: {
        itemCode: code,
        eventId: event.id,
        itemType: RedeemItemType.WRISTBAND,
      },
    });
    
    return !!redeemItem && redeemItem.status !== RedeemItemStatus.USED;
  }
}
```

### 1.2 BibRedeemStrategy
```typescript
@Injectable()
export class BibRedeemStrategy implements IRedeemStrategy {
  constructor(
    private redeemItemRepository: Repository<RedeemItem>,
    private qrCodeService: QRCodeService,
    private codeGeneratorService: CodeGeneratorService,
  ) {}
  
  async generateRedeemItem(ticket: Ticket, event: Event): Promise<RedeemItem> {
    // 1. Generate unique bib number (e.g., RUN-001, RUN-002)
    const bibNumber = await this.codeGeneratorService.generateUniqueBibNumber(
      'RUN',
      event.id,
    );
    
    // 2. Generate QR code
    const qrCode = await this.qrCodeService.generateQRCode(bibNumber);
    
    // 3. Create redeem item
    const redeemItem = this.redeemItemRepository.create({
      ticketId: ticket.id,
      eventId: event.id,
      itemType: RedeemItemType.BIB,
      itemCode: bibNumber,
      itemQrCode: qrCode,
      status: RedeemItemStatus.GENERATED,
    });
    
    return await this.redeemItemRepository.save(redeemItem);
  }
  
  async getRedeemItemForDisplay(ticket: Ticket): Promise<RedeemItemDTO> {
    const redeemItem = await this.redeemItemRepository.findOne({
      where: { ticketId: ticket.id },
    });
    
    if (!redeemItem) {
      throw new NotFoundException('Redeem item tidak ditemukan');
    }
    
    return {
      type: 'BIB',
      bibNumber: redeemItem.itemCode,
      qrCode: redeemItem.itemQrCode,
      status: redeemItem.status,
      message: 'Nomor dada Anda untuk lari marathon',
    };
  }
  
  async validateRedeemCode(code: string, event: Event): Promise<boolean> {
    const redeemItem = await this.redeemItemRepository.findOne({
      where: {
        itemCode: code,
        eventId: event.id,
        itemType: RedeemItemType.BIB,
      },
    });
    
    return !!redeemItem && redeemItem.status !== RedeemItemStatus.USED;
  }
}
```

### 1.3 NoneRedeemStrategy
```typescript
@Injectable()
export class NoneRedeemStrategy implements IRedeemStrategy {
  constructor(
    private redeemItemRepository: Repository<RedeemItem>,
    private qrCodeService: QRCodeService,
  ) {}
  
  async generateRedeemItem(ticket: Ticket, event: Event): Promise<RedeemItem> {
    // Tidak generate item fisik, gunakan ticket code langsung
    const qrCode = await this.qrCodeService.generateQRCode(ticket.code);
    
    const redeemItem = this.redeemItemRepository.create({
      ticketId: ticket.id,
      eventId: event.id,
      itemType: RedeemItemType.NONE,
      itemCode: ticket.code,
      itemQrCode: qrCode,
      status: RedeemItemStatus.GENERATED,
    });
    
    return await this.redeemItemRepository.save(redeemItem);
  }
  
  async getRedeemItemForDisplay(ticket: Ticket): Promise<RedeemItemDTO> {
    return {
      type: 'NONE',
      ticketCode: ticket.code,
      message: 'Scan tiket Anda langsung untuk check-in',
      status: 'READY',
    };
  }
  
  async validateRedeemCode(code: string, event: Event): Promise<boolean> {
    // Validate ticket code langsung
    const ticket = await this.ticketRepository.findOne({
      where: { code, eventId: event.id },
    });
    
    return !!ticket && ticket.status === TicketStatus.UNUSED;
  }
}
```

---

## 2. 🔄 Check-in Strategy Implementations

### 2.1 WristbandCheckInStrategy
```typescript
@Injectable()
export class WristbandCheckInStrategy implements ICheckInStrategy {
  constructor(
    private redeemItemRepository: Repository<RedeemItem>,
    private checkInRecordRepository: Repository<CheckInRecord>,
    private ticketRepository: Repository<Ticket>,
  ) {}
  
  async validateCheckInCode(code: string, event: Event): Promise<CheckInValidation> {
    const redeemItem = await this.redeemItemRepository.findOne({
      where: {
        itemCode: code,
        eventId: event.id,
        itemType: RedeemItemType.WRISTBAND,
      },
      relations: ['ticket', 'ticket.orderItem', 'ticket.orderItem.attendees'],
    });
    
    if (!redeemItem) {
      return { isValid: false, message: 'Wristband code tidak ditemukan' };
    }
    
    if (redeemItem.status === RedeemItemStatus.CHECKED_IN) {
      return { isValid: false, message: 'Wristband sudah di-check-in' };
    }
    
    if (redeemItem.status === RedeemItemStatus.USED) {
      return { isValid: false, message: 'Wristband sudah digunakan' };
    }
    
    return {
      isValid: true,
      redeemItemId: redeemItem.id,
      attendeeId: redeemItem.ticket.orderItem.attendees[0]?.id,
    };
  }
  
  async getAttendeeInfo(code: string, event: Event): Promise<AttendeeDTO> {
    const redeemItem = await this.redeemItemRepository.findOne({
      where: { itemCode: code, eventId: event.id },
      relations: ['ticket', 'ticket.orderItem', 'ticket.orderItem.attendees'],
    });
    
    const attendee = redeemItem.ticket.orderItem.attendees[0];
    return {
      id: attendee.id,
      fullName: attendee.fullName,
      email: attendee.email,
      phoneNumber: attendee.phoneNumber,
      wristbandCode: code,
    };
  }
  
  async recordCheckIn(
    code: string,
    event: Event,
    checkedInBy: User,
    location?: string,
  ): Promise<CheckInRecord> {
    const redeemItem = await this.redeemItemRepository.findOne({
      where: { itemCode: code, eventId: event.id },
      relations: ['ticket', 'ticket.orderItem', 'ticket.orderItem.attendees'],
    });
    
    // Update redeem item status
    redeemItem.status = RedeemItemStatus.CHECKED_IN;
    redeemItem.checkedInAt = new Date();
    redeemItem.checkedInById = checkedInBy.id;
    redeemItem.checkInLocation = location;
    await this.redeemItemRepository.save(redeemItem);
    
    // Create check-in record
    const checkInRecord = this.checkInRecordRepository.create({
      eventId: event.id,
      redeemItemId: redeemItem.id,
      ticketId: redeemItem.ticketId,
      checkInType: 'WRISTBAND',
      checkInCode: code,
      checkedInById: checkedInBy.id,
      attendeeId: redeemItem.ticket.orderItem.attendees[0]?.id,
      checkInLocation: location,
    });
    
    return await this.checkInRecordRepository.save(checkInRecord);
  }
}
```

### 2.2 BibCheckInStrategy
```typescript
@Injectable()
export class BibCheckInStrategy implements ICheckInStrategy {
  constructor(
    private redeemItemRepository: Repository<RedeemItem>,
    private checkInRecordRepository: Repository<CheckInRecord>,
  ) {}
  
  async validateCheckInCode(code: string, event: Event): Promise<CheckInValidation> {
    const redeemItem = await this.redeemItemRepository.findOne({
      where: {
        itemCode: code,
        eventId: event.id,
        itemType: RedeemItemType.BIB,
      },
      relations: ['ticket', 'ticket.orderItem', 'ticket.orderItem.attendees'],
    });
    
    if (!redeemItem) {
      return { isValid: false, message: 'Bib number tidak ditemukan' };
    }
    
    if (redeemItem.status === RedeemItemStatus.CHECKED_IN) {
      return { isValid: false, message: 'Peserta sudah check-in' };
    }
    
    return {
      isValid: true,
      redeemItemId: redeemItem.id,
      attendeeId: redeemItem.ticket.orderItem.attendees[0]?.id,
    };
  }
  
  async getAttendeeInfo(code: string, event: Event): Promise<AttendeeDTO> {
    const redeemItem = await this.redeemItemRepository.findOne({
      where: { itemCode: code, eventId: event.id },
      relations: ['ticket', 'ticket.orderItem', 'ticket.orderItem.attendees'],
    });
    
    const attendee = redeemItem.ticket.orderItem.attendees[0];
    return {
      id: attendee.id,
      fullName: attendee.fullName,
      email: attendee.email,
      phoneNumber: attendee.phoneNumber,
      bibNumber: code,
    };
  }
  
  async recordCheckIn(
    code: string,
    event: Event,
    checkedInBy: User,
    location?: string,
  ): Promise<CheckInRecord> {
    const redeemItem = await this.redeemItemRepository.findOne({
      where: { itemCode: code, eventId: event.id },
      relations: ['ticket', 'ticket.orderItem', 'ticket.orderItem.attendees'],
    });
    
    redeemItem.status = RedeemItemStatus.CHECKED_IN;
    redeemItem.checkedInAt = new Date();
    redeemItem.checkedInById = checkedInBy.id;
    redeemItem.checkInLocation = location;
    await this.redeemItemRepository.save(redeemItem);
    
    const checkInRecord = this.checkInRecordRepository.create({
      eventId: event.id,
      redeemItemId: redeemItem.id,
      ticketId: redeemItem.ticketId,
      checkInType: 'BIB',
      checkInCode: code,
      checkedInById: checkedInBy.id,
      attendeeId: redeemItem.ticket.orderItem.attendees[0]?.id,
      checkInLocation: location,
    });
    
    return await this.checkInRecordRepository.save(checkInRecord);
  }
}
```

### 2.3 NoneCheckInStrategy
```typescript
@Injectable()
export class NoneCheckInStrategy implements ICheckInStrategy {
  constructor(
    private ticketRepository: Repository<Ticket>,
    private checkInRecordRepository: Repository<CheckInRecord>,
  ) {}
  
  async validateCheckInCode(code: string, event: Event): Promise<CheckInValidation> {
    const ticket = await this.ticketRepository.findOne({
      where: { code, eventId: event.id },
      relations: ['orderItem', 'orderItem.attendees'],
    });
    
    if (!ticket) {
      return { isValid: false, message: 'Tiket tidak ditemukan' };
    }
    
    if (ticket.status === TicketStatus.CHECKED_IN) {
      return { isValid: false, message: 'Tiket sudah di-check-in' };
    }
    
    if (ticket.status !== TicketStatus.UNUSED) {
      return { isValid: false, message: 'Tiket tidak valid' };
    }
    
    return {
      isValid: true,
      attendeeId: ticket.orderItem.attendees[0]?.id,
    };
  }
  
  async getAttendeeInfo(code: string, event: Event): Promise<AttendeeDTO> {
    const ticket = await this.ticketRepository.findOne({
      where: { code, eventId: event.id },
      relations: ['orderItem', 'orderItem.attendees'],
    });
    
    const attendee = ticket.orderItem.attendees[0];
    return {
      id: attendee.id,
      fullName: attendee.fullName,
      email: attendee.email,
      phoneNumber: attendee.phoneNumber,
      ticketCode: code,
    };
  }
  
  async recordCheckIn(
    code: string,
    event: Event,
    checkedInBy: User,
    location?: string,
  ): Promise<CheckInRecord> {
    const ticket = await this.ticketRepository.findOne({
      where: { code, eventId: event.id },
      relations: ['orderItem', 'orderItem.attendees'],
    });
    
    // Update ticket status
    ticket.status = TicketStatus.CHECKED_IN;
    ticket.checkedInAt = new Date();
    await this.ticketRepository.save(ticket);
    
    // Create check-in record
    const checkInRecord = this.checkInRecordRepository.create({
      eventId: event.id,
      ticketId: ticket.id,
      checkInType: 'TICKET',
      checkInCode: code,
      checkedInById: checkedInBy.id,
      attendeeId: ticket.orderItem.attendees[0]?.id,
      checkInLocation: location,
    });
    
    return await this.checkInRecordRepository.save(checkInRecord);
  }
}
```

---

## 3. 📋 DTOs & Types

### 3.1 Create Event DTO
```typescript
export class CreateEventDto {
  @IsString()
  title: string;
  
  @IsString()
  description: string;
  
  @IsEnum(EventType)
  eventType: EventType;
  
  @IsEnum(RedeemStrategy)
  redeemStrategy: RedeemStrategy;
  
  @IsDateString()
  startDate: string;
  
  @IsDateString()
  endDate: string;
  
  @IsString()
  location: string;
}
```

### 3.2 Redeem DTO
```typescript
export class RedeemDto {
  @IsUUID()
  ticketId: string;
  
  @IsUUID()
  eventId: string;
}

export class RedeemItemDTO {
  type: 'WRISTBAND' | 'BIB' | 'CERTIFICATE' | 'NONE';
  code?: string;
  bibNumber?: string;
  certificateCode?: string;
  ticketCode?: string;
  qrCode?: string;
  status: string;
  message: string;
}
```

### 3.3 Check-in DTO
```typescript
export class CheckInDto {
  @IsString()
  code: string;
  
  @IsUUID()
  eventId: string;
  
  @IsString()
  @IsOptional()
  location?: string;
}

export class AttendeeDTO {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  wristbandCode?: string;
  bibNumber?: string;
  ticketCode?: string;
}
```

---

## 4. 🔧 Helper Services

### 4.1 CodeGeneratorService
```typescript
@Injectable()
export class CodeGeneratorService {
  async generateUniqueCode(
    prefix: string,
    eventId: string,
    length: number = 6,
  ): Promise<string> {
    let code: string;
    let exists = true;
    
    while (exists) {
      const randomPart = Math.random()
        .toString(36)
        .substring(2, 2 + length)
        .toUpperCase();
      code = `${prefix}-${randomPart}`;
      
      exists = await this.checkCodeExists(code, eventId);
    }
    
    return code;
  }
  
  async generateUniqueBibNumber(
    prefix: string,
    eventId: string,
  ): Promise<string> {
    const lastBib = await this.getLastBibNumber(eventId);
    const nextNumber = (lastBib + 1).toString().padStart(3, '0');
    return `${prefix}-${nextNumber}`;
  }
  
  private async checkCodeExists(code: string, eventId: string): Promise<boolean> {
    // Check di database
    return false; // Implementation
  }
  
  private async getLastBibNumber(eventId: string): Promise<number> {
    // Get last bib number dari database
    return 0; // Implementation
  }
}
```

### 4.2 QRCodeService
```typescript
@Injectable()
export class QRCodeService {
  async generateQRCode(data: string): Promise<string> {
    // Generate QR code menggunakan library (e.g., qrcode)
    // Return base64 atau URL
    return ''; // Implementation
  }
}
```

---

## 5. 🧪 Testing Examples

### 5.1 Unit Test - WristbandRedeemStrategy
```typescript
describe('WristbandRedeemStrategy', () => {
  let strategy: WristbandRedeemStrategy;
  let redeemItemRepository: Repository<RedeemItem>;
  
  beforeEach(async () => {
    // Setup
  });
  
  it('should generate unique wristband code', async () => {
    const ticket = { id: 'ticket-1', code: 'T001' };
    const event = { id: 'event-1', redeemStrategy: RedeemStrategy.WRISTBAND };
    
    const result = await strategy.generateRedeemItem(ticket, event);
    
    expect(result.itemType).toBe(RedeemItemType.WRISTBAND);
    expect(result.itemCode).toMatch(/^WB-/);
    expect(result.status).toBe(RedeemItemStatus.GENERATED);
  });
});
```

---

## 6. 📊 Event Type to Strategy Mapping

```typescript
const EVENT_TYPE_STRATEGY_MAP: Record<EventType, RedeemStrategy> = {
  [EventType.CONCERT]: RedeemStrategy.WRISTBAND,
  [EventType.RUNNING]: RedeemStrategy.BIB,
  [EventType.SEMINAR]: RedeemStrategy.NONE,
  [EventType.WORKSHOP]: RedeemStrategy.NONE,
  [EventType.CONFERENCE]: RedeemStrategy.NONE,
  [EventType.EXHIBITION]: RedeemStrategy.WRISTBAND,
  [EventType.SPORTS]: RedeemStrategy.BIB,
  [EventType.FESTIVAL]: RedeemStrategy.WRISTBAND,
};
```

---

## 7. 🔌 Frontend Integration Points

### 7.1 Event Creation Form
```typescript
// Auto-select redeem strategy berdasarkan event type
const handleEventTypeChange = (eventType: EventType) => {
  const strategy = EVENT_TYPE_STRATEGY_MAP[eventType];
  setFormData({ ...formData, eventType, redeemStrategy: strategy });
};
```

### 7.2 Redeem Page Display
```typescript
// Tampilkan UI berbeda berdasarkan redeem strategy
{redeemItem.type === 'WRISTBAND' && (
  <WristbandDisplay code={redeemItem.code} qrCode={redeemItem.qrCode} />
)}
{redeemItem.type === 'BIB' && (
  <BibDisplay bibNumber={redeemItem.bibNumber} qrCode={redeemItem.qrCode} />
)}
{redeemItem.type === 'NONE' && (
  <DirectCheckInMessage ticketCode={redeemItem.ticketCode} />
)}
```

### 7.3 Check-in Page Input
```typescript
// Input berbeda berdasarkan check-in strategy
{checkInStrategy === 'WRISTBAND' && (
  <input placeholder="Scan wristband code..." />
)}
{checkInStrategy === 'BIB' && (
  <input placeholder="Scan bib number..." />
)}
{checkInStrategy === 'NONE' && (
  <input placeholder="Scan ticket code..." />
)}
```

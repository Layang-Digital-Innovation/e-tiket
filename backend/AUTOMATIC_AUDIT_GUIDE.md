# Automatic Audit Guide

## Overview

Sistem audit otomatis telah diimplementasikan untuk secara otomatis mengisi field `createdBy`, `updatedBy`, `createdAt`, dan `updatedAt` pada semua entity yang extend dari `AuditEntity`.

## Cara Kerja

### 1. **AuditEntity Base Class**
Semua entity yang membutuhkan audit harus extend dari `AuditEntity`:

```typescript
import { AuditEntity } from '../common/entities/audit.entity';

@Entity()
export class Event extends AuditEntity {
  // Entity properties...
}
```

### 2. **Automatic Field Population**
Field audit akan diisi otomatis melalui:
- **TypeORM Subscribers**: Menangkap event insert/update dan mengisi audit fields
- **Entity Listeners**: `@BeforeInsert` dan `@BeforeUpdate` untuk timestamp
- **Audit Context Service**: Menyimpan informasi user yang sedang aktif

### 3. **Controller Setup**
Gunakan decorator `@AuditController()` pada controller untuk mengaktifkan audit:

```typescript
import { AuditController } from '../common/decorators/audit.decorator';

@Controller('api/events')
@AuditController()
export class EventsController {
  // Controller methods...
}
```

## Penggunaan

### 1. **Create Operation**
```typescript
// Service method - tidak perlu set audit fields manual
async create(createEventDto: CreateEventDto, userId: string): Promise<Event> {
  const event = this.eventsRepository.create({
    ...createEventDto,
    organizerId: userId,
    // createdBy dan updatedBy akan diisi otomatis!
  });

  return this.eventsRepository.save(event);
}
```

### 2. **Update Operation**
```typescript
// Service method - tidak perlu set updatedBy manual
async update(id: string, updateEventDto: UpdateEventDto): Promise<Event> {
  await this.eventsRepository.update(id, {
    ...updateEventDto,
    // updatedBy akan diisi otomatis!
  });

  return this.findOne(id);
}
```

### 3. **Manual Context Setting**
Jika perlu set context secara manual:

```typescript
import { AuditContextService } from '../common/services/audit-context.service';

constructor(
  private auditContextService: AuditContextService,
) {}

async someMethod(userId: string) {
  // Set user context manually
  this.auditContextService.setCurrentUserId(userId);
  
  // Operasi database akan menggunakan context ini
  const entity = await this.repository.save(newEntity);
}
```

## Komponen Sistem

### 1. **AuditEntity**
- Base class dengan audit fields
- `@BeforeInsert` dan `@BeforeUpdate` listeners
- Helper methods untuk audit info

### 2. **AuditSubscriber**
- TypeORM subscriber yang menangkap database events
- Mengisi `createdBy` dan `updatedBy` berdasarkan context

### 3. **AuditContextService**
- Service untuk menyimpan user context per request
- Menggunakan `nestjs-cls` untuk request-scoped storage

### 4. **AuditInterceptor**
- Interceptor yang mengekstrak user info dari request
- Mengset context sebelum method execution

### 5. **AuditController Decorator**
- Decorator untuk mengaktifkan audit pada controller
- Otomatis apply `AuditInterceptor`

## Query dengan Audit Info

### 1. **Basic Query dengan Relations**
```typescript
const events = await this.eventsRepository.find({
  relations: ['creator', 'updater'],
});
```

### 2. **Query Builder dengan Audit Info**
```typescript
const events = await this.eventsRepository
  .createQueryBuilder('event')
  .leftJoinAndSelect('event.creator', 'creator')
  .leftJoinAndSelect('event.updater', 'updater')
  .select([
    'event.id',
    'event.title',
    'event.createdAt',
    'event.updatedAt',
    'creator.name',
    'updater.name',
  ])
  .getMany();
```

### 3. **Audit Trail Query**
```typescript
// Get entities created by specific user
const createdByUser = await this.repository.find({
  where: { createdBy: userId },
  relations: ['creator'],
});

// Get entities updated by specific user
const updatedByUser = await this.repository.find({
  where: { updatedBy: userId },
  relations: ['updater'],
});
```

## Best Practices

### 1. **Controller Level**
- Selalu gunakan `@AuditController()` pada controller yang membutuhkan audit
- Pastikan authentication guard aktif untuk mendapatkan user info

### 2. **Service Level**
- Tidak perlu manual set audit fields di service
- Focus pada business logic, audit akan handled otomatis

### 3. **Entity Level**
- Extend dari `AuditEntity` untuk semua entity yang perlu audit
- Jangan override `@BeforeInsert` dan `@BeforeUpdate` tanpa call super

### 4. **Testing**
- Set audit context dalam test cases:
```typescript
beforeEach(() => {
  auditContextService.setCurrentUserId('test-user-id');
});
```

## Troubleshooting

### 1. **Audit Fields Null**
- Pastikan `@AuditController()` decorator digunakan
- Pastikan user info tersedia di request object
- Check apakah `CommonModule` sudah diimport di `AppModule`

### 2. **Subscriber Tidak Jalan**
- Pastikan entity extend dari `AuditEntity`
- Check apakah `AuditSubscriber` terdaftar di module

### 3. **Context Tidak Tersedia**
- Pastikan `nestjs-cls` module configured dengan benar
- Check apakah request berjalan dalam proper context

## Migration dari Manual Audit

Jika sebelumnya menggunakan manual audit:

1. **Remove Manual Code**:
```typescript
// BEFORE (manual)
const event = this.repository.create({
  ...dto,
  createdBy: userId,
  updatedBy: userId,
});

// AFTER (automatic)
const event = this.repository.create({
  ...dto,
  // audit fields akan diisi otomatis
});
```

2. **Add Controller Decorator**:
```typescript
@Controller('api/events')
@AuditController() // Add this
export class EventsController {
  // ...
}
```

3. **Update Entity**:
```typescript
// Make sure entity extends AuditEntity
@Entity()
export class Event extends AuditEntity {
  // ...
}
```

## Contoh Lengkap

Lihat file example:
- `src/events/examples/automatic-audit.example.ts` - Contoh penggunaan
- `src/events/examples/audit-usage.example.ts` - Query patterns
# Payment Webhook Handler - Best Practices

## 📋 Overview
Dokumentasi ini menjelaskan best practices untuk handle Xendit webhook callback di aplikasi ticketing.

## 🔐 Security Best Practices

### 1. Webhook Token Verification
```typescript
// Selalu verify webhook token dari Xendit
const expectedToken = this.configService.get<string>('XENDIT_WEBHOOK_TOKEN');
if (expectedToken && webhookToken !== expectedToken) {
  throw new BadRequestException('Invalid webhook token');
}
```

**Setup di .env:**
```env
XENDIT_WEBHOOK_TOKEN=your_webhook_verification_token_from_xendit_dashboard
```

### 2. Idempotency Check
```typescript
// Cek apakah order sudah dibayar sebelumnya
if (order.status === OrderStatus.PAID) {
  this.logger.warn(`Order ${callbackData.external_id} already paid`);
  throw new BadRequestException('Order already paid');
}
```

## 📝 DTO Validation Best Practices

### 1. Gunakan Class Validator dengan Proper Decorators
```typescript
export class CallbackSuccessDto {
  // Required fields - gunakan @IsNotEmpty()
  @IsString()
  @IsNotEmpty()
  id: string;

  @IsString()
  @IsNotEmpty()
  external_id: string;

  // Enum validation untuk status
  @IsEnum(XenditPaymentStatus)
  status: XenditPaymentStatus;

  // Optional fields - gunakan @IsOptional()
  @IsOptional()
  @IsString()
  payment_method?: string;
}
```

### 2. Nested Object Validation
```typescript
// Untuk nested objects, gunakan @ValidateNested dan @Type
@IsArray()
@ValidateNested({ each: true })
@Type(() => XenditItemDto)
items: XenditItemDto[];
```

### 3. Validation Pipe Configuration
```typescript
@Body(new ValidationPipe({
  transform: true,              // Transform plain object to class instance
  whitelist: true,              // Strip properties not in DTO
  forbidNonWhitelisted: false,  // Jangan throw error untuk extra fields
  skipMissingProperties: false, // Validate semua required fields
  stopAtFirstError: false,      // Collect all validation errors
}))
```

## 🔄 Transaction Management

### 1. Database Transaction Pattern
```typescript
const queryRunner = this.dataSource.createQueryRunner();
await queryRunner.connect();
await queryRunner.startTransaction();

try {
  // 1. Validate & find order
  // 2. Update order status
  // 3. Update ticket stock
  // 4. Create tickets
  
  await queryRunner.commitTransaction();
  
  // 5. Send emails (after commit)
} catch (error) {
  await queryRunner.rollbackTransaction();
  throw error;
} finally {
  await queryRunner.release();
}
```

**⚠️ Important:** Email sending dilakukan **SETELAH** commit transaction untuk menghindari:
- Email terkirim tapi transaction rollback
- Inconsistent state

## 📧 Email Queue Pattern

### 1. Gunakan Queue untuk Email
```typescript
// ✅ Good: Async email via queue
await this.emailQueueService.addTicketEmail({...});

// ❌ Bad: Synchronous email
await this.emailService.sendTicketEmail({...});
```

**Keuntungan:**
- Non-blocking operation
- Retry mechanism
- Better error handling
- Scalable

## 🎯 Status Handling

### 1. Handle Different Payment Status
```typescript
// Hanya process status PAID
if (callbackData.status !== XenditPaymentStatus.PAID) {
  this.logger.warn(`Received non-PAID status: ${callbackData.status}`);
  return {
    success: true,
    message: `Webhook received with status: ${callbackData.status}`,
    data: null
  };
}
```

### 2. Status Enum
```typescript
export enum XenditPaymentStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  EXPIRED = 'EXPIRED',
  FAILED = 'FAILED'
}
```

## 📊 Logging Best Practices

### 1. Log Important Events
```typescript
this.logger.log(`Received webhook callback for external_id: ${callbackData.external_id}`);
this.logger.debug(`Webhook payload: ${JSON.stringify(callbackData)}`);
this.logger.log(`Processing payment for order: ${callbackData.external_id}`);
this.logger.log(`Successfully processed payment for ${callbackData.external_id}`);
```

### 2. Log Errors with Context
```typescript
this.logger.error(`Failed to process payment callback: ${error.message}`, error.stack);
```

### 3. Log Warnings
```typescript
this.logger.warn(`Order ${callbackData.external_id} already paid`);
this.logger.warn(`Received non-PAID status: ${callbackData.status}`);
```

## 🧪 Testing Webhook

### 1. Test dengan Xendit Webhook Simulator
- Login ke Xendit Dashboard
- Go to Developers > Webhooks
- Use "Test Webhook" feature

### 2. Local Testing dengan ngrok
```bash
# Install ngrok
npm install -g ngrok

# Expose local server
ngrok http 3000

# Use ngrok URL in Xendit webhook settings
https://your-ngrok-url.ngrok.io/api/payment/callback
```

### 3. Verify Webhook Token
```bash
curl -X POST http://localhost:3000/api/payment/callback \
  -H "Content-Type: application/json" \
  -H "x-callback-token: your_webhook_token" \
  -d '{
    "id": "test-id",
    "external_id": "ORDER-123",
    "status": "PAID",
    ...
  }'
```

## ⚡ Performance Optimization

### 1. Batch Operations
```typescript
// ✅ Good: Save all tickets at once
await queryRunner.manager.save(allTicketsToSave);

// ❌ Bad: Save one by one
for (const ticket of tickets) {
  await queryRunner.manager.save(ticket);
}
```

### 2. Async Email Processing
```typescript
// Email processing happens asynchronously via queue
// Main webhook response returns immediately
```

## 🔍 Error Handling

### 1. Specific Error Types
```typescript
if (!order) throw new NotFoundException('Order not found');
if (order.status === OrderStatus.PAID) throw new BadRequestException('Order already paid');
if (callbackData.status !== XenditPaymentStatus.PAID) {
  throw new BadRequestException(`Invalid payment status: ${callbackData.status}`);
}
```

### 2. Rollback on Error
```typescript
try {
  // Process payment
} catch (error) {
  await queryRunner.rollbackTransaction();
  this.logger.error('Payment confirmation failed:', error);
  throw error;
}
```

## 📚 References

- [Xendit Webhook Documentation](https://docs.xendit.co/payment-link/notification-and-callback)
- [Xendit Webhook Security](https://docs.xendit.co/docs/handling-webhooks)
- [NestJS Validation](https://docs.nestjs.com/techniques/validation)
- [TypeORM Transactions](https://typeorm.io/transactions)

## 🎯 Checklist

- [x] DTO dengan proper validation decorators
- [x] Webhook token verification
- [x] Idempotency check (prevent double processing)
- [x] Database transaction management
- [x] Status validation (only process PAID)
- [x] Async email via queue
- [x] Proper error handling
- [x] Comprehensive logging
- [x] Batch database operations
- [x] Rollback on failure

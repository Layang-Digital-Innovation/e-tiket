# Order Expiration System

## Overview
Sistem ini menggunakan BullMQ untuk menangani ekspirasi order yang belum dibayar dalam waktu 15 menit. Order yang expired akan dilepaskan reserved tiketnya kembali ke stock available.

## Architecture

### Components
1. **OrderExpirationProcessor** - Job processor yang menangani ekspirasi order
2. **OrderService.expireOrder()** - Method untuk expire order dan release tickets
3. **Order creation** - Auto-schedule job saat order dibuat
4. **Payment success** - Auto-cancel job saat pembayaran berhasil

### Queue Configuration
- **Queue Name**: `order-expiration`
- **Job Type**: `expire-order`
- **Delay**: 15 minutes (900,000 ms)
- **Redis**: Configured via environment variables

## Flow

### Order Creation Flow
```
1. User creates order
2. Order status = PENDING
3. Tickets reserved (+reserved count)
4. Job scheduled for 15 minutes later
5. User redirected to payment URL
```

### Payment Success Flow
```
1. Payment callback received
2. Order status = PAID
3. Tickets moved from reserved to sold
4. Expiration job cancelled
5. Tickets generated & emails sent
```

### Order Expiration Flow
```
1. 15 minutes pass without payment
2. Job executed
3. Order status = EXPIRED
4. Reserved tickets released (-reserved count)
5. Order cannot be paid anymore
```

## Configuration

### Environment Variables
```env
REDIS_HOST=localhost
REDIS_PORT=6379
```

### Job Options
- `delay`: 15 * 60 * 1000 (15 minutes)
- `removeOnComplete`: true
- `removeOnFail`: 3 attempts

## Error Handling

### Job Processing Errors
- Logged to console
- Job retried up to 3 times
- Failed jobs removed from queue

### Job Scheduling Errors
- Order creation continues normally
- Warning logged
- Manual cleanup may be required

## Monitoring

### Logs
- Job scheduling: `Scheduled expiration job for order {id} in 15 minutes`
- Job execution: `Successfully expired order {id}`
- Job cancellation: `Cancelled expiration job for paid order {id}`

### Queue Status
Check BullMQ dashboard or Redis for:
- Active jobs
- Delayed jobs
- Failed jobs

## Testing

### Manual Testing
```bash
# Check Redis for jobs
redis-cli KEYS "bull:order-expiration:*"

# Check job data
redis-cli HGETALL "bull:order-expiration:delayed"
```

### Unit Testing
Test cases needed:
- Order expiration job processing
- Job cancellation on payment
- Reserved ticket release
- Error handling scenarios

## Maintenance

### Cleanup
- Failed jobs automatically removed after 3 attempts
- Successful jobs automatically removed
- Monitor Redis memory usage

### Monitoring
- Track order expiration rate
- Monitor job queue length
- Alert on high failure rates

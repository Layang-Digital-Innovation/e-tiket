import { BullModule } from '@nestjs/bull';
import { forwardRef, Module } from '@nestjs/common';
import { OrderExpirationProcessor } from './order-expiration.processor';
import { OrderModule } from './order.module';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'order-expiration',
    }),
    forwardRef(() => OrderModule),
  ],
  providers: [OrderExpirationProcessor],
  exports: [BullModule],
})
export class OrderQueueModule {}

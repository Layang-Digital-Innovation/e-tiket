import { forwardRef, Module } from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';
import { OrderItemModule } from 'src/order_item/order_item.module';
import { TicketModule } from 'src/ticket/ticket.module';
import { TicketCategoriesModule } from 'src/ticket_categories/ticket_categories.module';
import { EventsModule } from 'src/events/events.module';
import { AttendeesModule } from 'src/attendees/attendees.module';
import { PaymentModule } from 'src/payment/payment.module';
import { OrderCleanupService } from './order-cleanup.service';
import { TicketCategory } from 'src/ticket_categories/entities/ticket_category.entity';
import { OrderQueueModule } from './order-queue.module';
import { EmailModule } from 'src/email/email.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order, TicketCategory]),
    forwardRef(() => OrderItemModule),
    TicketModule,
    TicketCategoriesModule,
    EventsModule,
    AttendeesModule,
    PaymentModule,
    EmailModule,
    forwardRef(() => OrderQueueModule),
  ],
  controllers: [OrderController],
  providers: [OrderService, OrderCleanupService],
  exports: [OrderService],
})
export class OrderModule {}

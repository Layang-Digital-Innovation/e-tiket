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

@Module({
  imports: [
    TypeOrmModule.forFeature([Order]),
    forwardRef(() => OrderItemModule),
    TicketModule,
    TicketCategoriesModule,
    EventsModule,
    AttendeesModule
  ],
  controllers: [OrderController],
  providers: [OrderService],
  exports: [OrderService],
})
export class OrderModule {}

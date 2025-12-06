import { forwardRef, Module } from '@nestjs/common';
import { TicketCategoriesService } from './ticket_categories.service';
import { TicketCategoriesController } from './ticket_categories.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TicketCategory } from './entities/ticket_category.entity';
import { WristbandModule } from 'src/wristband/wristband.module';
import { EventsModule } from '../events/events.module';
import { TicketCategoriesValidationService } from './validation/validation.service';
import { OrderItem } from 'src/order_item/entities/order_item.entity';
import { Ticket } from 'src/ticket/entities/ticket.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([TicketCategory, OrderItem, Ticket]),
    forwardRef(() => WristbandModule),
    forwardRef(() => EventsModule),
  ],
  controllers: [TicketCategoriesController],
  providers: [TicketCategoriesService, TicketCategoriesValidationService],
  exports: [TicketCategoriesService, TicketCategoriesValidationService],
})
export class TicketCategoriesModule {}

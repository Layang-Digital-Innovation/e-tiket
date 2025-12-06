import { Module } from '@nestjs/common';
import { OrganizerDashboardService } from './organizer-dashboard.service';
import { OrganizerDashboardController } from './organizer-dashboard.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Event } from '../events/entities/event.entity';
import { TicketCategory } from '../ticket_categories/entities/ticket_category.entity';
import { Order } from '../order/entities/order.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Event, TicketCategory, Order])],
  controllers: [OrganizerDashboardController],
  providers: [OrganizerDashboardService],
})
export class OrganizerDashboardModule {}

import { Module } from '@nestjs/common';
import { AdminDashboardService } from './admin-dashboard.service';
import { AdminDashboardController } from './admin-dashboard.controller';
import { UsersModule } from 'src/users/users.module';
import { EventsModule } from 'src/events/events.module';
import { TicketModule } from 'src/ticket/ticket.module';
import { OrderModule } from 'src/order/order.module';

@Module({
  imports : [
    UsersModule,
    EventsModule,
    TicketModule,
    OrderModule,
  ],
  controllers: [AdminDashboardController],
  providers: [AdminDashboardService],
})
export class AdminDashboardModule {}

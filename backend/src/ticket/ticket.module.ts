import { Module } from '@nestjs/common';
import { TicketService } from './ticket.service';
import { TicketController } from './ticket.controller';

import { TypeOrmModule } from '@nestjs/typeorm';
import { Ticket } from './entities/ticket.entity';
import { TicketCategoriesModule } from 'src/ticket_categories/ticket_categories.module';
import { Attendee } from 'src/attendees/entities/attendee.entity';
import { EmailModule } from 'src/email/email.module';
  
@Module({
  imports: [
    TypeOrmModule.forFeature([Ticket, Attendee]),
    TicketCategoriesModule,
    EmailModule
  ],
  controllers: [TicketController],
  providers: [TicketService],
  exports: [TicketService],
})
export class TicketModule {}

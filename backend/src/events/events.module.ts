import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventsService } from './events.service';
import { EventsController } from './events.controller';
import { Event } from './entities/event.entity';

import { TicketCategory } from 'src/ticket_categories/entities/ticket_category.entity';



@Module({
  imports: [TypeOrmModule.forFeature([Event, TicketCategory])],
  controllers: [EventsController],
  providers: [EventsService],
  exports: [EventsService],
})
export class EventsModule {}
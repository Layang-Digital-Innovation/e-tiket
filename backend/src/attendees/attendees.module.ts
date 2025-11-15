import { Module } from '@nestjs/common';
import { AttendeesService } from './attendees.service';
import { AttendeesController } from './attendees.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Attendee } from './entities/attendee.entity';
import { TicketModule } from 'src/ticket/ticket.module';

@Module({
  imports : [ 
    TypeOrmModule.forFeature([Attendee]),
    TicketModule
  ],
  controllers: [AttendeesController],
  providers: [AttendeesService],
  exports : [AttendeesService]
})
export class AttendeesModule {}

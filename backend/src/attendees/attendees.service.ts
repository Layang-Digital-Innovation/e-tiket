import { Injectable } from '@nestjs/common';
import { CreateAttendeeDto } from './dto/create-attendee.dto';
import { UpdateAttendeeDto } from './dto/update-attendee.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Attendee } from './entities/attendee.entity';
import { Repository } from 'typeorm';
import { Ticket } from 'src/ticket/entities/ticket.entity';
import { TicketService } from 'src/ticket/ticket.service';

@Injectable()
export class AttendeesService {

   constructor(
    @InjectRepository(Attendee)
    private readonly attendeeRepository: Repository<Attendee>,
  ) {}
  create(createAttendeeDto: CreateAttendeeDto) {
    return this.attendeeRepository.save(createAttendeeDto);
  }



  findAll() {
    return `This action returns all attendees`;
  }

  findOne(id: number) {
    return `This action returns a #${id} attendee`;
  }

  update(id: number, updateAttendeeDto: UpdateAttendeeDto) {
    return `This action updates a #${id} attendee`;
  }

  remove(id: number) {
    return `This action removes a #${id} attendee`;
  }
}

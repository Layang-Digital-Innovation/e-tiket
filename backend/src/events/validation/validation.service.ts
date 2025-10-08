import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Event, EventStatus } from '../entities/event.entity';

@Injectable()
export class EventsValidationService {
  constructor(
    @InjectRepository(Event)
    private readonly eventRepo: Repository<Event>,
  ) {}

  async validateEventId(eventId: string) {
    const event = await this.eventRepo.findOne({
      where: {
        id : eventId
      },
    });
    if (!event) {
      throw new NotFoundException('Event not found');
    }
  }

   async validateEventIsActive(eventId: string): Promise<Event> {
    const event = await this.eventRepo.findOne({ where: { id: eventId } });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    if (event.status !== EventStatus.PUBLISHED) {
      throw new BadRequestException('Event is not active or not published');
    }

    const now = new Date();
    const startDate = new Date(event.startDate);
    const endDate = new Date(event.endDate);

    if (endDate < now) {
      throw new BadRequestException('Event has already ended');
    }

    if (startDate > now) {
      throw new BadRequestException('Event has not started yet');
    }

    return event;
  }


}

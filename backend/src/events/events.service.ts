import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Event, EventStatus } from './entities/event.entity';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { UserRole } from '../users/entities/user.entity';

@Injectable()
export class EventsService {
  constructor(
    @InjectRepository(Event)
    private readonly eventsRepository: Repository<Event>,
  ) {}

  async create(createEventDto: CreateEventDto, userId: string): Promise<Event> {
    // Validate dates
    const startDate = new Date(createEventDto.startDate);
    const endDate = new Date(createEventDto.endDate);

    if (startDate >= endDate) {
      throw new BadRequestException('End date must be after start date');
    }

    if (startDate < new Date()) {
      throw new BadRequestException('Start date cannot be in the past');
    }

    const event = this.eventsRepository.create({
      ...createEventDto,
      startDate,
      endDate,
      organizerId: userId,
    });

    return this.eventsRepository.save(event);
  }

  async findAll(
    page: number = 1,
    limit: number = 10,
    status?: EventStatus,
  ): Promise<{ events: Event[]; total: number; page: number; limit: number }> {
    const query = this.eventsRepository
      .createQueryBuilder('event')
      .leftJoinAndSelect('event.organizer', 'organizer')
      .leftJoinAndSelect('event.ticketCategories', 'ticketCategories')
      .orderBy('event.createdAt', 'DESC');

    if (status) {
      query.where('event.status = :status', { status });
    }

    const [events, total] = await query
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { events, total, page, limit };
  }

  async findOne(id: string): Promise<Event> {
    const event = await this.eventsRepository.findOne({
      where: { id },
      relations: ['organizer', 'ticketCategories'],
    });

    if (!event) {
      throw new NotFoundException(`Event with ID ${id} not found`);
    }

    return event;
  }

  async findByOrganizer(
    organizerId: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<{ events: Event[]; total: number; page: number; limit: number }> {
    const [events, total] = await this.eventsRepository.findAndCount({
      where: { organizerId },
      relations: ['ticketCategories'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return { events, total, page, limit };
  }

  async update(
    id: string,
    updateEventDto: UpdateEventDto,
    userId: string,
    userRole: UserRole,
  ): Promise<Event> {
    const event = await this.findOne(id);

    // Check authorization
    if (userRole !== UserRole.ADMIN && event.organizerId !== userId) {
      throw new ForbiddenException('You can only update your own events');
    }

    // Validate dates if provided
    if (updateEventDto.startDate || updateEventDto.endDate) {
      const startDate = updateEventDto.startDate
        ? new Date(updateEventDto.startDate)
        : event.startDate;
      const endDate = updateEventDto.endDate
        ? new Date(updateEventDto.endDate)
        : event.endDate;

      if (startDate >= endDate) {
        throw new BadRequestException('End date must be after start date');
      }
    }

    await this.eventsRepository.update(id, {
      ...updateEventDto,
      startDate: updateEventDto.startDate
        ? new Date(updateEventDto.startDate)
        : undefined,
      endDate: updateEventDto.endDate
        ? new Date(updateEventDto.endDate)
        : undefined,
    });

    return this.findOne(id);
  }

  async remove(id: string, userId: string, userRole: UserRole): Promise<void> {
    const event = await this.findOne(id);

    // Check authorization
    if (userRole !== UserRole.ADMIN && event.organizerId !== userId) {
      throw new ForbiddenException('You can only delete your own events');
    }

    await this.eventsRepository.remove(event);
  }

  async updateStatus(
    id: string,
    status: EventStatus,
    userId: string,
    userRole: UserRole,
  ): Promise<Event> {
    const event = await this.findOne(id);

    // Check authorization
    if (userRole !== UserRole.ADMIN && event.organizerId !== userId) {
      throw new ForbiddenException('You can only update your own events');
    }

    await this.eventsRepository.update(id, { 
      status,
    });
    return this.findOne(id);
  }
}
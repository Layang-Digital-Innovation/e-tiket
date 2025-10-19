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
import slugify from 'slugify';
import { TicketCategory } from '../ticket_categories/entities/ticket_category.entity';

@Injectable()
export class EventsService {
  constructor(
    @InjectRepository(Event)
    private readonly eventsRepository: Repository<Event>,
    @InjectRepository(TicketCategory)
    private readonly ticketCategoriesRepository: Repository<TicketCategory>,
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

    // Generate base slug
    let baseSlug = slugify(createEventDto.title, {
      lower: true,
      strict: true,
      trim: true,
    });

    let slug = baseSlug;
    let counter = 1;
    while (await this.eventsRepository.findOne({ where: { slug } })) {
      slug = `${baseSlug}-${counter++}`;
    }

    const event = this.eventsRepository.create({
      ...createEventDto,
      startDate,
      endDate,
      slug,
      organizer: { id: userId },
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

  async findBySlug(slug: string) {
    const event = await this.eventsRepository.findOne({
      where: { slug },
      relations: ['organizer', 'ticketCategories'],
    });
    if (!event)
      throw new NotFoundException(`Event with slug "${slug}" not found`);
    return event;
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
      where: { organizer: { id: organizerId } },
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
    if (userRole !== UserRole.ADMIN && event.organizer.id !== userId) {
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
    if (userRole !== UserRole.ADMIN && event.organizer.id !== userId) {
      throw new ForbiddenException('You can only delete your own events');
    }

    // Check if event is published
    if (event.status === EventStatus.PUBLISHED) {
      throw new BadRequestException(
        'Cannot delete published event. Please change status to draft or cancelled first.',
      );
    }

    // Delete related ticket categories first
    if (event.ticketCategories && event.ticketCategories.length > 0) {
      await this.ticketCategoriesRepository.remove(event.ticketCategories);
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
    if (userRole !== UserRole.ADMIN && event.organizer.id !== userId) {
      throw new ForbiddenException('You can only update your own events');
    }

    await this.eventsRepository.update(id, {
      status,
    });
    return this.findOne(id);
  }

  /**
   * Update basePrice event dengan harga termurah dari ticket categories
   */
  async updateBasePrice(eventId: string): Promise<void> {
    const ticketCategories = await this.ticketCategoriesRepository.find({
      where: { eventId },
    });

    if (ticketCategories.length === 0) {
      // Jika tidak ada ticket category, set basePrice ke 0
      await this.eventsRepository.update(eventId, { basePrice: 0 });
      return;
    }

    // Cari harga termurah dari semua ticket categories
    const minPrice = Math.min(...ticketCategories.map(tc => tc.price));

    // Update basePrice event
    await this.eventsRepository.update(eventId, { basePrice: minPrice });
  }
}

import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateTicketCategoryDto } from './dto/create-ticket_category.dto';
import { UpdateTicketCategoryDto } from './dto/update-ticket_category.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { TicketCategory } from './entities/ticket_category.entity';
import { Repository } from 'typeorm';
import { EventsValidationService } from 'src/events/validation/validation.service';
import { TicketCategoriesValidationService } from './validation/validation.service';

@Injectable()
export class TicketCategoriesService {
  constructor(
    @InjectRepository(TicketCategory)
    private readonly ticketCategoriesRepository: Repository<TicketCategory>,
    private readonly validateEventService: EventsValidationService,
    private readonly validateTicketCategoryService: TicketCategoriesValidationService,
  ) {}

  async create(createTicketCategoryDto: CreateTicketCategoryDto) {
    //validasi event apakah ada
    await this.validateEventService.validateEventId(
      createTicketCategoryDto.eventId,
    );

    const ticketCategory = this.ticketCategoriesRepository.create(
      createTicketCategoryDto,
    );
    return this.ticketCategoriesRepository.save(ticketCategory);
  }

  findAll() {
    return this.ticketCategoriesRepository.find();
  }

  findByEventId(eventId: string) {
    return this.ticketCategoriesRepository.find({ where: { eventId } });
  }

  findOne(id: string) {
    return this.ticketCategoriesRepository.findOne({ where: { id } });
  }

  async findOneOrThrow(id: string): Promise<TicketCategory> {
    const category = await this.findOne(id);
    if (!category)
      throw new NotFoundException(`Ticket category with ID ${id} not found`);
    return category;
  }

  update(id: string, updateTicketCategoryDto: UpdateTicketCategoryDto) {
    return this.ticketCategoriesRepository.update(id, updateTicketCategoryDto);
  }

  remove(id: string) {
    return this.ticketCategoriesRepository.delete(id);
  }

  async increaseSoldQuantity(
    categoryId: string,
    quantity: number,
  ): Promise<void> {
    await this.validateTicketCategoryService.validateCategoryAvailable(
      categoryId,
    );

    const category = await this.findOneOrThrow(categoryId);

    const remaining = category.maxQuantity - category.sold;
    if (remaining < quantity) {
      throw new BadRequestException(
        `Not enough tickets available. Remaining: ${remaining}, requested: ${quantity}`,
      );
    }

    category.sold += quantity;

    await this.ticketCategoriesRepository.save(category);
  }
}

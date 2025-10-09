import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreateTicketCategoryDto } from './dto/create-ticket_category.dto';
import { UpdateTicketCategoryDto } from './dto/update-ticket_category.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { TicketCategory } from './entities/ticket_category.entity';
import { Repository } from 'typeorm';
import { EventsValidationService } from 'src/events/validation/validation.service';
import { TicketCategoriesValidationService } from './validation/validation.service';
import { WristbandService } from 'src/wristband/wristband.service';

@Injectable()
export class TicketCategoriesService {

  private readonly logger = new Logger(TicketCategoriesService.name);
  constructor(
    @InjectRepository(TicketCategory)
    private readonly ticketCategoriesRepository: Repository<TicketCategory>,
    private readonly wristbandService: WristbandService,
    private readonly validateEventService: EventsValidationService,
    private readonly validateTicketCategoryService: TicketCategoriesValidationService,
  ) {}

   async create(createTicketCategoryDto: CreateTicketCategoryDto) {
    this.logger.debug('Creating new ticket category...');

    // ✅ 1. Validasi Event
    await this.validateEventService.validateEventId(createTicketCategoryDto.eventId);

    try {
      // ✅ 2. Buat entity baru dari DTO
      const ticketCategory = this.ticketCategoriesRepository.create(createTicketCategoryDto);

      // ✅ 3. Simpan ke database
      const savedTicketCategory = await this.ticketCategoriesRepository.save(ticketCategory);

      this.logger.log(
        `✅ Ticket Category created: ${savedTicketCategory.id} | Max Quantity: ${savedTicketCategory.maxQuantity}`,
      );

      // ✅ 4. Generate Wristbands secara asynchronous (pakai Bull Queue)
      await this.wristbandService.generateWristbandByMaxCapacity(
        savedTicketCategory.maxQuantity,
        savedTicketCategory.eventId,
        savedTicketCategory.id,
      );

      this.logger.log(
        `🪪 Successfully queued generation of ${savedTicketCategory.maxQuantity} wristbands for category ${savedTicketCategory.id}`,
      );

      // ✅ 5. Return data hasil simpan
      return savedTicketCategory;
    } catch (error) {
      this.logger.error('❌ Failed to create ticket category', error.stack);
      throw new BadRequestException('Failed to create ticket category: ' + error.message);
    }
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

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
import { EventsService } from 'src/events/events.service';
import { OrderItem } from 'src/order_item/entities/order_item.entity';
import { Ticket } from 'src/ticket/entities/ticket.entity';

@Injectable()
export class TicketCategoriesService {

  private readonly logger = new Logger(TicketCategoriesService.name);
  constructor(
    @InjectRepository(TicketCategory)
    private readonly ticketCategoriesRepository: Repository<TicketCategory>,
    @InjectRepository(OrderItem)
    private readonly orderItemRepository: Repository<OrderItem>,
    @InjectRepository(Ticket)
    private readonly ticketRepository: Repository<Ticket>,
    private readonly wristbandService: WristbandService,
    private readonly validateEventService: EventsValidationService,
    private readonly validateTicketCategoryService: TicketCategoriesValidationService,
    private readonly eventsService: EventsService,
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

      // ✅ 5. Update basePrice event dengan harga termurah
      await this.eventsService.updateBasePrice(savedTicketCategory.eventId);
      this.logger.log(`💰 Updated event basePrice for event ${savedTicketCategory.eventId}`);

      // ✅ 6. Return data hasil simpan
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

  async update(id: string, updateTicketCategoryDto: UpdateTicketCategoryDto) {
    const ticketCategory = await this.findOneOrThrow(id);
    const oldMaxQuantity = ticketCategory.maxQuantity;
    
    await this.ticketCategoriesRepository.update(id, updateTicketCategoryDto);
    
    const updatedCategory = await this.findOneOrThrow(id);
    
    // Update basePrice event jika harga berubah
    if (updateTicketCategoryDto.price !== undefined) {
      await this.eventsService.updateBasePrice(ticketCategory.eventId);
      this.logger.log(`💰 Updated event basePrice for event ${ticketCategory.eventId}`);
    }
    
    // Generate additional wristbands jika maxQuantity bertambah
    if (updateTicketCategoryDto.maxQuantity !== undefined && updateTicketCategoryDto.maxQuantity > oldMaxQuantity) {
      const additionalWristbands = updateTicketCategoryDto.maxQuantity - oldMaxQuantity;
      await this.wristbandService.generateWristbandByMaxCapacity(
        additionalWristbands,
        ticketCategory.eventId,
        ticketCategory.id,
      );
      this.logger.log(
        `🪪 Generated ${additionalWristbands} additional wristbands for category ${ticketCategory.id} (total now: ${updateTicketCategoryDto.maxQuantity})`,
      );
    }
    
    return updatedCategory;
  }

  async remove(id: string) {
    const ticketCategory = await this.findOneOrThrow(id);
    const eventId = ticketCategory.eventId;
    
    // ✅ Validasi: Cek apakah ada OrderItem yang menggunakan category ini
    const orderItemCount = await this.orderItemRepository.count({
      where: { ticketCategory: { id } }
    });
    
    if (orderItemCount > 0) {
      throw new BadRequestException(
        `Cannot delete ticket category. There are ${orderItemCount} order(s) associated with this category. Please cancel or complete those orders first.`
      );
    }
    
    // ✅ Validasi: Cek apakah ada Ticket yang menggunakan category ini
    const ticketCount = await this.ticketRepository.count({
      where: { category: { id } }
    });
    
    if (ticketCount > 0) {
      throw new BadRequestException(
        `Cannot delete ticket category. There are ${ticketCount} ticket(s) associated with this category.`
      );
    }
    
    // ✅ Jika lolos validasi, hapus category (wristband akan otomatis terhapus karena CASCADE)
    await this.ticketCategoriesRepository.delete(id);
    
    this.logger.log(`✅ Ticket category ${id} deleted successfully. Associated wristbands were also deleted.`);
    
    // Update basePrice event setelah ticket category dihapus
    await this.eventsService.updateBasePrice(eventId);
    this.logger.log(`💰 Updated event basePrice for event ${eventId} after deletion`);
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

  async toggleTicketStatus(categoryId: string): Promise<void> {
    const category = await this.findOneOrThrow(categoryId);
    category.isActive = !category.isActive;
    await this.ticketCategoriesRepository.save(category);
  }
}

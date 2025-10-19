import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Order, OrderStatus } from './entities/order.entity';
import { DataSource, Repository } from 'typeorm';
import { EventsValidationService } from 'src/events/validation/validation.service';
import { TicketCategoriesService } from 'src/ticket_categories/ticket_categories.service';
import { TicketCategoriesValidationService } from 'src/ticket_categories/validation/validation.service';
import { ApiResponseDto } from 'src/common/dto/api-response.dto';
import { OrderItem } from 'src/order_item/entities/order_item.entity';
import { Attendee } from 'src/attendees/entities/attendee.entity';
import { PaymentService } from 'src/payment/payment.service';
import { EventsService } from 'src/events/events.service';
import { TicketCategory } from 'src/ticket_categories/entities/ticket_category.entity';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    private readonly ticketCategoryService: TicketCategoriesService,
    private readonly ticketCategoryValidationService: TicketCategoriesValidationService,
    private readonly eventValidationService: EventsValidationService,
    private readonly eventsService: EventsService,
    private readonly paymentService: PaymentService,
    private readonly dataSource: DataSource,
  ) {}

  async createOrder(createOrderDto: CreateOrderDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      let totalAmount = 0;

      const order = queryRunner.manager.create(Order, {
        fullName: createOrderDto.buyerFullName,
        email: createOrderDto.buyerEmail,
        phoneNumber: createOrderDto.buyerPhoneNumber,
        identityType: createOrderDto.buyerIdentityType,
        identityNumber: createOrderDto.buyerIdentityNumber,
        status: OrderStatus.PENDING,
        totalAmount: 0,
        orderItems: [],
      });

      const savedOrder = await queryRunner.manager.save(order);

      for (const item of createOrderDto.items) {
        // Lock ticket category row to prevent race condition
        const category = await queryRunner.manager.findOne(TicketCategory, {
          where: { id: item.categoryId },
          lock: { mode: 'pessimistic_write' },
        });

        if (!category) {
          throw new NotFoundException(
            `Ticket category ${item.categoryId} not found`,
          );
        }

        // Check if category is active
        if (!category.isActive) {
          throw new BadRequestException(
            `Ticket category ${category.name} is not active`,
          );
        }

        // Check availability with locked data (including reserved tickets)
        const available = category.maxQuantity - category.sold - category.reserved;
        if (available < item.quantity) {
          throw new BadRequestException(
            `Not enough tickets available for ${category.name}. Available: ${available}, Requested: ${item.quantity}`,
          );
        }

        await this.eventValidationService.validateEventId(category.eventId);

        // Reserve tickets for this pending order
        category.reserved += item.quantity;
        await queryRunner.manager.save(category);

        const subtotal = Number(category.price) * item.quantity;
        totalAmount += subtotal;

        const orderItem = queryRunner.manager.create(OrderItem, {
          order: savedOrder,
          ticketCategory: category,
          quantity: item.quantity,
          unitPrice: category.price,
          subtotal,
        });
        await queryRunner.manager.save(orderItem);

        //  Buat attendee untuk tiap ticket (tetapi belum ada tiket)
        if (
          !item.detailAtendee ||
          item.detailAtendee.length !== item.quantity
        ) {
          throw new BadRequestException(
            'Jumlah attendee harus sesuai quantity',
          );
        }

        const attendeesToSave = item.detailAtendee.map(attendeeData =>
          queryRunner.manager.create(Attendee, {
            orderItem,
            fullName: attendeeData.fullName,
            email: attendeeData.email,
            phoneNumber: attendeeData.phoneNumber,
            identityType: attendeeData.identityType,
            identityNumber: attendeeData.identityNumber,
            gender: attendeeData.gender,
            address: attendeeData.address,
            birthDate: attendeeData.birthDate ? new Date(attendeeData.birthDate) : undefined,
          }));
        await queryRunner.manager.save(attendeesToSave);

        savedOrder.orderItems.push(orderItem);
      }

      savedOrder.totalAmount = totalAmount;

      await queryRunner.manager.save(savedOrder);

      Logger.log('SAVED ORDER ', savedOrder);

      const event = await this.eventsService.findOne(
        savedOrder.orderItems[0].ticketCategory.eventId,
      );

      const invoice = await this.paymentService.createInvoice({
        external_id: savedOrder.transactionCode,
        description: `Pembelian Tiket Event ${event.title}`,
        metadata: {
          event_id: savedOrder.orderItems[0].ticketCategory.eventId,
          event_name: event.title,
        },
        amount: totalAmount,
        buyerEmail: createOrderDto.buyerEmail,
        buyerName: createOrderDto.buyerFullName,
        buyerPhoneNumber: createOrderDto.buyerPhoneNumber,
        items: savedOrder.orderItems.map((item) => ({
          name: item.ticketCategory.name,
          price: Number(item.unitPrice),
          quantity: item.quantity,
        })),
      });

      await queryRunner.commitTransaction();

      Logger.log('Invoice :', invoice);

      const finalOrder = await this.orderRepository.findOne({
        where: { id: savedOrder.id },
        relations: [
          'orderItems',
          'orderItems.ticketCategory',
          'orderItems.attendees',
        ],
      });

      return {
        ...finalOrder,
        paymentUrl: invoice.invoice_url,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  findAll() {
    return `This action returns all order`;
  }

  findByTransactionCode(code: string) {
    return this.orderRepository.findOne({
      where: {
        transactionCode: code,
      },
      relations: ['orderItems', 'orderItems.ticketCategory'],
    });
  }

  async findOne(id: string) {
    return await this.orderRepository.findOne({
      where: {
        id,
      },
      relations: ['orderItems', 'orderItems.ticketCategory'],
    });
  }

  async findOneOrThrow(id: string): Promise<Order> {
    const order = await this.findOne(id);
    if (!order) throw new NotFoundException(`Order with ID ${id} not found`);
    return order;
  }

  update(id: string, updateOrderDto: UpdateOrderDto) {
    return `This action updates a #${id} order`;
  }

  async remove(id: string) {
    const order = await this.findOneOrThrow(id);
    await this.orderRepository.remove(order);
    return ApiResponseDto.success({
      message: 'Order removed successfully',
    });
  }
}

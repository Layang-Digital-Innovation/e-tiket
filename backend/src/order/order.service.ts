import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
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
import { Ticket } from 'src/ticket/entities/ticket.entity';
import { Attendee } from 'src/attendees/entities/attendee.entity';
import { CallbackSuccessDto } from './dto/callback-success.dto';
import { PaymentService } from 'src/payment/payment.service';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    private readonly ticketCategoryService : TicketCategoriesService,
    private readonly ticketCategoryValidationService : TicketCategoriesValidationService,
    private readonly eventValidationService: EventsValidationService,
    private readonly paymentService : PaymentService,
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
      const category = await this.ticketCategoryService.findOneOrThrow(item.categoryId);

      await this.eventValidationService.validateEventId(category.eventId);
      await this.ticketCategoryValidationService.validateCategoryAvailable(category.id);

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

      // ✨ Buat attendee untuk tiap ticket (tetapi belum ada tiket)
      if (!item.detailAtendee || item.detailAtendee.length !== item.quantity) {
        throw new BadRequestException('Jumlah attendee harus sesuai quantity');
      }

      for (let i = 0; i < item.quantity; i++) {
        const attendeeData = item.detailAtendee[i];
        const attendee = queryRunner.manager.create(Attendee, {
          orderItem,
          fullName: attendeeData.fullName,
          email: attendeeData.email,
          phoneNumber: attendeeData.phoneNumber,
          identityType: attendeeData.identityType,
          identityNumber: attendeeData.identityNumber,
        });
        await queryRunner.manager.save(attendee);
      }

      savedOrder.orderItems.push(orderItem);
    }

    savedOrder.totalAmount = totalAmount;
   
    await queryRunner.manager.save(savedOrder);

    Logger.log("SAVED ORDER ", savedOrder)


          const invoice = await this.paymentService.createInvoice({
      externalId: savedOrder.transactionCode,
      amount: totalAmount,
      buyerName: createOrderDto.buyerFullName,
      buyerPhoneNumber: createOrderDto.buyerPhoneNumber,
      items : savedOrder.orderItems.map((item) => ({
        name: item.ticketCategory.name,
        quantity: item.quantity,
        price: item.unitPrice,
      })),
      payerEmail: createOrderDto.buyerEmail,
      description: "Pembelian E Tiket",
      successRedirectUrl: 'https://www.google.com',
      failedRedirectUrl:  'https://www.google.com',
    });


    await queryRunner.commitTransaction();

     

    Logger.log("Invoice :", invoice)

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
      paymentUrl : invoice.invoice_url,
    }
  } catch (error) {
    await queryRunner.rollbackTransaction();
    throw error;
  } finally {
    await queryRunner.release();
  }
}

 async handlePaymentSuccess(callbackData: CallbackSuccessDto) {
  const queryRunner = this.dataSource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();

  try {
    // 1️⃣ Cari order lengkap dengan attendees
    const order = await queryRunner.manager.findOne(Order, {
      where: { transactionCode: callbackData.transactionCode },
      relations: [
        'orderItems',
        'orderItems.ticketCategory',
        'orderItems.attendees', // pastikan relasi attendee di OrderItem
      ],
    });

    if (!order) throw new NotFoundException('Order not found');
    if (order.status === OrderStatus.PAID)
      throw new BadRequestException('Order already paid');

    // 2️⃣ Update status order
    order.status = OrderStatus.PAID;
    await queryRunner.manager.save(order);

    // 3️⃣ Update stok tiket & generate tiket baru
    for (const item of order.orderItems) {
      const category = item.ticketCategory;

      // update sold count
      category.sold += item.quantity;
      await queryRunner.manager.save(category);

      // generate ticket(s)
      const ticketsToSave: Ticket[] = [];
      for (let i = 0; i < item.quantity; i++) {
        const attendee = item.attendees[i]; // 1:1 mapping dengan ticket

        const ticket = queryRunner.manager.create(Ticket, {
          orderItem: item,
          ticketCategory: category,
          order,
          attendee, // assign attendee ke ticket
        });

        ticketsToSave.push(ticket);
      }

      await queryRunner.manager.save(ticketsToSave);
    }

    // 4️⃣ Commit transaksi
    await queryRunner.commitTransaction();



    // 5️⃣ Fetch ulang order lengkap dengan tiket + attendee
    const finalOrder = await this.dataSource.getRepository(Order).findOne({
      where: { id: order.id },
      relations: [
        'orderItems',
        'orderItems.ticketCategory',
        'orderItems.tickets',
        'orderItems.tickets.attendee', // include attendee di tiket
      ],
    });

   return finalOrder
  } catch (error) {
    await queryRunner.rollbackTransaction();
    Logger.error('Payment confirmation failed:', error);
    throw error;
  } finally {
    await queryRunner.release();
  }
}

  findAll() {
    return `This action returns all order`;
  }

  findByTransactionCode (code : string){
     return this.orderRepository.findOne({
      where : {
        transactionCode : code
      },
      relations : ['orderItems', 'orderItems.ticketCategory']
     })
  }

 async findOne(id: string) {
    return await this.orderRepository.findOne({ 
      where : {
        id
      },
      relations : ['orderItems', 'orderItems.ticketCategory']
    })
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
      message : 'Order removed successfully',
    })
  }
}

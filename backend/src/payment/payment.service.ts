import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosError } from 'axios';
import { CallbackSuccessDto, XenditPaymentStatus } from 'src/payment/dto/callback-success.dto';
import { Order, OrderStatus } from 'src/order/entities/order.entity';
import { CreateOrderItemDto } from 'src/order_item/dto/create-order_item.dto';
import { Ticket } from 'src/ticket/entities/ticket.entity';
import { TicketService } from 'src/ticket/ticket.service';
import { TicketCategory } from 'src/ticket_categories/entities/ticket_category.entity';
import { DataSource } from 'typeorm';
import { EmailQueueService } from 'src/email/email-queue.service';
import { DeliveryMode } from 'src/events/entities/event.entity';
import type { Queue } from 'bull';
import { InjectQueue } from '@nestjs/bull';
import type { ExpireOrderJobData } from 'src/order/order-expiration.processor';

interface CreateInvoiceParams {
  external_id: string;
  amount: number;
  description: string;
  buyerName: string;
  buyerPhoneNumber: string;
  buyerEmail: string;
  items: {
    // reference_id: string;
    name: string;
    quantity: number;
    price: number;
  }[];
  metadata: {
    event_id: string;
    event_name: string;
  };
}

export enum XenditChannelCode {
  // Virtual Accounts
  BCA = 'ID_BCA',
  BNI = 'ID_BNI',
  BRI = 'ID_BRI',
  MANDIRI = 'ID_MANDIRI',
  PERMATA = 'ID_PERMATA',
  CIMB = 'ID_CIMB',
  BSI = 'ID_BSI',
  BJB = 'ID_BJB',
  BTN = 'ID_BTN',
  DBS = 'ID_DBS',

  // E-Wallet
  OVO = 'ID_OVO',
  DANA = 'ID_DANA',
  LINKAJA = 'ID_LINKAJA',
  SHOPEEPAY = 'ID_SHOPEEPAY',
  GOPAY = 'ID_GOPAY',

  // Retail Outlet
  ALFAMART = 'ID_ALFAMART',
  INDOMARET = 'ID_INDOMARET',

  // QRIS
  QRIS = 'ID_QRIS',

  // Credit/Debit Card
  CREDIT_CARD = 'ID_CREDIT_CARD',
}

@Injectable()
export class PaymentService {
  private readonly xenditUrl = 'https://api.xendit.co';
  private readonly logger = new Logger(PaymentService.name);
  private readonly xenditPublicKey: string;
  private readonly xenditSecretKey: string;
  private frontendUrl: string;
  constructor(
    private configService: ConfigService,
    private readonly ticketService: TicketService,
    private readonly emailQueueService: EmailQueueService,
    private readonly dataSource: DataSource,
    @InjectQueue('order-expiration')
    private readonly orderExpirationQueue: Queue<ExpireOrderJobData>,
  ) {
    this.xenditPublicKey =
      this.configService.get<string>('XENDIT_PUBLIC_KEY') ?? '';
    this.xenditSecretKey =
      this.configService.get<string>('XENDIT_SECRET_KEY') ?? '';
    this.frontendUrl =
      this.configService.get<string>('FRONTEND_URL') ?? 'http://localhost:3000';
  }

  async createInvoice(params: CreateInvoiceParams) {
    const {
      external_id,
      amount,
      buyerName,
      buyerPhoneNumber,
      buyerEmail,
      items,
    } = params;

    // Validasi input
    if (!external_id || !amount || !buyerName || !buyerPhoneNumber) {
      throw new BadRequestException(
        'Missing required fields for invoice creation',
      );
    }

    if (amount <= 0) {
      throw new BadRequestException('Amount must be greater than 0');
    }

    try {
      const payload = {
        external_id,
        customer: {
          email: buyerEmail,
          mobile_number: buyerPhoneNumber,
          individual_detail: {
            given_names: buyerName,
          },
        },
        country: 'ID',
        currency: 'IDR',
        amount,
        channel_properties: {},
        mode: 'PAYMENT_LINK',
        items,
        success_redirect_url: `${this.frontendUrl}/payment/success?order_id=${external_id}`,
        failure_redirect_url: `${this.frontendUrl}/payment/failure?order_id=${external_id}`,
      };

      this.logger.log(`Payload: ${JSON.stringify(payload)}`);

      this.logger.log(`Creating invoice for external ID: ${external_id}`);

      const response = await axios.post(
        `${this.xenditUrl}/v2/invoices`,
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Basic ${Buffer.from(this.xenditSecretKey).toString('base64')}`,
          },
        },
      );

      this.logger.log(`Invoice created successfully: ${response.data.id}`);
      return response.data;
    } catch (error) {
      this.logger.error('Failed to create invoice', error);

      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError;
        const errorMessage = axiosError.response?.data || axiosError.message;
        const statusCode = axiosError.response?.status;

        this.logger.error(`Xendit API error [${statusCode}]:`, errorMessage);

        throw new BadRequestException({
          message: 'Failed to create payment invoice',
          error: errorMessage,
          statusCode,
        });
      }

      throw new BadRequestException(
        'An unexpected error occurred while creating invoice',
      );
    }
  }

async handlePaymentSuccess(callbackData: CallbackSuccessDto) {
  const queryRunner = this.dataSource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();

  try {
    // Validate payment status
    if (callbackData.status !== XenditPaymentStatus.PAID) {
      throw new BadRequestException(`Invalid payment status: ${callbackData.status}`);
    }

    // 1️⃣ Cari dan lock order terlebih dahulu
    const order = await queryRunner.manager.findOne(Order, {
      where: { transactionCode: callbackData.external_id },
      lock: { mode: 'pessimistic_write' },
    });

    if (!order) throw new NotFoundException('Order not found');

    this.logger.log(`Processing payment for order: ${callbackData.external_id}`);

   // Idempotency check
if (order.status === OrderStatus.PAID && order.paymentId === callbackData.payment_id) {
  this.logger.warn(`Duplicate webhook ignored for order ${callbackData.external_id}`);
  return order;
}

    // Load relations setelah order di-lock
    const orderWithRelations = await queryRunner.manager.findOne(Order, {
      where: { id: order.id },
      relations: [
        'orderItems',
        'orderItems.ticketCategory',
        'orderItems.ticketCategory.event',
        'orderItems.attendees',
      ],
    });

    if (!orderWithRelations) throw new NotFoundException('Order not found');

    // Gunakan object dengan relations untuk processing
    Object.assign(order, orderWithRelations);

    // 2️⃣ Update status order
    order.status = OrderStatus.PAID;
    order.paymentMethod = callbackData.payment_method;
    order.paymentChannel = callbackData.payment_channel;
    order.paymentId = callbackData.payment_id || callbackData.id;
    order.paidAt = callbackData.paid_at ? new Date(callbackData.paid_at) : new Date();
    await queryRunner.manager.save(order);

    // Cancel the expiration job since order is now paid
    try {
      const jobs = await this.orderExpirationQueue.getJobs(['delayed', 'waiting', 'active']);
      const expirationJob = jobs.find(job => job.data.orderId === order.id);
      if (expirationJob) {
        await expirationJob.remove();
        this.logger.log(`Cancelled expiration job for paid order ${order.id}`);
      }
    } catch (jobError) {
      this.logger.warn(`Failed to cancel expiration job for order ${order.id}:`, jobError);
      // Don't fail payment processing if job cancellation fails
    }

    // 3️⃣ Update stok tiket & collect tickets to generate
    const allTicketsToSave: Ticket[] = [];
    for (const item of order.orderItems) {
      const category = await queryRunner.manager.findOne(TicketCategory, {
        where: { id: item.ticketCategory.id },
        lock: { mode: 'pessimistic_write' },
      });

      if (!category) {
        throw new NotFoundException(`Ticket category ${item.ticketCategory.id} not found`);
      }

      // Move from reserved to sold
      category.reserved -= item.quantity;
      
      const remaining = category.maxQuantity - category.sold;
      if (item.quantity > remaining) {
        throw new BadRequestException(
          `Not enough tickets available. Remaining: ${remaining}, requested: ${item.quantity}`,
        );
      }
      category.sold += item.quantity;
      
      // Prevent negative reserved (safety check)
      if (category.reserved < 0) category.reserved = 0;
      
      await queryRunner.manager.save(category);

      // collect tickets untuk tiap attendee
      for (let i = 0; i < item.quantity; i++) {
        const attendee = item.attendees[i];
        const ticket = queryRunner.manager.create(Ticket, {
          orderItem: item,
          category,
          order,
          attendee,
        });
        allTicketsToSave.push(ticket);
      }
    }

    // ✅ Simpan semua tiket sekaligus
    await queryRunner.manager.save(allTicketsToSave);

    // 4️⃣ Commit transaksi
    await queryRunner.commitTransaction();

    // 5️⃣ Send ticket emails via queue (after transaction)
    for (const ticket of allTicketsToSave) {
      this.logger.log(`Queueing ticket email for ${ticket.attendee.email}`);

      // Add ticket email to queue
      await this.emailQueueService.addTicketEmail({
        email: ticket.attendee.email,
        subject: `Your Ticket for ${ticket.orderItem.ticketCategory.event.title}`,
        ticket: {
          eventName: ticket.orderItem.ticketCategory.event.title,
          ticketCode: ticket.ticketCode,
          attendeeName: ticket.attendee.fullName,
          startDate: ticket.orderItem.ticketCategory.event.startDate.toISOString(),
          endDate: ticket.orderItem.ticketCategory.event.endDate.toISOString(),
          location: ticket.orderItem.ticketCategory.event.location,
          categoryName: ticket.orderItem.ticketCategory.name,
        },
        transactionCode: order.transactionCode,
        totalAmount: order.totalAmount,
        paymentMethod: order.paymentMethod,
        status: order.status,
        attendeeEmail: ticket.attendee.email,
        attendeePhone: ticket.attendee.phoneNumber,
        attendeeIdentityType: ticket.attendee.identityType,
        attendeeIdentityNumber: ticket.attendee.identityNumber,
      });
    }

    // 5.1️⃣ Enqueue Webinar Access email (Phase 1) for ONLINE events with join URL
    for (const ticket of allTicketsToSave) {
      const event = ticket.orderItem.ticketCategory.event;
      const attendee = ticket.attendee;
      if (event && event.deliveryMode === DeliveryMode.ONLINE && event.webinarJoinUrl && attendee?.email) {
        await this.emailQueueService.addWebinarAccessEmail({
          to: attendee.email,
          attendeeName: attendee.fullName ?? '',
          eventTitle: event.title ?? 'Webinar',
          startAt: event.startDate,
          endAt: event.endDate,
          webinarJoinUrl: event.webinarJoinUrl,
        });
      }
    }

    // 6️⃣ Send order summary email via queue (after transaction)
    if (order.fullName) {
      this.logger.log(`Queueing order summary email for ${order.email}`);

      // Add order summary email to queue
      await this.emailQueueService.addOrderSummaryEmail({
        email: order.email,
        buyerName: order.fullName,
        transactionCode: order.transactionCode,
        totalAmount: order.totalAmount,
        paymentMethod: order.paymentMethod ?? 'Unknown',
        status: order.status,
        orderItems: order.orderItems.map((item) => ({
          eventName: item.ticketCategory.event.title,
          ticketCategory: item.ticketCategory.name,
          quantity: item.quantity,
          attendees: item.attendees.map((att) => ({
            name: att.fullName ?? '',
            email: att.email ?? '',
            phone: att.phoneNumber ?? '',
            identityType: att.identityType ?? '',
            identityNumber: att.identityNumber ?? '',
          })),
        })),
      });
    }

    // 7️⃣ Fetch ulang order lengkap dengan tiket + attendee
    const finalOrder = await queryRunner.manager.findOne(Order, {
      where: { id: order.id },
      relations: [
        'orderItems',
        'orderItems.ticketCategory',
        'orderItems.tickets',
        'orderItems.tickets.attendee',
      ],
    });

    return finalOrder;
  } catch (error) {
    await queryRunner.rollbackTransaction();
    this.logger.error('Payment confirmation failed:', error);
    throw error;
  } finally {
    await queryRunner.release();
  }
}
}

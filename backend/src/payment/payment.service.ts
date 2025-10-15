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
import { DataSource } from 'typeorm';
import { EmailQueueService } from 'src/email/email-queue.service';

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
  constructor(
    private configService: ConfigService,
    private readonly ticketService: TicketService,
    private readonly emailQueueService: EmailQueueService,
    private readonly dataSource: DataSource,
  ) {
    this.xenditPublicKey =
      this.configService.get<string>('XENDIT_PUBLIC_KEY') ?? '';
    this.xenditSecretKey =
      this.configService.get<string>('XENDIT_SECRET_KEY') ?? '';
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
        success_redirect_url: 'https://xendit.co/id/success',
        failure_redirect_url: 'https://xendit.co/id/failure',
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

    // 1️⃣ Cari order lengkap
    const order = await queryRunner.manager.findOne(Order, {
      where: { transactionCode: callbackData.external_id },
      relations: [
        'orderItems',
        'orderItems.ticketCategory',
        'orderItems.ticketCategory.event',
        'orderItems.attendees', 
      ],
    });

    this.logger.log(`Processing payment for order: ${callbackData.external_id}`);

    if (!order) throw new NotFoundException('Order not found');
    if (order.status === OrderStatus.PAID) {
      this.logger.warn(`Order ${callbackData.external_id} already paid`);
      throw new BadRequestException('Order already paid');
    }

    // 2️⃣ Update status order
    order.status = OrderStatus.PAID;
    order.paymentMethod = callbackData.payment_method;
    order.paymentChannel = callbackData.payment_channel;
    order.paymentId = callbackData.payment_id || callbackData.id;
    order.paidAt = callbackData.paid_at ? new Date(callbackData.paid_at) : new Date();
    await queryRunner.manager.save(order);

    // 3️⃣ Update stok tiket & collect tickets to generate
    const allTicketsToSave: Ticket[] = [];
    for (const item of order.orderItems) {
      const category = item.ticketCategory;

      // update sold count
      category.sold += item.quantity;
      await queryRunner.manager.save(category);

      // collect tickets untuk tiap attendee
      for (let i = 0; i < item.quantity; i++) {
        const attendee = item.attendees[i];
        const ticket = queryRunner.manager.create(Ticket, {
          orderItem: item,
          ticketCategory: category,
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

import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosError } from 'axios';
import { CallbackSuccessDto } from 'src/payment/dto/callback-success.dto';
import { Order, OrderStatus } from 'src/order/entities/order.entity';
import { CreateOrderItemDto } from 'src/order_item/dto/create-order_item.dto';
import { Ticket } from 'src/ticket/entities/ticket.entity';
import { TicketService } from 'src/ticket/ticket.service';
import { DataSource } from 'typeorm';

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
      // 1️⃣ Cari order lengkap dengan attendees
      const order = await queryRunner.manager.findOne(Order, {
        where: { transactionCode: callbackData.external_id },
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
      order.paymentMethod = callbackData.payment_method;
      order.paymentChannel = callbackData.payment_channel;
      order.paidAt = callbackData.paid_at ? new Date(callbackData.paid_at) : undefined;

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

      return finalOrder;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      Logger.error('Payment confirmation failed:', error);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

 
}

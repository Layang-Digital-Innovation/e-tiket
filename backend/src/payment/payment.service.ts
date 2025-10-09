import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosError } from 'axios';
import { CreateOrderItemDto } from 'src/order_item/dto/create-order_item.dto';


interface CreateInvoiceParams {
  externalId: string;
  amount: number;
  buyerName: string;
  buyerPhoneNumber: string;
  items: {
    name: string;
    quantity: number;
    price: number;
  }[]
  payerEmail: string;
  description?: string;
  successRedirectUrl?: string;
  failedRedirectUrl?: string;
}

export interface XenditInvoiceResponse {
  id: string;
  external_id: string;
  amount: number;
  status: string;
  invoice_url: string;
  payment_method: string;
  created: string;
}


@Injectable()
export class PaymentService {
  private readonly xenditUrl = 'https://api.xendit.co/v2';
   private readonly logger = new Logger(PaymentService.name);
  private readonly xenditPublicKey : string;
  private readonly xenditSecretKey : string;
  constructor (private configService : ConfigService) {
    this.xenditPublicKey = this.configService.get<string>('XENDIT_PUBLIC_KEY') ?? '';
    this.xenditSecretKey = this.configService.get<string>('XENDIT_SECRET_KEY') ?? '';
  }


   async createInvoice(params: CreateInvoiceParams): Promise<XenditInvoiceResponse> {
    const {
      externalId,
      amount,
      buyerName,
      buyerPhoneNumber,
      items,
      payerEmail,
      description,
      successRedirectUrl,
      failedRedirectUrl,
    } = params;

    // Validasi input
    if (!externalId || !amount || !buyerName || !buyerPhoneNumber || !payerEmail) {
      throw new BadRequestException('Missing required fields for invoice creation');
    }

    if (amount <= 0) {
      throw new BadRequestException('Amount must be greater than 0');
    }

    try {
      const payload = {
        external_id: externalId,
        amount,
        items,
        invoice_duration: 86400, // 24 jam
        customer: {
          given_names: buyerName,
          mobile_number: buyerPhoneNumber,
          email: payerEmail,
        },
        description: description || `Invoice for order ${externalId}`,
        currency: 'IDR',
        ...(successRedirectUrl && { success_redirect_url: successRedirectUrl }),
        ...(failedRedirectUrl && { failure_redirect_url: failedRedirectUrl }),
      };

      this.logger.log(`Creating invoice for external ID: ${externalId}`);

      const response = await axios.post<XenditInvoiceResponse>(
        `${this.xenditUrl}/invoices`,
        payload,
        {
          auth: {
            username: this.xenditSecretKey,
            password: '',
          },
          headers: {
            'Content-Type': 'application/json',
          },
          timeout: 10000, // 10 detik timeout
        }
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

      throw new BadRequestException('An unexpected error occurred while creating invoice');
    }
  }

  findAll() {
    return `This action returns all payment`;
  }

  findOne(id: number) {
    return `This action returns a #${id} payment`;
  }



  remove(id: number) {
    return `This action removes a #${id} payment`;
  }
}

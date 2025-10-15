import { 
  Body, 
  Controller, 
  Headers, 
  Post, 
  ValidationPipe, 
  BadRequestException,
  Logger,
  HttpCode,
  HttpStatus
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PaymentService } from './payment.service';
import { CallbackSuccessDto, XenditPaymentStatus } from 'src/payment/dto/callback-success.dto';

@Controller('api/payment')
export class PaymentController {
  private readonly logger = new Logger(PaymentController.name);

  constructor(
    private readonly paymentService: PaymentService,
    private readonly configService: ConfigService
  ) {}

  @Post('/callback')
  @HttpCode(HttpStatus.OK)
  async handlePaymentCallback(
    @Body(new ValidationPipe({
      transform: true,
      whitelist: true,              // ✅ Hanya validasi field yang didefinisikan
      forbidNonWhitelisted: false, // ✅ Abaikan field tambahan dari Xendit
      skipMissingProperties: false, // ✅ Validasi semua required fields
      stopAtFirstError: false,
    })) callbackData: CallbackSuccessDto,
    @Headers('x-callback-token') webhookToken?: string
  ) {
    this.logger.log(`Received webhook callback for external_id: ${callbackData.external_id}`);
    this.logger.debug(`Webhook payload: ${JSON.stringify(callbackData)}`);

    // 1. Verify webhook token
    const expectedToken = this.configService.get<string>('XENDIT_WEBHOOK_TOKEN');
    if (expectedToken && webhookToken !== expectedToken) {
      this.logger.error('Invalid webhook token received');
      throw new BadRequestException('Invalid webhook token');
    }

    // 2. Validate payment status
    if (callbackData.status !== XenditPaymentStatus.PAID) {
      this.logger.warn(`Received non-PAID status: ${callbackData.status} for ${callbackData.external_id}`);
      return {
        success: true,
        message: `Webhook received with status: ${callbackData.status}`,
        data: null
      };
    }

    // 3. Process payment success
    try {
      const result = await this.paymentService.handlePaymentSuccess(callbackData);
      this.logger.log(`Successfully processed payment for ${callbackData.external_id}`);
      
      return {
        success: true,
        message: 'Payment processed successfully',
        data: result
      };
    } catch (error) {
      this.logger.error(`Failed to process payment callback: ${error.message}`, error.stack);
      throw error;
    }
  }
}

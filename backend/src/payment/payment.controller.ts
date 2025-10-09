import { Body, Controller, Post, ValidationPipe } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { CallbackSuccessDto } from 'src/payment/dto/callback-success.dto';

@Controller('api/payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post('/callback')
  handlePaymentCallback(@Body(new ValidationPipe({
      transform: true,
      whitelist: true,           // hapus field yang tidak didefinisikan di DTO
      forbidNonWhitelisted: false,
      skipMissingProperties: true, // penting: jangan gagal jika ada property yang hilang
      stopAtFirstError: false,
    })) callbackData: CallbackSuccessDto) {
    return this.paymentService.handlePaymentSuccess(callbackData);
  }
}

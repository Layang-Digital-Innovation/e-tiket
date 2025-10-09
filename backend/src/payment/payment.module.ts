import { Module } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { TicketModule } from 'src/ticket/ticket.module';
import { PaymentController } from './payment.controller';

@Module({
  imports: [TicketModule],
  providers: [PaymentService],
  exports: [PaymentService],
  controllers: [PaymentController],
})
export class PaymentModule {}

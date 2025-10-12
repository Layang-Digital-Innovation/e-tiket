import { Module } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { TicketModule } from 'src/ticket/ticket.module';
import { PaymentController } from './payment.controller';
import { EmailModule } from 'src/email/email.module';

@Module({
  imports: [TicketModule, EmailModule],
  providers: [PaymentService],
  exports: [PaymentService],
  controllers: [PaymentController],
})
export class PaymentModule {}

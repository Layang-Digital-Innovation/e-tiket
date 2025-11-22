import { Module } from '@nestjs/common';
import { EmailService } from './email.service.resend';
import { EmailQueueModule } from './email-queue.module';
import { EmailController } from './email.controller';

@Module({
  imports: [EmailQueueModule],
  providers: [EmailService],
  exports: [EmailService, EmailQueueModule],
  controllers: [EmailController],
})
export class EmailModule {}
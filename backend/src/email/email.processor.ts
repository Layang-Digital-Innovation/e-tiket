import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import type { Job } from 'bull';
import { EmailService } from './email.service';
import type { EmailJobData } from './email-queue.service';

@Processor('email')
export class EmailProcessor {
  private readonly logger = new Logger(EmailProcessor.name);

  constructor(private readonly emailService: EmailService) {}

  @Process('send-ticket-email')
  async handleTicketEmail(job: Job<EmailJobData>) {
    this.logger.log(`Processing ticket email job ${job.id}`);

    try {
      const { email, subject, ticket, transactionCode, status, totalAmount, paymentMethod, attendeeEmail, attendeePhone, attendeeIdentityType, attendeeIdentityNumber } = job.data.data;

      await this.emailService.sendTicketEmail({
        email,
        subject,
        ticket,
        transactionCode,
        status,
        totalAmount,
        paymentMethod,
        attendeeEmail,
        attendeePhone,
        attendeeIdentityType,
        attendeeIdentityNumber,
      });

      this.logger.log(`Successfully sent ticket email to ${email}`);
    } catch (error) {
      this.logger.error(`Failed to send ticket email for job ${job.id}`, error);
      throw error; // This will mark the job as failed and retry
    }
  }

  @Process('send-order-summary-email')
  async handleOrderSummaryEmail(job: Job<EmailJobData>) {
    this.logger.log(`Processing order summary email job ${job.id}`);

    try {
      const { email, buyerName, transactionCode, totalAmount, paymentMethod, status, orderItems } = job.data.data;

      await this.emailService.sendOrderSummary({
        email,
        buyerName,
        transactionCode,
        totalAmount,
        paymentMethod,
        status,
        orderItems,
      });

      this.logger.log(`Successfully sent order summary email to ${email}`);
    } catch (error) {
      this.logger.error(`Failed to send order summary email for job ${job.id}`, error);
      throw error; // This will mark the job as failed and retry
    }
  }
}

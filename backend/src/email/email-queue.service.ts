import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import type { Queue } from 'bull';

export interface EmailJobData {
  type: 'ticket' | 'order-summary' | 'webinar-access';
  data: any;
}

@Injectable()
export class EmailQueueService {
  private readonly logger = new Logger(EmailQueueService.name);

  constructor(
    @InjectQueue('email') private readonly emailQueue: Queue<EmailJobData>,
  ) {}

  async addTicketEmail(data: {
    email: string;
    subject: string;
    ticket: {
      eventName: string;
      ticketCode: string;
      attendeeName: string;
      startDate: string;
      endDate: string;
      location: string;
      categoryName: string;
    };
    transactionCode?: string;
    status?: string;
    totalAmount?: number;
    paymentMethod?: string;
    attendeeEmail?: string;
    attendeePhone?: string;
    attendeeIdentityType?: string;
    attendeeIdentityNumber?: string;
  }) {
    await this.emailQueue.add('send-ticket-email', {
      type: 'ticket',
      data,
    });
    this.logger.log(`Added ticket email job for ${data.email}`);
  }

  async addOrderSummaryEmail(data: {
    email: string;
    buyerName: string;
    transactionCode: string;
    totalAmount: number;
    paymentMethod: string;
    status: string;
    orderItems: any[];
  }) {
    await this.emailQueue.add('send-order-summary-email', {
      type: 'order-summary',
      data,
    });
    this.logger.log(`Added order summary email job for ${data.email}`);
  }

  async addWebinarAccessEmail(data: {
    to: string;
    attendeeName: string;
    eventTitle: string;
    startAt?: string | Date;
    endAt?: string | Date;
    timezone?: string;
    webinarJoinUrl: string;
    webinarNotes?: string;
  }) {
    await this.emailQueue.add('send-webinar-access-email', {
      type: 'webinar-access',
      data,
    });
    this.logger.log(`Added webinar access email job for ${data.to}`);
  }
}

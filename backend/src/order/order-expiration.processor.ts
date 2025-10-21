import { Processor, Process } from '@nestjs/bull';
import { Injectable, Logger } from '@nestjs/common';
import type { Job } from 'bull';
import { OrderService } from '../order/order.service';

export interface ExpireOrderJobData {
  orderId: string;
}

@Injectable()
@Processor('order-expiration')
export class OrderExpirationProcessor {
  private readonly logger = new Logger(OrderExpirationProcessor.name);

  constructor(private readonly orderService: OrderService) {}

  @Process()
  async handle(job: Job<ExpireOrderJobData>): Promise<void> {
    const { orderId } = job.data;

    this.logger.log(`Processing order expiration for order ${orderId}`);

    try {
      await this.orderService.expireOrder(orderId);
      this.logger.log(`Successfully expired order ${orderId}`);
    } catch (error) {
      this.logger.error(`Failed to expire order ${orderId}:`, error);
      throw error;
    }
  }
}

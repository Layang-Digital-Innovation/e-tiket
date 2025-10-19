import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { Order, OrderStatus } from './entities/order.entity';
import { TicketCategory } from 'src/ticket_categories/entities/ticket_category.entity';

@Injectable()
export class OrderCleanupService {
  private readonly logger = new Logger(OrderCleanupService.name);
  private readonly RESERVATION_TIMEOUT_MINUTES = 15; // 15 minutes to pay

  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(TicketCategory)
    private readonly ticketCategoryRepository: Repository<TicketCategory>,
  ) {}

  /**
   * Runs every 5 minutes to clean up expired pending orders
   */
  @Cron(CronExpression.EVERY_5_MINUTES)
  async handleExpiredOrders() {
    this.logger.log('Starting expired orders cleanup...');

    try {
      // Calculate expiration time (15 minutes ago)
      const expirationTime = new Date();
      expirationTime.setMinutes(
        expirationTime.getMinutes() - this.RESERVATION_TIMEOUT_MINUTES,
      );

      // Find all pending orders older than 15 minutes
      const expiredOrders = await this.orderRepository.find({
        where: {
          status: OrderStatus.PENDING,
          createdAt: LessThan(expirationTime),
        },
        relations: ['orderItems', 'orderItems.ticketCategory'],
      });

      if (expiredOrders.length === 0) {
        this.logger.log('No expired orders found');
        return;
      }

      this.logger.log(`Found ${expiredOrders.length} expired orders`);

      // Process each expired order
      for (const order of expiredOrders) {
        try {
          // Acquire lock for order processing
          await this.orderRepository.manager.transaction(
            async (transactionalEntityManager) => {
              this.logger.log(
                `Processing order ${order.transactionCode} in transaction`,
              );

              // Release reserved tickets
              for (const item of order.orderItems) {
                const category = await transactionalEntityManager.findOne(
                  TicketCategory,
                  {
                    where: { id: item.ticketCategory.id },
                    lock: { mode: 'pessimistic_write' },
                  },
                );

                if (!category) {
                  this.logger.warn(
                    `Ticket category ${item.ticketCategory.id} not found`,
                  );
                  continue;
                }

                // Decrement reserved count
                category.reserved -= item.quantity;

                // Prevent negative reserved
                if (category.reserved < 0) category.reserved = 0;

                await transactionalEntityManager.save(category);

                this.logger.log(
                  `Released ${item.quantity} reserved tickets for category ${category.name}`,
                );
              }

              // Update order status to EXPIRED
              order.status = OrderStatus.EXPIRED;
              await transactionalEntityManager.save(order);

              this.logger.log(
                `Order ${order.transactionCode} marked as EXPIRED`,
              );
            },
          );
        } catch (error) {
          this.logger.error(
            `Failed to process expired order ${order.transactionCode}:`,
            error,
          );
        }
      }

      this.logger.log(
        `Successfully processed ${expiredOrders.length} expired orders`,
      );
    } catch (error) {
      this.logger.error('Failed to clean up expired orders:', error);
    }
  }

  /**
   * Manual cleanup for testing purposes
   */
  async cleanupExpiredOrdersManually(): Promise<{
    processed: number;
    errors: number;
  }> {
    this.logger.log('Manual cleanup triggered');

    const expirationTime = new Date();
    expirationTime.setMinutes(
      expirationTime.getMinutes() - this.RESERVATION_TIMEOUT_MINUTES,
    );

    const expiredOrders = await this.orderRepository.find({
      where: {
        status: OrderStatus.PENDING,
        createdAt: LessThan(expirationTime),
      },
      relations: ['orderItems', 'orderItems.ticketCategory'],
    });

    let processed = 0;
    let errors = 0;

    for (const order of expiredOrders) {
      try {
        await this.orderRepository.manager.transaction(
          async (transactionalEntityManager) => {
            this.logger.log(
              `Processing order ${order.transactionCode} in transaction`,
            );

            for (const item of order.orderItems) {
              const category = await transactionalEntityManager.findOne(
                TicketCategory,
                {
                  where: { id: item.ticketCategory.id },
                  lock: { mode: 'pessimistic_write' },
                },
              );

              if (!category) {
                this.logger.warn(
                  `Ticket category ${item.ticketCategory.id} not found`,
                );
                continue;
              }

              category.reserved -= item.quantity;
              if (category.reserved < 0) category.reserved = 0;
              await transactionalEntityManager.save(category);
            }

            order.status = OrderStatus.EXPIRED;
            await transactionalEntityManager.save(order);
            this.logger.log(
              `Order ${order.transactionCode} manually marked as EXPIRED`,
            );
          },
        );
        processed++;
      } catch (error) {
        errors++;
        this.logger.error(`Error processing order ${order.id}:`, error);
      }
    }

    return { processed, errors };
  }
}

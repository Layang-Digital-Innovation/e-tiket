import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue, Process, Processor } from '@nestjs/bull';
import type { Job, Queue } from 'bull';
import { RedeemService } from './redeem.service';
import type { GenerateRedeemItemsJobData } from './types/redeem-queue.types';

@Injectable()
@Processor('redeem-queue')
export class RedeemQueueProcessor {
  private readonly logger = new Logger(RedeemQueueProcessor.name);

  constructor(
    @InjectQueue('redeem-queue')
    private readonly redeemQueue: Queue,
    private readonly redeemService: RedeemService,
  ) {}

  @Process('generate-bulk-redeem-items')
  async handleGenerateBulkRedeemItems(job: Job<GenerateRedeemItemsJobData>) {
    const { ticketCategoryId, quantity, organizerId } = job.data;

    this.logger.log(
      `Starting bulk redeem item generation: category=${ticketCategoryId}, quantity=${quantity}, organizer=${organizerId}`,
    );

    try {
      // Update job progress
      await job.progress(0);

      // Execute the bulk generation
      const result = await this.redeemService.generateRedeemItemsBulkSync(ticketCategoryId, quantity);

      // Update progress to 100%
      await job.progress(100);

      this.logger.log(
        `Successfully generated ${quantity} redeem items for category ${ticketCategoryId}`,
      );

      return result;
    } catch (error) {
      this.logger.error(
        `Failed to generate redeem items: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  // Method to add bulk generation job to queue
  async addBulkGenerationJob(data: GenerateRedeemItemsJobData) {
    const job = await this.redeemQueue.add(
      'generate-bulk-redeem-items',
      data,
      {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 5000,
        },
        removeOnComplete: 50, // Keep last 50 completed jobs
        removeOnFail: 10, // Keep last 10 failed jobs
      },
    );

    this.logger.log(`Added bulk generation job to queue: ${job.id}`);
    return job;
  }

  // Get job status
  async getJobStatus(jobId: string) {
    const job = await this.redeemQueue.getJob(jobId);
    if (!job) {
      return null;
    }

    const state = await job.getState();
    const progress = job.progress();

    return {
      id: job.id,
      state,
      progress,
      data: job.data,
      finishedOn: job.finishedOn,
      failedReason: job.failedReason,
      returnvalue: job.returnvalue,
    };
  }
}

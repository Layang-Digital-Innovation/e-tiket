import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import type { Job } from 'bull';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Wristband, WristbandStatus } from '../entities/wristband.entity';
import { CreateWristbandDto } from '../dto/create-wristband.dto';

@Processor('wristband')
export class WristbandProcessor {
  private readonly logger = new Logger(WristbandProcessor.name);

  constructor(
    @InjectRepository(Wristband)
    private wristbandRepository: Repository<Wristband>,
  ) {}

  @Process('generate-stock')
  async handleGenerateStock(job: Job<{ maxCapacity: number; eventId: string; categoryId: string }>) {
    this.logger.debug(`Processing generate stock job ${job.id}`);
    const { maxCapacity, eventId, categoryId } = job.data;
    
    try {
      const wristbands: CreateWristbandDto[] = [];
      for (let i = 0; i < maxCapacity; i++) {
        wristbands.push({
          eventId,
          categoryId,
          status: WristbandStatus.UNUSED,
        });
      }
      
      // Simpan dalam batch untuk mengurangi beban database
      const batchSize = 100;
      for (let i = 0; i < wristbands.length; i += batchSize) {
        const batch = wristbands.slice(i, i + batchSize);
        await this.wristbandRepository.save(batch);
        this.logger.debug(`Saved batch ${i / batchSize + 1} of ${Math.ceil(wristbands.length / batchSize)}`);
      }
      
      this.logger.debug(`Successfully generated ${maxCapacity} wristbands for event ${eventId}, category ${categoryId}`);
      return { success: true, count: maxCapacity };
    } catch (error) {
      this.logger.error(`Failed to generate wristband stock: ${error.message}`, error.stack);
      throw error;
    }
  }

  @Process('upload-data')
  async handleUploadData(job: Job<{ wristbands: CreateWristbandDto[] }>) {
    this.logger.debug(`Processing upload data job ${job.id}`);
    const { wristbands } = job.data;
    
    try {
      // Simpan dalam batch untuk mengurangi beban database
      const batchSize = 100;
      for (let i = 0; i < wristbands.length; i += batchSize) {
        const batch = wristbands.slice(i, i + batchSize);
        await this.wristbandRepository.save(batch);
        this.logger.debug(`Saved batch ${i / batchSize + 1} of ${Math.ceil(wristbands.length / batchSize)}`);
      }
      
      this.logger.debug(`Successfully uploaded ${wristbands.length} wristbands`);
      return { success: true, count: wristbands.length };
    } catch (error) {
      this.logger.error(`Failed to upload wristband data: ${error.message}`, error.stack);
      throw error;
    }
  }
}
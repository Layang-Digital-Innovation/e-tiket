import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { CreateWristbandDto } from './dto/create-wristband.dto';
import { UpdateWristbandDto } from './dto/update-wristband.dto';
import { Wristband, WristbandStatus } from './entities/wristband.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { InjectQueue } from '@nestjs/bull';
import type { Queue } from 'bull';

@Injectable()
export class WristbandService {
  private readonly logger = new Logger(WristbandService.name);

  constructor(
    @InjectRepository(Wristband) private wristbandRepository: Repository<Wristband>,
    @InjectQueue('wristband') private wristbandQueue: Queue
  ) {}

  create(createWristbandDto: CreateWristbandDto) {
    return this.wristbandRepository.save(createWristbandDto);
  }

  async generateWristbandByMaxCapacity(maxCapacity: number, eventId: string, categoryId: string) {
    this.logger.log(`Queueing generation of ${maxCapacity} wristbands for event ${eventId}, category ${categoryId}`);
    
    // Tambahkan job ke queue
    const job = await this.wristbandQueue.add('generate-stock', {
      maxCapacity,
      eventId,
      categoryId
    }, {
      attempts: 3,
      backoff: { type: 'exponential', delay: 1000 }
    });
    
    return {
      message: `Generating ${maxCapacity} wristbands has been queued successfully`,
      jobId: job.id
    };
  }
  
  async uploadWristbandData(wristbands: CreateWristbandDto[]) {
    this.logger.log(`Queueing upload of ${wristbands.length} wristbands`);
    
    // Tambahkan job ke queue
    const job = await this.wristbandQueue.add('upload-data', {
      wristbands
    }, {
      attempts: 3,
      backoff: { type: 'exponential', delay: 1000 }
    });
    
    return {
      message: `Uploading ${wristbands.length} wristbands has been queued successfully`,
      jobId: job.id
    };
  }



  findAll() {
    return this.wristbandRepository.find();
  }

  findAssignedWristband() {
    return this.wristbandRepository.find({
      where: { status: WristbandStatus.ASSIGNED },
      relations: ['event', 'category', 'assignedTicket', 'assignedTicket.attendee'],
    });
  }

  findAssignedWristbandByCategory(categoryId: string) {
    return this.wristbandRepository.find({
      where: { status: WristbandStatus.ASSIGNED, category: { id: categoryId } },
      relations: ['event', 'category', 'assignedTicket', 'assignedTicket.attendee'],
    });
  }

  findCheckedInWristbandByCategory(categoryId: string) {
    return this.wristbandRepository.find({
      where: { status: WristbandStatus.CHECKED_IN, category: { id: categoryId } },
      relations: ['event', 'category', 'assignedTicket', 'assignedTicket.attendee'],
    });
  }

  findCheckedInWristbandByEvent(eventSlug: string) {
    return this.wristbandRepository.find({
      where: { status: WristbandStatus.CHECKED_IN, event: { slug: eventSlug } },
      relations: ['event', 'category', 'assignedTicket', 'assignedTicket.attendee'],
    });
  }

  findCheckedInWristbandByEventId(eventId: string) {
    return this.wristbandRepository.find({
      where: { status: WristbandStatus.CHECKED_IN, event: { id: eventId } },
      relations: ['event', 'category', 'assignedTicket', 'assignedTicket.attendee'],
    });
  }

  findOne(id: string) {
    return this.wristbandRepository.findOne({where: {id}});
  }

   async findOneByCode(wristbandCode: string, manager?: EntityManager) {
    const repository = manager ? manager.getRepository(Wristband) : this.wristbandRepository;

    const wristband = await repository.findOne({
      where: { wristbandCode },
      relations: ['event', 'category', 'assignedTicket'],
    });

    if (!wristband) throw new NotFoundException('Wristband not found');
    return wristband;
  }

  async findOneByCodeWithEventAndOrganizer(wristbandCode: string) {
    const wristband = await this.wristbandRepository.findOne({
      where: { wristbandCode },
      relations: ['event', 'event.organizer'],
    });

    if (!wristband) throw new NotFoundException('Wristband not found');
    return wristband;
  }

  async saveChange(wristband: Wristband, manager?: EntityManager) {
    const repository = manager ? manager.getRepository(Wristband) : this.wristbandRepository;
    return repository.save(wristband);
  }

  update(id: string, updateWristbandDto: UpdateWristbandDto) {
    return this.wristbandRepository.update(id, updateWristbandDto);
  }

  findUnusedWristbandsByEvent(eventSlug: string) {
    return this.wristbandRepository.find({
      where: { status: WristbandStatus.UNUSED, event: { slug: eventSlug } },
      relations: ['event', 'category'],
      order: { createdAt: 'ASC' },
    });
  }

  findUnusedWristbandsByCategory(categoryId: string) {
    return this.wristbandRepository.find({
      where: { status: WristbandStatus.UNUSED, category: { id: categoryId } },
      relations: ['event', 'category'],
      order: { createdAt: 'ASC' },
    });
  }

  findAllCheckInList() {
    return this.wristbandRepository.find({
      where: { status: WristbandStatus.CHECKED_IN },
      relations: ['event', 'category', 'assignedTicket', 'assignedTicket.attendee'],
    });
  }

  findAssignedWristbandByEvent(eventId: string) {
    return this.wristbandRepository.find({
      where: { status: WristbandStatus.ASSIGNED, event: { id: eventId } },
      relations: ['event', 'category', 'assignedTicket', 'assignedTicket.attendee'],
    });
  }

  

  async getUnusedWristbandCountByEvent(eventSlug: string) {
    return this.wristbandRepository.count({
      where: { status: WristbandStatus.UNUSED, event: { slug: eventSlug } },
    });
  }

  remove(id: string) {
    return this.wristbandRepository.delete(id);
  }
}

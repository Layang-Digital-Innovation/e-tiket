import { BadRequestException, Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { RedeemDto } from './dto/create-redeem.dto';
import { UpdateRedeemDto } from './dto/update-redeem.dto';
import { TicketService } from 'src/ticket/ticket.service';
import { WristbandService } from 'src/wristband/wristband.service';
import { Ticket, TicketStatus } from 'src/ticket/entities/ticket.entity';
import { Wristband, WristbandStatus } from 'src/wristband/entities/wristband.entity';
import { DataSource, EntityManager, IsNull } from 'typeorm';
import { EventsService } from 'src/events/events.service';
import { RedeemStrategyFactory } from './strategies/redeem-strategy.factory';
import { RedeemItem } from './entities/redeem-item.entity';
import { RedeemStrategy } from 'src/events/enums/event.enums';
import { Event } from 'src/events/entities/event.entity';
import { RedeemItemStatus } from './enums/redeem-item.enums';
import { TicketCategory } from 'src/ticket_categories/entities/ticket_category.entity';
import type { Queue } from 'bull';

export interface RedeemResponse {
  message: string;
  ticketCode: string;
  wristbandCode?: string;
  wristband?: Wristband;
  ticket: Ticket;
  redeemItem?: RedeemItem | null;
}

export interface RedeemItemDisplay {
  type: string;
  code: string;
  status: string;
  qrCode?: string | null;
  message?: string;
}

@Injectable()
export class RedeemService {

  constructor(
    private readonly dataSource: DataSource,
    private readonly ticketService: TicketService,
    private readonly wristbandService: WristbandService,
    private readonly eventsService: EventsService,
    private readonly redeemStrategyFactory: RedeemStrategyFactory,
    @InjectQueue('redeem-queue') private readonly redeemQueue: Queue,
  ) {}

  /**
   * Main redeem method using strategy pattern
   * Input: { ticketCode, eventId, organizerId, additionalData }
   * Output: RedeemResponse
   */
  async redeemTicket(
    ticketCode: string,
    eventId: string,
    organizerId?: string,
    additionalData?: any
  ): Promise<RedeemResponse> {
    return this.dataSource.transaction(async (manager) => {
      // 1. Validate ticket
      const ticket = await this.ticketService.validateTicketForRedeem(ticketCode, manager);

      // 2. Get event to determine redeem strategy
      const event = await this.eventsService.findOne(eventId);
      if (!event) {
        throw new NotFoundException('Event not found');
      }

      // 3. Authorization check
      if (organizerId && organizerId !== 'admin' && event.organizer.id !== organizerId) {
        throw new ForbiddenException('You can only redeem tickets for your own events');
      }

      // 4. Get appropriate strategy
      const strategy = this.redeemStrategyFactory.getStrategy(event.redeemStrategy);

      // 5. Execute redeem using strategy
      const redeemItem = await strategy.redeem(
        ticket,
        event,
        manager,
        additionalData
      );

      // 6. Mark ticket as redeemed
      await this.ticketService.markAsRedeemed(ticketCode, manager);

      return {
        message: 'Ticket berhasil diredeem',
        ticketCode,
        ticket,
        redeemItem,
        wristbandCode: redeemItem?.itemCode, // Legacy compatibility
      };
    });
  }

  /**
   * Assign redeem item to ticket
   * Input: { ticketCode, itemCode }
   * Output: { ticketCode, itemCode }
   */
  async assignRedeemItemToTicket(ticketCode: string, itemCode: string, eventId: string, organizerId?: string): Promise<{ ticketCode: string; itemCode: string }> {
    return this.dataSource.transaction(async (manager) => {
      // 1. Validate ticket
      const ticket = await this.ticketService.validateTicketForRedeem(ticketCode, manager);

      // 2. Get event
      const event = await this.eventsService.findOne(eventId);
      if (!event) {
        throw new NotFoundException('Event not found');
      }

      // 3. Authorization check
      if (organizerId && organizerId !== 'admin' && event.organizer.id !== organizerId) {
        throw new ForbiddenException('You can only redeem tickets for your own events');
      }

      // 4. Find redeem item by code
      const redeemItem = await manager.getRepository(RedeemItem).findOne({
        where: {
          itemCode,
          event: { id: eventId },
          status: RedeemItemStatus.GENERATED,
        },
      });

      if (!redeemItem) {
        throw new NotFoundException('Redeem item not found or already assigned');
      }

      // 5. Assign redeem item to ticket
      redeemItem.ticket = ticket;
      redeemItem.status = RedeemItemStatus.ASSIGNED;
      ticket.assignedRedeemItem = redeemItem;

      // 6. Mark ticket as redeemed
      ticket.status = TicketStatus.REDEEMED;
      ticket.redeemedAt = new Date();

      await manager.save(redeemItem);
      await this.ticketService.saveChange(ticket, manager);

      return {
        ticketCode: ticket.ticketCode,
        itemCode: redeemItem.itemCode,
      };
    });
  }

  /**
   * Legacy method: Redeem ticket to wristband (WRISTBAND strategy)
   */
  async redeemTicketToWristband(ticketCode: string, wristbandCode: string): Promise<RedeemResponse> {
    return this.dataSource.transaction(async (manager) => {
      const ticket = await this.ticketService.findOneByCode(ticketCode, manager);
      const wristband = await this.wristbandService.findOneByCode(wristbandCode, manager);

      if (ticket.status !== TicketStatus.UNUSED) {
        throw new BadRequestException('Ticket already redeemed or checked in');
      }

      if (wristband.status !== WristbandStatus.UNUSED) {
        throw new BadRequestException('Wristband already assigned');
      }

      ticket.status = TicketStatus.REDEEMED;
      ticket.redeemedAt = new Date();
      ticket.assignedWristband = wristband;

      wristband.status = WristbandStatus.ASSIGNED;
      wristband.assignedTicket = ticket;
      wristband.assignedAt = new Date();

      await this.ticketService.saveChange(ticket, manager);
      await this.wristbandService.saveChange(wristband, manager);

      return {
        message: 'Ticket successfully redeemed to wristband',
        ticketCode: ticket.ticketCode,
        wristbandCode: wristband.wristbandCode!,
        wristband,
        ticket
      };
    });
  }
  /**
   * Get all assigned wristbands (redeemed tickets)
   * Returns list of wristbands with status ASSIGNED
   */
  async findAllByEventId(eventId: string): Promise<Wristband[]> {
    return this.dataSource.getRepository(Wristband).find({
      where: { status: WristbandStatus.ASSIGNED, event: { id: eventId } },
      relations: ['assignedTicket', 'assignedTicket.orderItem', 'assignedTicket.orderItem.order', 'assignedTicket.orderItem.attendees', 'event', 'category'],
      order: { assignedAt: 'DESC' },
    });
  }

  /**
   * Get a specific assigned wristband by ID
   */
  async findOne(id: string): Promise<Wristband | null> {
    return this.dataSource.getRepository(Wristband).findOne({
      where: { id, status: WristbandStatus.ASSIGNED },
      relations: ['assignedTicket', 'assignedTicket.orderItem', 'assignedTicket.orderItem.order', 'assignedTicket.orderItem.attendees', 'event', 'category'],
    });
  }

  /**
   * Get all redeem items for an event
   */
  async findRedeemItemsByEvent(eventId: string): Promise<RedeemItem[]> {
    return this.dataSource.getRepository(RedeemItem).find({
      where: { event: { id: eventId } },
      relations: ['event', 'ticket', 'ticket.category', 'ticket.orderItem', 'ticket.attendee'],
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Get redeem item by code
   */
  async findRedeemItemByCode(code: string): Promise<RedeemItem | null> {
    return this.dataSource.getRepository(RedeemItem).findOne({
      where: { itemCode: code },
      relations: ['event', 'ticket', 'ticket.category', 'ticket.orderItem', 'ticket.attendee'],
    });
  }

  /**
   * Get redeem item display for a ticket
   */
  async getRedeemItemDisplay(ticketCode: string): Promise<RedeemItemDisplay | null> {
    const ticket = await this.ticketService.findOneByCode(ticketCode);
    
    if (!ticket.assignedRedeemItem) {
      return null;
    }

    const strategy = this.redeemStrategyFactory.getStrategy(ticket.assignedRedeemItem.event.redeemStrategy);
    return strategy.getRedeemItemDisplay(ticket);
  }

  /**
   * Get redeem statistics for an event
   */
  async getRedeemStatisticsByEvent(eventId: string) {
    const redeemItems = await this.dataSource.getRepository(RedeemItem).find({
      where: { event: { id: eventId } }
    });

    const generated = redeemItems.filter(item => item.status === 'GENERATED').length;
    const assigned = redeemItems.filter(item => item.status === 'ASSIGNED').length;
    const checkedIn = redeemItems.filter(item => item.status === 'CHECKED_IN').length;
    const used = redeemItems.filter(item => item.status === 'USED').length;

    return {
      total: redeemItems.length,
      generated,
      assigned,
      checkedIn,
      used,
    };
  }

  /**
   * Validate redeem code for an event
   */
  async validateRedeemCode(code: string, eventId: string): Promise<boolean> {
    const event = await this.eventsService.findOne(eventId);
    if (!event) {
      throw new NotFoundException('Event not found');
    }

    const strategy = this.redeemStrategyFactory.getStrategy(event.redeemStrategy);
    return strategy.validateRedeemCode(code, eventId);
  }

  // /**
  //  * Assign available redeem item to ticket during redeem
  //  */
  // async assignRedeemItemToTicket(ticket: Ticket, event: Event, manager: EntityManager): Promise<RedeemItem | null> {
  //   // Cari redeem item yang masih GENERATED untuk event ini
  //   const redeemItem = await manager.getRepository(RedeemItem).findOne({
  //     where: {
  //       event: { id: event.id },
  //       ticket: IsNull(), // Belum assigned
  //       status: RedeemItemStatus.GENERATED
  //     },
  //     order: { createdAt: 'ASC' }
  //   });

  //   if (!redeemItem) {
  //     return null; // Tidak ada redeem item yang tersedia
  //   }

  //   // Assign ke ticket
  //   redeemItem.ticket = ticket;
  //   redeemItem.status = RedeemItemStatus.ASSIGNED;

  //   // Update QR code dengan ticket info
  //   const qrData = JSON.parse(redeemItem.itemQrCode || '{}');
  //   qrData.ticketCode = ticket.ticketCode;
  //   qrData.type = qrData.type.replace('_bulk', '');
  //   redeemItem.itemQrCode = JSON.stringify(qrData);

  //   await manager.save(redeemItem);

  //   return redeemItem;
  // }

  /**
   * Generate redeem items secara bulk untuk keperluan percetakan (SYNC VERSION)
   * Dipanggil oleh queue processor
   */
  async generateRedeemItemsBulkSync(ticketCategoryId: string, quantity: number) {
    // Cari ticket category dan event
    const ticketCategory = await this.dataSource.getRepository(TicketCategory)
      .findOne({
        where: { id: ticketCategoryId },
        relations: ['event']
      });

    if (!ticketCategory) {
      throw new NotFoundException('Ticket category not found');
    }

    const event = ticketCategory.event;

    // Get strategy untuk event ini
    const strategy = this.redeemStrategyFactory.getStrategy(event.redeemStrategy);

    const redeemItems: RedeemItem[] = [];

    // Skip generation when strategy is NONE
    if (event.redeemStrategy === RedeemStrategy.NONE) {
      return {
        message: 'Redeem strategy is NONE: no items to generate',
        ticketCategory: ticketCategory.name,
        event: event.title,
        redeemStrategy: event.redeemStrategy,
        items: redeemItems.map(item => ({
          id: item.id,
          itemCode: item.itemCode,
          itemType: item.itemType,
          status: item.status
        }))
      };
    }
      
    // Generate redeem items dalam loop
    for (let i = 0; i < quantity; i++) {
      const redeemItem = await strategy.generateRedeemItem(null, event, undefined, {
        bulk: true,
        ticketCategory: ticketCategory
      });
      redeemItems.push(redeemItem as RedeemItem);
    }

    return {
      message: `Successfully generated ${quantity} redeem items for category ${ticketCategory.name}`,
      ticketCategory: ticketCategory.name,
      event: event.title,
      redeemStrategy: event.redeemStrategy,
      items: redeemItems.map(item => ({
        id: item.id,
        itemCode: item.itemCode,
        itemType: item.itemType,
        status: item.status
      }))
    };
  }

  /**
   * Generate redeem items secara bulk untuk keperluan percetakan (ASYNC VERSION)
   * Menambahkan job ke queue dan mengembalikan job ID
   * Dipanggil sebelum event dimulai untuk prepare redeem codes
   */
  async generateRedeemItemsBulk(ticketCategoryId: string, quantity: number, organizerId: string) {
    // Validasi input dasar
    if (quantity <= 0 || quantity > 10000) {
      throw new BadRequestException('Quantity must be between 1 and 10000');
    }

    // Cari ticket category untuk validasi awal
    const ticketCategory = await this.dataSource.getRepository(TicketCategory)
      .findOne({
        where: { id: ticketCategoryId },
        relations: ['event', 'event.organizer']
      });

    if (!ticketCategory) {
      throw new NotFoundException('Ticket category not found');
    }

    // Validasi organizer owns the event
    if (ticketCategory.event.organizer.id !== organizerId) {
      throw new BadRequestException('Unauthorized: You can only generate redeem items for your own events');
    }

    // Add job to queue
    const job = await this.redeemQueue.add(
      'generate-bulk-redeem-items',
      {
        ticketCategoryId,
        quantity,
        organizerId,
      },
      {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 5000,
        },
        removeOnComplete: 50,
        removeOnFail: 10,
      },
    );

    return {
      message: `Bulk redeem item generation has been queued. Job ID: ${job.id}`,
      jobId: job.id,
      ticketCategory: ticketCategory.name,
      event: ticketCategory.event.title,
      quantity,
      status: 'queued',
    };
  }

  /**
   * Get job status for bulk generation
   */
  async getBulkGenerationJobStatus(jobId: string) {
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

  update(id: number, updateRedeemDto: UpdateRedeemDto) {
    // Since redeem operations are typically one-time actions,
    // we don't need to update redeem records
    // This method could be used for administrative purposes if needed
    return `This action updates a #${id} redeem`;
  }

  remove(id: number) {
    // Redeem operations should not be deleted as they represent
    // historical ticket-to-wristband assignments
    return `This action removes a #${id} redeem`;
  }
}

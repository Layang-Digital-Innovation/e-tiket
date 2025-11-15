import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { IRedeemStrategy, RedeemItemDisplay } from './redeem-strategy.interface';
import { Ticket } from '../../ticket/entities/ticket.entity';
import { Event } from '../../events/entities/event.entity';
import { RedeemItemType, RedeemItemStatus } from '../enums/redeem-item.enums'
import { RedeemItem } from '../entities/redeem-item.entity';
import { DataSource, EntityManager } from 'typeorm';
import { WristbandService } from '../../wristband/wristband.service';
import { TicketService } from '../../ticket/ticket.service';
import { TicketStatus } from '../../ticket/entities/ticket.entity';
import { WristbandStatus } from '../../wristband/entities/wristband.entity';
import { TicketCategory } from '../../ticket_categories/entities/ticket_category.entity';
import { Wristband } from '../../wristband/entities/wristband.entity';

@Injectable()
export class WristbandRedeemStrategy implements IRedeemStrategy {
  constructor(
    private readonly dataSource: DataSource,
    private readonly wristbandService: WristbandService,
    private readonly ticketService: TicketService,
  ) {}

  async redeem(ticket: Ticket, event: Event, manager: EntityManager, additionalData?: any): Promise<RedeemItem | null> {
    const itemCode = additionalData?.itemCode || additionalData?.wristbandCode;
    
    if (!itemCode) {
      throw new BadRequestException('Wristband code is required for wristband redeem strategy');
    }

    // Find wristband by code
    const wristband = await this.wristbandService.findOneByCode(itemCode, manager);
    
    // Check if wristband is available for assignment
    if (wristband.status !== WristbandStatus.UNUSED) {
      throw new BadRequestException('Wristband tidak tersedia atau sudah digunakan');
    }

    // Assign wristband to ticket
    wristband.assignedTicket = ticket;
    wristband.status = WristbandStatus.ASSIGNED;
    await this.wristbandService.saveChange(wristband, manager);

    // Create or find redeem item
    const redeemItemRepo = manager.getRepository(RedeemItem);
    let redeemItem = await redeemItemRepo.findOne({
      where: { itemCode, event: { id: event.id } }
    });

    if (!redeemItem) {
      redeemItem = redeemItemRepo.create({
        itemCode,
        itemType: RedeemItemType.WRISTBAND,
        status: RedeemItemStatus.ASSIGNED,
        event,
        ticket,
      });
    } else {
      redeemItem.status = RedeemItemStatus.ASSIGNED;
      redeemItem.ticket = ticket;
    }

    return redeemItemRepo.save(redeemItem);
  }

  async generateRedeemItem(ticket: Ticket | null, event: Event, manager?: EntityManager, additionalData?: any): Promise<RedeemItem> {
    const entityManager = manager || this.dataSource.manager;

    // Generate unique wristband code with nano ID
    const { customAlphabet } = await import('nanoid');
    const nanoid = customAlphabet('1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ', 10);
    const itemCode = nanoid();

    return entityManager.transaction(async (txManager) => {
      const redeemItem = new RedeemItem();
      redeemItem.event = event;
      redeemItem.itemType = RedeemItemType.WRISTBAND;
      redeemItem.itemCode = itemCode;
      redeemItem.status = RedeemItemStatus.GENERATED;

      // Generate QR code
      const qrData = JSON.stringify({
        itemCode: itemCode,
        eventId: event.id,
        type: 'wristband',
      });
      redeemItem.itemQrCode = qrData;

      await txManager.save(redeemItem);
      return redeemItem;
    });
  }

  async getRedeemItemDisplay(ticket: Ticket): Promise<RedeemItemDisplay | null> {
    if (!ticket.assignedRedeemItem || ticket.assignedRedeemItem.itemType !== RedeemItemType.WRISTBAND) {
      return null;
    }

    return {
      type: RedeemItemType.WRISTBAND,
      code: ticket.assignedRedeemItem.itemCode,
      status: ticket.status === TicketStatus.CHECKED_IN
        ? RedeemItemStatus.CHECKED_IN
        : RedeemItemStatus.ASSIGNED,
      qrCode: ticket.assignedRedeemItem.itemQrCode || null,
      message: `Wristband ready for check-in`
    };
  }

  async validateRedeemCode(code: string, eventId: string): Promise<boolean> {
    try {
      const wristband = await this.wristbandService.findOneByCode(code);
      return wristband.event.id === eventId &&
             wristband.status === WristbandStatus.ASSIGNED;
    } catch {
      return false;
    }
  }

  private async findAvailableWristband(eventId: string, manager: EntityManager) {
    const wristband = await manager.getRepository(Wristband).findOne({
      where: {
        event: { id: eventId },
        status: WristbandStatus.UNUSED
      },
      relations: ['event', 'category'],
      order: { createdAt: 'ASC' }
    });

    if (!wristband) {
      throw new BadRequestException('No available wristbands for this event');
    }

    return wristband;
  }

  private async findAvailableWristbandByCategory(eventId: string, categoryId: string, manager: EntityManager) {
    const wristband = await manager.getRepository(Wristband).findOne({
      where: {
        event: { id: eventId },
        category: { id: categoryId },
        status: WristbandStatus.UNUSED
      },
      relations: ['event', 'category'],
      order: { createdAt: 'ASC' }
    });

    // Don't throw error here - let caller handle null case for fallback
    return wristband;
  }
}

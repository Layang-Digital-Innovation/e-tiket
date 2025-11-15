import { Injectable, BadRequestException } from '@nestjs/common';
import { IRedeemStrategy, RedeemItemDisplay } from './redeem-strategy.interface';
import { Ticket } from '../../ticket/entities/ticket.entity';
import { Event } from '../../events/entities/event.entity';
import { RedeemItem } from '../entities/redeem-item.entity';
import { RedeemItemType, RedeemItemStatus } from '../enums/redeem-item.enums';
import { TicketStatus } from '../../ticket/entities/ticket.entity';
import { DataSource, EntityManager } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TicketCategory } from '../../ticket_categories/entities/ticket_category.entity';

@Injectable()
export class BibRedeemStrategy implements IRedeemStrategy {
  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(RedeemItem)
    private readonly redeemItemRepository: Repository<RedeemItem>,
  ) {}

  async redeem(ticket: Ticket, event: Event, manager: EntityManager, additionalData?: any): Promise<RedeemItem | null> {
    const itemCode = additionalData?.itemCode;

    if (!itemCode) {
      throw new BadRequestException('itemCode is required for BIB redeem strategy');
    }

    // Find redeem item by code that is still GENERATED for this event
    const redeemItem = await manager.getRepository(RedeemItem).findOne({
      where: {
        itemCode,
        event: { id: event.id },
        itemType: RedeemItemType.BIB,
        status: RedeemItemStatus.GENERATED,
      },
    });

    if (!redeemItem) {
      throw new BadRequestException('Redeem item not found or not available');
    }

    // Assign item to ticket
    redeemItem.ticket = ticket;
    redeemItem.status = RedeemItemStatus.ASSIGNED;

    return manager.getRepository(RedeemItem).save(redeemItem);
  }

  async generateRedeemItem(ticket: Ticket | null, event: Event, manager?: EntityManager, additionalData?: any): Promise<RedeemItem> {
    const entityManager = manager || this.dataSource.manager;

    // Generate unique bib code with nano ID
    const { customAlphabet } = await import('nanoid');
    const nanoid = customAlphabet('1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ', 10);
    const itemCode = nanoid();

    return entityManager.transaction(async (txManager) => {
      const redeemItem = new RedeemItem();
      redeemItem.event = event;
      redeemItem.itemType = RedeemItemType.BIB;
      redeemItem.itemCode = itemCode;
      redeemItem.status = RedeemItemStatus.GENERATED;

      // Generate QR code
      const qrData = JSON.stringify({
        itemCode: itemCode,
        eventId: event.id,
        type: 'bib',
      });
      redeemItem.itemQrCode = qrData;

      await txManager.save(redeemItem);
      return redeemItem;
    });
  }

  async getRedeemItemDisplay(ticket: Ticket): Promise<RedeemItemDisplay | null> {
    if (!ticket.assignedRedeemItem || ticket.assignedRedeemItem.itemType !== RedeemItemType.BIB) {
      return null;
    }

    return {
      type: RedeemItemType.BIB,
      code: ticket.assignedRedeemItem.itemCode,
      status: ticket.status === TicketStatus.CHECKED_IN
        ? RedeemItemStatus.CHECKED_IN
        : RedeemItemStatus.ASSIGNED,
      qrCode: ticket.assignedRedeemItem.itemQrCode || null,
      message: `Nomor dada Anda untuk event`
    };
  }

  async validateRedeemCode(code: string, eventId: string): Promise<boolean> {
    try {
      const redeemItem = await this.redeemItemRepository.findOne({
        where: {
          itemCode: code,
          event: { id: eventId },
          itemType: RedeemItemType.BIB,
        },
      });
      return !!redeemItem && redeemItem.status !== RedeemItemStatus.USED;
    } catch {
      return false;
    }
  }

  private async generateUniqueBibNumber(eventId: string, manager: EntityManager): Promise<string> {
    // Get the count of existing bib items for this event
    const count = await manager.getRepository(RedeemItem).count({
      where: {
        event: { id: eventId },
        itemType: RedeemItemType.BIB,
      },
    });

    // Format: RUN-001, RUN-002, etc.
    const bibNumber = `RUN-${String(count + 1).padStart(3, '0')}`;
    return bibNumber;
  }
}

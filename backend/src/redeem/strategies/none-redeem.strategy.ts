import { Injectable, BadRequestException } from '@nestjs/common';
import { IRedeemStrategy, RedeemItemDisplay } from './redeem-strategy.interface';
import { Ticket } from '../../ticket/entities/ticket.entity';
import { Event } from '../../events/entities/event.entity';
import { RedeemItem } from '../entities/redeem-item.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository, DataSource } from 'typeorm';
import { RedeemItemStatus, RedeemItemType } from '../enums/redeem-item.enums';
import { TicketStatus } from '../../ticket/entities/ticket.entity';

@Injectable()
export class NoneRedeemStrategy implements IRedeemStrategy {

  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(RedeemItem)
    private readonly redeemItemRepository: Repository<RedeemItem>,
  ) {}

  async redeem(ticket: Ticket, event: Event, manager: EntityManager, additionalData?: any): Promise<RedeemItem | null> {
    // NONE strategy does not assign or create any redeem item.
    // Ticket status change is handled by the service after strategy execution.
    return null;
  }

  async generateRedeemItem(ticket: Ticket | null, event: Event, manager?: EntityManager, additionalData?: any): Promise<RedeemItem | null> {
    // NONE strategy tidak generate redeem item
    // Check-in langsung menggunakan ticket code
    return null;
  }

  async getRedeemItemDisplay(ticket: Ticket): Promise<RedeemItemDisplay | null> {
    // For NONE strategy, display ticket code directly
    return {
      type: RedeemItemType.NONE,
      code: ticket.ticketCode,
      status: ticket.status === TicketStatus.CHECKED_IN
        ? RedeemItemStatus.CHECKED_IN
        : RedeemItemStatus.ASSIGNED,
      message: 'Scan tiket Anda langsung untuk check-in'
    };
  }

  async validateRedeemCode(code: string, eventId: string): Promise<boolean> {
    try {
      const ticket = await this.dataSource.getRepository(Ticket).findOne({
        where: {
          ticketCode: code,
          category: { event: { id: eventId } }
        },
        relations: ['category', 'category.event']
      });
      return !!ticket && ticket.status === TicketStatus.UNUSED;
    } catch {
      return false;
    }
  }
}

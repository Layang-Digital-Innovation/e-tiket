import { Event } from '../../events/entities/event.entity';
import { Ticket } from '../../ticket/entities/ticket.entity';
import { RedeemItem } from '../entities/redeem-item.entity';
import { RedeemItemStatus, RedeemItemType } from '../enums/redeem-item.enums';
import { EntityManager } from 'typeorm';

export interface RedeemItemDisplay {
  type: RedeemItemType;
  code: string;
  status: RedeemItemStatus;
  qrCode?: string | null;
  message?: string;
}

export interface IRedeemStrategy {
  generateRedeemItem(ticket: Ticket | null, event: Event, manager?: EntityManager, additionalData?: any): Promise<RedeemItem | null>;
  redeem(ticket: Ticket, event: Event, manager: EntityManager, additionalData?: any): Promise<RedeemItem | null>;
  getRedeemItemDisplay(ticket: Ticket): Promise<RedeemItemDisplay | null>;
  validateRedeemCode(code: string, eventId: string): Promise<boolean>;
}

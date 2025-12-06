import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { AuditEntity } from '../../common/entities/audit.entity';
import { Event } from '../../events/entities/event.entity';
import { RedeemItem } from '../../redeem/entities/redeem-item.entity';
import { Ticket } from '../../ticket/entities/ticket.entity';
import { User } from '../../users/entities/user.entity';
import { Attendee } from '../../attendees/entities/attendee.entity';
import { CheckInType } from '../enums/check-in.enums';

@Entity('check_in_records')
export class CheckInRecord extends AuditEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Event, (event) => event.checkInRecords, { eager: true })
  @JoinColumn({ name: 'event_id' })
  event: Event;

  @ManyToOne(() => RedeemItem, (redeemItem) => redeemItem.checkInRecords, {
    nullable: true,
    eager: true,
  })
  @JoinColumn({ name: 'redeem_item_id' })
  redeemItem?: RedeemItem;

  @ManyToOne(() => Ticket, { nullable: true, eager: true })
  @JoinColumn({ name: 'ticket_id' })
  ticket?: Ticket;

  @Column({
    type: 'enum',
    enum: CheckInType,
  })
  checkInType: CheckInType;

  @Column({ name: 'check_in_code' })
  checkInCode: string;

  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'checked_in_by_id' })
  checkedInBy: User;

  @ManyToOne(() => Attendee, { nullable: true, eager: true })
  @JoinColumn({ name: 'attendee_id' })
  attendee?: Attendee;

  @Column({ name: 'check_in_location', nullable: true })
  checkInLocation?: string;

  @Column({
    name: 'checked_in_at',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  checkedInAt: Date;
}

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { AuditEntity } from '../../common/entities/audit.entity';
import { Event } from '../../events/entities/event.entity';
import { Ticket } from '../../ticket/entities/ticket.entity';
import { User } from '../../users/entities/user.entity';
import { RedeemItemType, RedeemItemStatus } from '../enums/redeem-item.enums';
import { CheckInRecord } from '../../check_in/entities/check-in-record.entity';

@Entity('redeem_items')
export class RedeemItem extends AuditEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Event, (event) => event.redeemItems, { eager: true })
  @JoinColumn({ name: 'event_id' })
  event: Event;

  @OneToOne(() => Ticket, (ticket) => ticket.assignedRedeemItem, {
    eager: true,
    onDelete: 'CASCADE',
    nullable: true,
  })
  @JoinColumn({ name: 'ticket_id' })
  ticket?: Ticket;

  @Column({
    type: 'enum',
    enum: RedeemItemType,
  })
  itemType: RedeemItemType;

  @Column({ name: 'item_code', unique: true })
  itemCode: string;

  @Column({ name: 'item_qr_code', type: 'text', nullable: true })
  itemQrCode?: string;

  @Column({
    type: 'enum',
    enum: RedeemItemStatus,
    default: RedeemItemStatus.GENERATED,
  })
  status: RedeemItemStatus;

  @Column({ name: 'checked_in_at', type: 'timestamp', nullable: true })
  checkedInAt?: Date;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'checked_in_by_id' })
  checkedInBy?: User;

  @Column({ name: 'check_in_location', nullable: true })
  checkInLocation?: string;

  @OneToMany(() => CheckInRecord, (checkInRecord) => checkInRecord.redeemItem)
  checkInRecords: CheckInRecord[];
}

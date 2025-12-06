import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { AuditEntity } from '../../common/entities/audit.entity';
import { TicketCategory } from 'src/ticket_categories/entities/ticket_category.entity';
import { RedeemItem } from '../../redeem/entities/redeem-item.entity';
import { CheckInRecord } from '../../check_in/entities/check-in-record.entity';
import { EventType, RedeemStrategy } from '../enums/event.enums';
import { Attendee } from 'src/attendees/entities/attendee.entity';

export enum EventStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  CANCELLED = 'cancelled',
  COMPLETED = 'completed',
}

export enum DeliveryMode {
  ONLINE = 'online',
  ONSITE = 'onsite',
  HYBRID = 'hybrid',
}

@Entity('events')
export class Event extends AuditEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({unique : true})
  slug : string

  @Column({
    type: 'enum',
    enum: EventType,
    default: EventType.CONCERT,
  })
  eventType: EventType;

  @Column({
    type: 'enum',
    enum: RedeemStrategy,
    default: RedeemStrategy.WRISTBAND,
  })
  redeemStrategy: RedeemStrategy;

  @Column({
    type: 'enum',
    enum: DeliveryMode,
    default: DeliveryMode.ONSITE,
  })
  deliveryMode: DeliveryMode;

  @Column({ nullable: true, name : "webinar_join_url" })
  webinarJoinUrl?: string;

  
  @Column('text')
  description: string;

  @Column()
  location: string;

  @Column({ type: 'timestamp', name: "start_date" })
  startDate: Date;

  @Column({ type: 'timestamp', name : "end_date" })
  endDate: Date;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0, name: "base_price" })
  basePrice: number;

  @Column({ nullable: true, name : "image_url" })
  imageUrl: string;

  @Column({ type: 'text', nullable: true, name: "terms_and_conditions" })
  termsAndConditions?: string;

  @Column({
    type: 'enum',
    enum: EventStatus,
    default: EventStatus.DRAFT,
  })
  status: EventStatus;

  @ManyToOne(() => User, { eager: true } )
  @JoinColumn({ name: 'organizer_id' })
  organizer: User;

  @OneToMany(() => TicketCategory, (ticketCategory) => ticketCategory.event)
  ticketCategories: TicketCategory[];

  @OneToMany(() => RedeemItem, (redeemItem) => redeemItem.event)
  redeemItems: RedeemItem[];

  @OneToMany(() => CheckInRecord, (checkInRecord) => checkInRecord.event)
  checkInRecords: CheckInRecord[];

}
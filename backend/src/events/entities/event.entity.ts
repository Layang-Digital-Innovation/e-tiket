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

export enum EventStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  CANCELLED = 'cancelled',
  COMPLETED = 'completed',
}

@Entity('events')
export class Event extends AuditEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column('text')
  description: string;

  @Column()
  location: string;

  @Column({ type: 'timestamp' })
  startDate: Date;

  @Column({ type: 'timestamp' })
  endDate: Date;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  basePrice: number;

  @Column({ nullable: true })
  imageUrl: string;

  @Column({
    type: 'enum',
    enum: EventStatus,
    default: EventStatus.DRAFT,
  })
  status: EventStatus;

  @Column({ type: 'uuid' })
  organizerId: string;

  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'organizerId' })
  organizer: User;

  @OneToMany(() => TicketCategory, (ticketCategory) => ticketCategory.event)
  ticketCategories: TicketCategory[];

}
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

  @Column({unique : true})
  slug : string

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

}
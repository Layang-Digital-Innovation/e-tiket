import {
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  JoinColumn,
  BeforeInsert,
  OneToOne,
} from 'typeorm';
import { OrderItem } from 'src/order_item/entities/order_item.entity';
import { TicketCategory } from 'src/ticket_categories/entities/ticket_category.entity';
import { Wristband } from 'src/wristband/entities/wristband.entity';
import { AuditEntity } from 'src/common/entities/audit.entity';
import { Attendee } from 'src/attendees/entities/attendee.entity';

export enum TicketStatus {
  UNUSED = 'unused',
  REDEEMED = 'redeemed',
  CHECKED_IN = 'checked_in',
}

@Entity('tickets')
export class Ticket extends AuditEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;


  @BeforeInsert()
  async generateTicketCode() {
    const { customAlphabet } = await import('nanoid');
    this.ticketCode = `TKT-${customAlphabet('1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ', 10)()}`;
  }

  @Column({ type: 'varchar', name: 'ticket_code', unique: true })
  ticketCode: string;

  @Column({
    type: 'enum',
    enum: TicketStatus,
    default: TicketStatus.UNUSED,
  })
  status: TicketStatus;

  @OneToOne(() => Attendee, attendee => attendee.ticket, { onDelete: 'CASCADE' })
  attendee: Attendee;  

  @OneToOne(() => Wristband, (wristband) => wristband.assignedTicket, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'assigned_wristband_id' })
  assignedWristband?: Wristband;


  @ManyToOne(() => OrderItem, (orderItem) => orderItem.tickets, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'order_item_id' })
  orderItem: OrderItem;


  @ManyToOne(() => TicketCategory, { 
    eager: true,
    onDelete: 'RESTRICT'
  })
  @JoinColumn({ name: 'category_id' })
  category: TicketCategory;

  @Column({name : 'redeemed_at', nullable: true})
  redeemedAt?: Date;

  
}

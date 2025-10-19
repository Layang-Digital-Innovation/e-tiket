import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
} from 'typeorm';
import { Order } from 'src/order/entities/order.entity';
import { TicketCategory } from 'src/ticket_categories/entities/ticket_category.entity';
import { Ticket } from 'src/ticket/entities/ticket.entity';
import { AuditEntity } from 'src/common/entities/audit.entity';
import { Attendee } from 'src/attendees/entities/attendee.entity';

@Entity('order_items')
export class OrderItem extends AuditEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Hubungan ke order
  @ManyToOne(() => Order, (order) => order.orderItems, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  @JoinColumn({ name: 'order_id' })
  order: Order;

  // Hubungan ke kategori tiket
  @ManyToOne(() => TicketCategory, { 
    eager: true, 
    nullable: false,
    onDelete: 'RESTRICT'
  })
  @JoinColumn({ name: 'ticket_category_id' })
  ticketCategory: TicketCategory;

  // Jumlah tiket yang dibeli untuk kategori ini
  @Column({ type: 'int', unsigned: true })
  quantity: number;

  // Harga satuan tiket (snapshot pada saat order dibuat)
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  unitPrice: number;

  // Total harga untuk kategori ini (quantity * unitPrice)
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  subtotal: number;

  // Relasi ke tiket yang dihasilkan dari order item ini
  @OneToMany(() => Ticket, (ticket) => ticket.orderItem, {
    cascade: ['insert', 'update'],
  })
  tickets: Ticket[];

  @OneToMany(() => Attendee, (attendee) => attendee.orderItem, { cascade: true })
attendees: Attendee[];

}

import { OrderItem } from "src/order_item/entities/order_item.entity";
import { Ticket } from "src/ticket/entities/ticket.entity";
import { Column, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity("atendees")
export class Attendee {
   @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => Ticket, ticket => ticket.attendee, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'ticket_id' })
  ticket: Ticket;
  
  @ManyToOne(() => OrderItem, (orderItem) => orderItem.attendees, { nullable: false })
@JoinColumn({ name: 'order_item_id' })
orderItem: OrderItem;

  @Column({name : "full_name"})
  fullName: string;

  @Column()
  email: string;

  @Column({ nullable: true, name : "identity_type" })
  identityType?: string;

  @Column({ nullable: true, name : "identity_number" })
  identityNumber?: string;

  @Column({ nullable: true, name : "phone_number" })
  phoneNumber?: string;

  @Column({ nullable: true, name : "gender" })
  gender?: string;

  @Column({ nullable: true, name : "address" })
  address?: string;

  @Column({ nullable: true, name : "birth_date" })
  birthDate?: Date;
}

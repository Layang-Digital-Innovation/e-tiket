import { OrderItem } from "src/order_item/entities/order_item.entity";
import { BeforeInsert, Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";


export enum OrderStatus {
    PAID = 'paid',
    PENDING = 'pending',
    FAILED = 'failed',
    CANCELLED = 'cancelled'
}


@Entity('orders')
export class Order {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({name : "full_name"})
    fullName : string;

    @Column()
    email: string;

    @Column({name : "identity_type"})
    identityType: string;

    @Column({name : "identity_number"})
    identityNumber: string;

    @Column({name : "phone_number"})
    phoneNumber: string;

    @Column({name : "total_amount"})
    totalAmount: number;

    @Column({unique : true})
    transactionCode : string;

      @BeforeInsert()
  async generateTransactionCode() {
     const { customAlphabet } = await import('nanoid');
    const datePart = new Date().toISOString().slice(0,10).replace(/-/g, '');
    this.transactionCode = `ORD-${datePart}-${customAlphabet('1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ', 10)()}`;
  }

  @Column({name : "created_at"})
  createdAt : Date;

  @BeforeInsert()
  setCreatedAt() {
    this.createdAt = new Date();
  }

  @Column({ type: 'enum', enum: OrderStatus, default: OrderStatus.PENDING })
  status: OrderStatus;

  @OneToMany(() => OrderItem, (orderItem) => orderItem.order, {cascade : true})
  orderItems : OrderItem[];

}

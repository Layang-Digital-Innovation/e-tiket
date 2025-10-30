import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { Event } from 'src/events/entities/event.entity';
import { AuditEntity } from 'src/common/entities/audit.entity';

export enum PayoutStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  PAID = 'paid',
  CANCELLED = 'cancelled',
}

export enum BankType {
  BCA = 'bca',
  MANDIRI = 'mandiri',
  BNI = 'bni',
  CIMB = 'cimb',
  PERMATA = 'permata',
  OTHER = 'other',
}

@Entity('payouts')
export class Payout extends AuditEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'organizer_id' })
  organizer: User;

  @ManyToOne(() => Event, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'event_id' })
  event?: Event;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  grossAmount: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  platformFee: number;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  netAmount: number;

  @Column({
    type: 'enum',
    enum: PayoutStatus,
    default: PayoutStatus.PENDING,
  })
  status: PayoutStatus;

  @Column({ type: 'varchar', length: 100 })
  bankAccountName: string;

  @Column({ type: 'varchar', length: 50 })
  bankAccountNumber: string;

  @Column({
    type: 'enum',
    enum: BankType,
    default: BankType.OTHER,
  })
  bankType: BankType;

  @Column({ type: 'varchar', length: 255, nullable: true })
  bankBranch?: string;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @Column({ type: 'text', nullable: true })
  rejectionReason?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  referenceNumber?: string;

  @Column({ type: 'timestamp', nullable: true })
  approvedAt?: Date;

  @Column({ type: 'timestamp', nullable: true })
  paidAt?: Date;

  @Column({ type: 'timestamp', nullable: true })
  rejectedAt?: Date;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'approved_by_id' })
  approvedBy?: User;
}

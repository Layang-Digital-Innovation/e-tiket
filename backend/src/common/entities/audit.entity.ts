import {
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  BeforeInsert,
  BeforeUpdate,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

export abstract class AuditEntity {
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Column({ name: 'created_by', type: 'uuid', nullable: true })
  createdBy: string;

  @Column({ name: 'updated_by', type: 'uuid', nullable: true })
  updatedBy: string;

  // Relations for audit fields
  @ManyToOne(() => User, { nullable: true, eager: false })
  @JoinColumn({ name: 'created_by' })
  creator: User;

  @ManyToOne(() => User, { nullable: true, eager: false })
  @JoinColumn({ name: 'updated_by' })
  updater: User;

  // Helper methods for audit
  setCreatedBy(userId: string): void {
    this.createdBy = userId;
  }

  setUpdatedBy(userId: string): void {
    this.updatedBy = userId;
  }

  isCreatedBy(userId: string): boolean {
    return this.createdBy === userId;
  }

  isUpdatedBy(userId: string): boolean {
    return this.updatedBy === userId;
  }

  getAuditInfo(): {
    createdAt: Date;
    updatedAt: Date;
    createdBy: string;
    updatedBy: string;
  } {
    return {
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      createdBy: this.createdBy,
      updatedBy: this.updatedBy,
    };
  }

  @BeforeInsert()
  setCreateAudit(): void {
    const now = new Date();
    if (!this.createdAt) {
      this.createdAt = now;
    }
    if (!this.updatedAt) {
      this.updatedAt = now;
    }
    // Note: createdBy and updatedBy will be set by the subscriber
  }

  @BeforeUpdate()
  setUpdateAudit(): void {
    this.updatedAt = new Date();
    // Note: updatedBy will be set by the subscriber
  }
}
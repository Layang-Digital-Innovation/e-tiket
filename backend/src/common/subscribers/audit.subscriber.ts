import {
  EventSubscriber,
  EntitySubscriberInterface,
  InsertEvent,
  UpdateEvent,
  DataSource,
} from 'typeorm';
import { Injectable } from '@nestjs/common';
import { AuditContextService } from '../services/audit-context.service';
import { AuditEntity } from '../entities/audit.entity';

@Injectable()
@EventSubscriber()
export class AuditSubscriber implements EntitySubscriberInterface<AuditEntity> {
  constructor(
    private readonly dataSource: DataSource,
    private readonly auditContextService: AuditContextService,
  ) {
    // Register this DI-managed subscriber instance with TypeORM
    this.dataSource.subscribers.push(this);
  }

  /**
   * Indicates that this subscriber only listen to AuditEntity events.
   */
  listenTo() {
    return AuditEntity;
  }

  /**
   * Called before entity insertion.
   */
  beforeInsert(event: InsertEvent<AuditEntity>) {
    const currentUserId = this.auditContextService.getCurrentUserId();
    
    if (currentUserId && event.entity) {
      // Set both createdBy and updatedBy for new entities
      event.entity.createdBy = currentUserId;
      event.entity.updatedBy = currentUserId;
      
      // Set timestamps if not already set
      const now = new Date();
      if (!event.entity.createdAt) {
        event.entity.createdAt = now;
      }
      if (!event.entity.updatedAt) {
        event.entity.updatedAt = now;
      }
    }
  }

  /**
   * Called before entity update.
   */
  beforeUpdate(event: UpdateEvent<AuditEntity>) {
    const currentUserId = this.auditContextService.getCurrentUserId();
    
    if (currentUserId && event.entity) {
      // Only update updatedBy and updatedAt for updates
      event.entity.updatedBy = currentUserId;
      event.entity.updatedAt = new Date();
    }
  }

  /**
   * Called after entity insertion.
   */
  afterInsert(event: InsertEvent<AuditEntity>) {
    console.log(`Entity ${event.metadata.name} created by user: ${event.entity?.createdBy}`);
  }

  /**
   * Called after entity update.
   */
  afterUpdate(event: UpdateEvent<AuditEntity>) {
    console.log(`Entity ${event.metadata.name} updated by user: ${event.entity?.updatedBy}`);
  }
}
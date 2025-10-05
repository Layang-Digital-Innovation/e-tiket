import { Injectable, Scope } from '@nestjs/common';
import { ClsService } from 'nestjs-cls';

@Injectable()
export class AuditContextService {
  constructor(private readonly cls: ClsService) {}

  setCurrentUserId(userId: string): void {
    this.cls.set('currentUserId', userId);
  }

  getCurrentUserId(): string | undefined {
    return this.cls.get('currentUserId');
  }

  setCurrentUserRole(role: string): void {
    this.cls.set('currentUserRole', role);
  }

  getCurrentUserRole(): string | undefined {
    return this.cls.get('currentUserRole');
  }

  setAuditContext(userId: string, role?: string): void {
    this.setCurrentUserId(userId);
    if (role) {
      this.setCurrentUserRole(role);
    }
  }

  clearContext(): void {
    this.cls.set('currentUserId', undefined);
    this.cls.set('currentUserRole', undefined);
  }
}
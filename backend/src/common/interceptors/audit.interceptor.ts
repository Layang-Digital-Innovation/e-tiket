import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AuditContextService } from '../services/audit-context.service';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(private readonly auditContextService: AuditContextService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    
    // Extract user information from request
    // This assumes you have user information in request.user (from JWT guard)
    const user = request.user;
    
    if (user) {
      // Set audit context with current user
      this.auditContextService.setAuditContext(user.id, user.role);
    }

    return next.handle().pipe(
      tap(() => {
        // Optionally clear context after request completion
        // this.auditContextService.clearContext();
      }),
    );
  }
}
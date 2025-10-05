import { UseInterceptors } from '@nestjs/common';
import { AuditInterceptor } from '../interceptors/audit.interceptor';

/**
 * Decorator to enable automatic audit for controller methods
 * This will automatically capture user context and populate audit fields
 */
export const EnableAudit = () => UseInterceptors(AuditInterceptor);

/**
 * Decorator for controller classes to enable audit for all methods
 */
export const AuditController = () => UseInterceptors(AuditInterceptor);
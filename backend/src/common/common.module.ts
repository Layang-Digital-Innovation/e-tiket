import { Module, Global } from '@nestjs/common';
import { ClsModule } from 'nestjs-cls';
import { AuditContextService } from './services/audit-context.service';
import { AuditSubscriber } from './subscribers/audit.subscriber';
import { AuditInterceptor } from './interceptors/audit.interceptor';

@Global()
@Module({
  imports: [
    ClsModule.forRoot({
      global: true,
      middleware: {
        mount: true,
        generateId: true,
      },
    }),
  ],
  providers: [
    AuditContextService,
    AuditSubscriber,
    AuditInterceptor,
  ],
  exports: [
    AuditContextService,
    AuditInterceptor,
  ],
})
export class CommonModule {}
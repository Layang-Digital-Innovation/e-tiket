import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { EventsModule } from './events/events.module';

import { EmailModule } from './email/email.module';
import { CommonModule } from './common/common.module';

import { getDatabaseConfig } from './config/database.config';
import { TicketModule } from './ticket/ticket.module';
import { TicketCategoriesModule } from './ticket_categories/ticket_categories.module';
import { OrderModule } from './order/order.module';
import { OrderItemModule } from './order_item/order_item.module';
import { WristbandModule } from './wristband/wristband.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: getDatabaseConfig,
      inject: [ConfigService],
    }),
    CommonModule,
    AuthModule.forRoot(),
    UsersModule,
    EventsModule,
    EmailModule,
    TicketModule,
    TicketCategoriesModule,
    OrderModule,
    OrderItemModule,
    WristbandModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

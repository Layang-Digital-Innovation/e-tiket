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

import { TicketModule } from './ticket/ticket.module';
import { TicketCategoriesModule } from './ticket_categories/ticket_categories.module';
import { OrderModule } from './order/order.module';
import { OrderItemModule } from './order_item/order_item.module';
import { WristbandModule } from './wristband/wristband.module';
import { AttendeesModule } from './attendees/attendees.module';
import { PaymentModule } from './payment/payment.module';
import { BullModule } from '@nestjs/bull';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST'),
        port: configService.get('DB_PORT'),
        username: configService.get('DB_USERNAME'),
        password: configService.get('DB_PASSWORD'),
        database: configService.get('DB_NAME'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: configService.get('NODE_ENV') !== 'production',
      }),
    }),
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        redis: {
          host: configService.get('REDIS_HOST', 'localhost'),
          port: configService.get('REDIS_PORT', 6379),
        },
      }),
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
    AttendeesModule,
    PaymentModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

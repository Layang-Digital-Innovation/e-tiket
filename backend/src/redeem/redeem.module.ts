import { Module } from '@nestjs/common';
import { RedeemService } from './redeem.service';
import { RedeemController } from './redeem.controller';

import { TypeOrmModule } from '@nestjs/typeorm';
import { Ticket } from 'src/ticket/entities/ticket.entity';
import { Wristband } from 'src/wristband/entities/wristband.entity';
import { RedeemItem } from './entities/redeem-item.entity';
import { TicketCategory } from 'src/ticket_categories/entities/ticket_category.entity';
import { CheckInRecord } from 'src/check_in/entities/check-in-record.entity';
import { TicketModule } from 'src/ticket/ticket.module';
import { WristbandModule } from 'src/wristband/wristband.module';
import { EventsModule } from 'src/events/events.module';
import { RedeemStrategyFactory } from './strategies/redeem-strategy.factory';
import { WristbandRedeemStrategy } from './strategies/wristband-redeem.strategy';
import { BibRedeemStrategy } from './strategies/bib-redeem.strategy';
import { NoneRedeemStrategy } from './strategies/none-redeem.strategy';
import { BullModule } from '@nestjs/bull';
import { RedeemQueueProcessor } from './redeem-queue.processor';

@Module({
  imports: [
    TypeOrmModule.forFeature([Ticket, Wristband, RedeemItem, TicketCategory, CheckInRecord]),
    TicketModule,
    WristbandModule,
    EventsModule,
    BullModule.registerQueue({
      name: 'redeem-queue',
    }),
    
  ],
  controllers: [RedeemController],
  providers: [
    RedeemService,
    RedeemStrategyFactory,
    WristbandRedeemStrategy,
    BibRedeemStrategy,
    NoneRedeemStrategy,
    RedeemQueueProcessor,
  ],
  exports: [RedeemService], // Export for use in other modules
})
export class RedeemModule {}

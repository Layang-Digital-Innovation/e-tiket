import { Module } from '@nestjs/common';
import { RedeemService } from './redeem.service';
import { RedeemController } from './redeem.controller';

import { TypeOrmModule } from '@nestjs/typeorm';
import { Ticket } from 'src/ticket/entities/ticket.entity';
import { Wristband } from 'src/wristband/entities/wristband.entity';
import { TicketModule } from 'src/ticket/ticket.module';
import { WristbandModule } from 'src/wristband/wristband.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Ticket, Wristband]),
    TicketModule,
    WristbandModule
  ],
  controllers: [RedeemController],
  providers: [RedeemService],
})
export class RedeemModule {}

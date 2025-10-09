import { Module } from '@nestjs/common';
import { RedeemService } from './redeem.service';
import { RedeemController } from './redeem.controller';

import { TypeOrmModule } from '@nestjs/typeorm';
import { TicketModule } from 'src/ticket/ticket.module';
import { WristbandModule } from 'src/wristband/wristband.module';

@Module({
  imports: [TicketModule, WristbandModule],
  controllers: [RedeemController],
  providers: [RedeemService],
})
export class RedeemModule {}

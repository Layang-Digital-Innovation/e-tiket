import { Module } from '@nestjs/common';
import { TicketModule } from 'src/ticket/ticket.module';
import { WristbandModule } from 'src/wristband/wristband.module';
import { EventsModule } from 'src/events/events.module';
import { CheckInService } from './check_in.service';
import { CheckInController } from './check_in.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Ticket } from 'src/ticket/entities/ticket.entity';
import { Wristband } from 'src/wristband/entities/wristband.entity';
import { RedeemModule } from 'src/redeem/redeem.module';
import { RedeemItem } from 'src/redeem/entities/redeem-item.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([Ticket, Wristband, RedeemItem]),
        TicketModule,
        WristbandModule,
        EventsModule,
        RedeemModule
    ],
    providers: [CheckInService],
    exports: [CheckInService],
    controllers: [CheckInController],
})
export class CheckInModule {}

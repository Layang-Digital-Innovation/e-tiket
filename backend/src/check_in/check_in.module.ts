import { Module } from '@nestjs/common';
import { TicketModule } from 'src/ticket/ticket.module';
import { WristbandModule } from 'src/wristband/wristband.module';
import { CheckInService } from './check_in.service';
import { CheckInController } from './check_in.controller';

@Module({
    imports: [TicketModule, WristbandModule],
    providers: [CheckInService],
    exports: [CheckInService],
    controllers: [CheckInController],
})
export class CheckInModule {}

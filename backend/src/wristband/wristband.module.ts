import { Module } from '@nestjs/common';
import { WristbandService } from './wristband.service';
import { WristbandController } from './wristband.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Wristband } from './entities/wristband.entity';
import { WristbandQueueModule } from './queue/wristband.queue.module';

@Module({
  imports : [
    TypeOrmModule.forFeature([Wristband]),
    WristbandQueueModule
  ],
  controllers: [WristbandController],
  providers: [WristbandService],
  exports : [WristbandService]
})
export class WristbandModule {}

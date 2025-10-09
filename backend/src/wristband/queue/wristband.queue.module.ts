import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { getBullConfig } from '../../config/bull.config';
import { WristbandProcessor } from './wristband.processor';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Wristband } from '../entities/wristband.entity';

@Module({
  imports: [
    BullModule.registerQueueAsync({
      name: 'wristband',
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => getBullConfig(configService),
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([Wristband]),
  ],
  providers: [WristbandProcessor],
  exports: [BullModule],
})
export class WristbandQueueModule {}
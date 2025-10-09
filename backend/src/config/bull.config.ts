import { ConfigModule, ConfigService } from '@nestjs/config';
import { BullModuleOptions } from '@nestjs/bull';

export const getBullConfig = (
  configService: ConfigService,
): BullModuleOptions => {
  return {
    redis: {
      host: configService.get('REDIS_HOST', 'localhost'),
      port: configService.get('REDIS_PORT', 6379),
    },
    defaultJobOptions: {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 1000,
      },
      removeOnComplete: true,
      removeOnFail: false,
    },
  };
};
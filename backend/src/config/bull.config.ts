import { ConfigModule, ConfigService } from '@nestjs/config';
import { BullModuleOptions } from '@nestjs/bull';
import { Logger } from '@nestjs/common';

export const getBullConfig = (
  configService: ConfigService,
): BullModuleOptions => {
  const logger = new Logger('BullConfig');

  const host = configService.get('REDIS_HOST', 'localhost');
  const port = configService.get('REDIS_PORT', 6379);

  logger.log(`Initializing Bull Redis connection to ${host}:${port}`);

  return {
    redis: {
      host,
      port,
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
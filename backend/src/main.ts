import { NestFactory, Reflector } from '@nestjs/core';
import {
  ClassSerializerInterceptor,
  Logger,
  ValidationPipe,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import cookieParser from 'cookie-parser';
import Redis from 'ioredis';

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  try {
    logger.log('🟡 Starting Nest application...');

    const app = await NestFactory.create(AppModule);
    logger.log('✅ NestFactory created successfully.');

    const configService = app.get(ConfigService);
    const redisHost = configService.get<string>('REDIS_HOST', 'localhost');
    const redisPort = configService.get<number>('REDIS_PORT', 6379);

    logger.log(`🔌 Checking Redis connection to ${redisHost}:${redisPort}...`);
    const redisClient = new Redis({ host: redisHost, port: redisPort });

    try {
      await redisClient.ping();
      logger.log('✅ Redis connection successful.');
    } catch (redisError) {
      logger.error('❌ Failed to connect to Redis:', redisError as Error);
    } finally {
      redisClient.disconnect();
    }

    const corsOrigin = process.env.FRONTEND_URL ?? 'http://localhost:3000';

    // Enable cookie parser
    logger.log('🍪 Enabling cookie parser...');
    app.use(cookieParser());

    // Enable CORS for frontend
    logger.log('🌐 Enabling CORS...');
    app.enableCors({
      origin: corsOrigin,
      credentials: true,
    });

    // Enable global validation
    logger.log('🧩 Setting up global pipes...');
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    const reflector = app.get(Reflector);

    // Apply global interceptors & filters
    logger.log('🛠 Applying global interceptors and filters...');
    app.useGlobalInterceptors(new ClassSerializerInterceptor(reflector));
    app.useGlobalInterceptors(new ResponseInterceptor(reflector));
    app.useGlobalFilters(new HttpExceptionFilter());

    const port = process.env.PORT ?? 3002;
    logger.log(`🚀 Starting to listen on port ${port}...`);

    await app.listen(port);

    logger.log(`✅ Application successfully started on port ${port}`);
  } catch (error) {
    // Tangkap error yang menyebabkan proses keluar diam-diam
    console.error('❌ Error during bootstrap:', error);
    process.exit(1);
  }
}

void bootstrap();

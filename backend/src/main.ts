import { NestFactory, Reflector } from '@nestjs/core';
import {
  ClassSerializerInterceptor,
  Logger,
  ValidationPipe,
} from '@nestjs/common';
import { AppModule } from './app.module';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  try {
    logger.log('🟡 Starting Nest application...');

    const app = await NestFactory.create(AppModule);
    logger.log('✅ NestFactory created successfully.');


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

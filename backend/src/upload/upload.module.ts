import { Module } from '@nestjs/common';
import { UploadService } from './upload.service';
import { UploadController } from './upload.controller';
import { ConfigModule } from '@nestjs/config';
import { StorageProvider } from './storage/storage.provider';

@Module({
  imports: [ConfigModule],
  controllers: [UploadController],
  providers: [UploadService, StorageProvider],
  exports: [UploadService],
})
export class UploadModule {}

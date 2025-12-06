// upload/upload.controller.ts
import { 
  Controller, 
  Post, 
  UploadedFile, 
  UseInterceptors, 
  Delete, 
  Param, 
  UseGuards,
  BadRequestException,
  Logger
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadService } from './upload.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('upload')
@UseGuards(JwtAuthGuard)
export class UploadController {
  private readonly logger = new Logger(UploadController.name);

  constructor(private readonly uploadService: UploadService) {}

  @Post('image')
  @UseInterceptors(FileInterceptor('file'))
  async uploadImage(@UploadedFile() file: Express.Multer.File) {
    this.logger.debug(`[uploadImage] Request received`);
    
    if (!file) {
      this.logger.warn(`[uploadImage] File not found in request`);
      throw new BadRequestException('File tidak ditemukan');
    }

    this.logger.debug(`[uploadImage] File details:`, {
      originalname: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      encoding: file.encoding,
    });

    try {
      this.logger.log(`[uploadImage] Starting file upload for: ${file.originalname}`);
      const result = await this.uploadService.uploadFile(file);
      
      this.logger.log(`[uploadImage] Image uploaded successfully:`, {
        key: result.key,
        url: result.url,
      });
      
      return {
        success: true,
        data: {
          url: result.url,
          key: result.key,
        },
      };
    } catch (error) {
      this.logger.error(`[uploadImage] Error uploading image:`, {
        message: error.message,
        stack: error.stack,
        file: file.originalname,
      });
      throw error;
    }
  }

  @Delete(':key')
  async deleteImage(@Param('key') key: string) {
    if (!key) {
      throw new BadRequestException('File key tidak valid');
    }

    try {
      await this.uploadService.deleteFile(key);
      this.logger.log(`Image deleted successfully: ${key}`);
      
      return { success: true };
    } catch (error) {
      this.logger.error(`Error deleting image: ${error.message}`, error.stack);
      throw error;
    }
  }
}
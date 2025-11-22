import { 
  Injectable, 
  BadRequestException, 
  InternalServerErrorException,
  Logger 
} from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { STORAGE_SERVICE } from './storage/storage.provider';
import * as storageInterface from './interfaces/storage.interface';

@Injectable()
export class UploadService {
  private readonly logger = new Logger(UploadService.name);
  
  // Whitelist MIME types untuk image
  private readonly allowedMimeTypes = [
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'image/jpg',
  ];
  
  // Maximum file size: 5MB
  private readonly maxFileSize = 5 * 1024 * 1024;

  constructor(
    @Inject(STORAGE_SERVICE) private readonly storageService: storageInterface.IStorageService,
  ) {}

  async uploadFile(file: Express.Multer.File) {
    try {
      this.logger.debug(`[uploadFile] Starting validation for: ${file.originalname}`);
      
      // Validasi file
      this.validateFile(file);
      
      this.logger.debug(`[uploadFile] Validation passed, uploading to storage`);

      // Upload ke storage
      const result = await this.storageService.upload(file);
      
      this.logger.log(`[uploadFile] File uploaded successfully:`, {
        key: result.key,
        url: result.url,
        originalname: file.originalname,
      });
      
      return result;
    } catch (error) {
      this.logger.error(`[uploadFile] Error uploading file:`, {
        message: error.message,
        stack: error.stack,
        file: file.originalname,
      });
      
      if (error instanceof BadRequestException) {
        throw error;
      }
      
      throw new InternalServerErrorException('Gagal mengupload file');
    }
  }

  async deleteFile(key: string) {
    try {
      if (!key || typeof key !== 'string') {
        throw new BadRequestException('File key tidak valid');
      }

      await this.storageService.delete(key);
      this.logger.log(`File deleted successfully: ${key}`);
      
      return { success: true };
    } catch (error) {
      this.logger.error(`Error deleting file: ${error.message}`, error.stack);
      
      if (error instanceof BadRequestException) {
        throw error;
      }
      
      throw new InternalServerErrorException('Gagal menghapus file');
    }
  }

  getFileUrl(key: string): string {
    if (!key || typeof key !== 'string') {
      throw new BadRequestException('File key tidak valid');
    }
    return this.storageService.getUrl(key);
  }

  /**
   * Validasi file sebelum upload
   */
  private validateFile(file: Express.Multer.File): void {
    this.logger.debug(`[validateFile] Validating file:`, {
      originalname: file?.originalname,
      mimetype: file?.mimetype,
      size: file?.size,
    });

    if (!file) {
      this.logger.warn(`[validateFile] File is missing`);
      throw new BadRequestException('File tidak ditemukan');
    }

    // Cek MIME type
    if (!this.allowedMimeTypes.includes(file.mimetype)) {
      this.logger.warn(`[validateFile] Invalid MIME type: ${file.mimetype}`, {
        allowed: this.allowedMimeTypes,
      });
      throw new BadRequestException(
        `Tipe file tidak didukung. Format yang diizinkan: ${this.allowedMimeTypes.join(', ')}`,
      );
    }

    // Cek ukuran file
    if (file.size > this.maxFileSize) {
      const maxSizeMB = this.maxFileSize / 1024 / 1024;
      this.logger.warn(`[validateFile] File size too large: ${file.size} bytes`, {
        maxSizeBytes: this.maxFileSize,
        maxSizeMB,
      });
      throw new BadRequestException(
        `Ukuran file terlalu besar. Maksimal ${maxSizeMB}MB`,
      );
    }

    // Cek originalname
    if (!file.originalname) {
      this.logger.warn(`[validateFile] Original filename is missing`);
      throw new BadRequestException('Nama file tidak valid');
    }

    this.logger.debug(`[validateFile] File validation passed`);
  }
}

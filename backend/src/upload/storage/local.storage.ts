// upload/storage/local.storage.ts
import { Injectable, Logger } from '@nestjs/common';
import { IStorageService } from '../interfaces/storage.interface';
import { ConfigService } from '@nestjs/config';
import { existsSync, mkdirSync, chmodSync } from 'fs';
import { join } from 'path';

@Injectable()
export class LocalStorageService implements IStorageService {
  private readonly uploadPath: string;
  private readonly logger = new Logger(LocalStorageService.name);

  constructor(private configService: ConfigService) {
    // Gunakan UPLOAD_PATH dari env, atau default ke ./uploads
    const uploadDir = this.configService.get('UPLOAD_PATH') || 'uploads';
    this.uploadPath = join(process.cwd(), uploadDir);
    
    this.logger.log(`Upload path: ${this.uploadPath}`);
    
    // Buat folder jika belum ada
    if (!existsSync(this.uploadPath)) {
      try {
        mkdirSync(this.uploadPath, { recursive: true });
        // Set permission 755 untuk VPS (rwxr-xr-x)
        chmodSync(this.uploadPath, 0o755);
        this.logger.log(`Upload directory created: ${this.uploadPath}`);
      } catch (error) {
        this.logger.error(`Failed to create upload directory: ${error.message}`);
        throw error;
      }
    }
  }

  async upload(file: Express.Multer.File) {
    try {
      // Generate unique filename dengan timestamp dan random number
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);

      // Extract extension dengan aman
      const ext = this.getFileExtension(file.originalname);

      // Validasi extension
      if (!ext) {
        throw new Error('File extension tidak valid');
      }

      const filename = `${uniqueSuffix}.${ext}`;
      const filePath = join(this.uploadPath, filename);

      this.logger.log(`Uploading file: ${filename} to ${filePath}`);

      // Simpan file
      const fs = await import('fs/promises');
      await fs.writeFile(filePath, file.buffer);
      
      // Set permission 644 untuk file (rw-r--r--)
      chmodSync(filePath, 0o644);

      const url = this.getUrl(filename);
      this.logger.log(`File uploaded successfully: ${filename}`);

      return {
        url,
        key: filename,
      };
    } catch (error) {
      this.logger.error(`Failed to upload file: ${error.message}`, error.stack);
      throw new Error(`Gagal menyimpan file: ${error.message}`);
    }
  }

  /**
   * Extract file extension dengan aman
   */
  private getFileExtension(filename: string): string {
    if (!filename) return '';

    const parts = filename.toLowerCase().split('.');
    if (parts.length < 2) return '';

    const ext = parts[parts.length - 1];

    // Whitelist extension yang diizinkan
    const allowedExtensions = ['jpg', 'jpeg', 'png', 'webp', 'gif'];

    if (!allowedExtensions.includes(ext)) {
      return '';
    }

    return ext;
  }

  async delete(key: string) {
    const fs = await import('fs/promises');
    const filePath = join(this.uploadPath, key);
    try {
      await fs.unlink(filePath);
      this.logger.log(`File deleted successfully: ${key}`);
    } catch (err) {
      this.logger.warn(`Failed to delete file ${key}: ${err.message}`);
      // File tidak ditemukan, abaikan
    }
  }

  getUrl(key: string): string {
    const baseUrl = this.configService.get('APP_URL') || 'http://localhost:5000';
    return `${baseUrl}/uploads/${key}`;
  }
}
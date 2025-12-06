// upload/storage/storage.provider.ts
import { Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IStorageService } from '../interfaces/storage.interface';
import { LocalStorageService } from './local.storage';

export const STORAGE_SERVICE = 'STORAGE_SERVICE';

export const StorageProvider: Provider = {
  provide: STORAGE_SERVICE,
  useFactory: (configService: ConfigService): IStorageService => {
    const storageType = configService.get('STORAGE_TYPE', 'local');
    
    
    // Default ke local storage
    return new LocalStorageService(configService);
  },
  inject: [ConfigService],
};
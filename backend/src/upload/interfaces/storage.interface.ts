export interface IStorageService {
  upload(file: Express.Multer.File): Promise<{ url: string; key: string }>;
  delete(key: string): Promise<void>;
  getUrl(key: string): string;
}
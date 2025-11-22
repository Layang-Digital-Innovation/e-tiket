// frontend/src/services/upload.service.ts
import { useAuthStore } from '@/store/auth.store';
import axios from 'axios';

class UploadService {
  private apiUrl = process.env.NEXT_PUBLIC_API_URL;

  

  async uploadImage(file: File): Promise<{ url: string; key: string }> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await axios.post(`${this.apiUrl}/upload/image`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',

      },
    });

    return response.data.data;
  }

  async deleteImage(key: string): Promise<void> {
    await axios.delete(`${this.apiUrl}/upload/${key}`);
  }
}

export const uploadService = new UploadService();
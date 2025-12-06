import { useState, useCallback } from 'react';
import { apiService } from '@/services/api';

interface UploadResponse {
  success: boolean;
  data: {
    url: string;
    key: string;
  };
}

interface UseImageUploadOptions {
  maxSize?: number; // in MB
  onSuccess?: (url: string) => void;
  onError?: (error: string) => void;
}

export function useImageUpload(options: UseImageUploadOptions = {}) {
  const { maxSize = 5, onSuccess, onError } = options;
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);

  const upload = useCallback(
    async (file: File): Promise<string | null> => {
      setIsLoading(true);
      setError(null);

      try {
        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
          throw new Error('Format file tidak didukung. Gunakan JPEG, PNG, WEBP');
        }

        // Validate file size
        const fileSizeMB = file.size / (1024 * 1024);
        if (fileSizeMB > maxSize) {
          throw new Error(`Ukuran file terlalu besar. Maksimal ${maxSize}MB`);
        }

        // Upload file using apiService
        const { url } = await apiService.uploadImage(file);

        setUploadedUrl(url);
        onSuccess?.(url);

        return url;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Gagal mengupload gambar';
        setError(errorMessage);
        onError?.(errorMessage);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [maxSize, onSuccess, onError]
  );

  const reset = useCallback(() => {
    setUploadedUrl(null);
    setError(null);
  }, []);

  return {
    upload,
    isLoading,
    error,
    uploadedUrl,
    reset,
  };
}

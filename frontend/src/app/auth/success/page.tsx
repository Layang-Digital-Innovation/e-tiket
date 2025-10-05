'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function AuthSuccessPage() {
  const router = useRouter();
  const { updateUser } = useAuth();
  const [isProcessing, setIsProcessing] = useState(true);

  useEffect(() => {
    const processAuthSuccess = async () => {
      try {
        setIsProcessing(true);
        // Get token and user data from cookies
        const token = getCookie('authToken');
        const userDataStr = getCookie('userData');

        console.log(userDataStr)

        if (!token || !userDataStr) {
          throw new Error('Missing authentication data');
        }

        const userData = JSON.parse(decodeURIComponent(userDataStr));

        // Validate user data structure
        if (!userData.id || !userData.email || !userData.role) {
          throw new Error('Invalid user data structure');
        }


 

        // Redirect based on user role
        const redirectPath = getUserRedirectPath(userData.role);
        
        // Small delay to ensure state is updated
        setTimeout(() => {
          setIsProcessing(false);
          router.replace(redirectPath);
        }, 500);

      } catch (error) {
        console.error('Auth success processing failed:', error);
        // Clear any partial auth data
        clearAuthData();
        setIsProcessing(false);
        router.replace('/login?error=Authentication processing failed');
      }
    };

    processAuthSuccess();
  }, [updateUser, router]);

  const getCookie = (name: string): string | null => {
    if (typeof document === 'undefined') return null;
    
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) {
      return parts.pop()?.split(';').shift() || null;
    }
    return null;
  };

  const clearAuthData = () => {
    // Clear localStorage
    localStorage.removeItem('authToken');
    localStorage.removeItem('authUser');
    
    // Clear cookies
    document.cookie = 'authToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    document.cookie = 'userData=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
  };

  const getUserRedirectPath = (role: string): string => {
    switch (role) {
      case 'admin':
        return '/admin/dashboard';
      case 'event_organizer':
        return '/organizer/dashboard';
      default:
        return '/dashboard';
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 text-green-600">
            <svg className="animate-spin h-12 w-12" fill="none" viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Memproses Autentikasi
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Mohon tunggu sebentar, kami sedang menyelesaikan proses login Anda...
          </p>
        </div>
      </div>
    </div>
  );
}
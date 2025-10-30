'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';

export default function AuthSuccessPage() {
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(true);

  useEffect(() => {
    const processAuthSuccess = async () => {
      try {
        setIsProcessing(true);
        
        // Get token and user data from cookies
        const token = getCookie('access_token');
        const userDataStr = getCookie('userData');

        console.log('OAuth Success - Token:', token ? 'EXISTS' : 'MISSING');
        console.log('OAuth Success - UserData:', userDataStr);

        if (!token || !userDataStr) {
          throw new Error('Missing authentication data');
        }

        const userData = JSON.parse(decodeURIComponent(userDataStr));

        // Validate user data structure
        if (!userData.id || !userData.email || !userData.role) {
          throw new Error('Invalid user data structure');
        }

        // Update Zustand store with user data using setState
        useAuthStore.setState({
          user: userData,
          isAuthenticated: true,
          tokenExpiry: Date.now() + (60 * 60 * 24 * 7 * 1000), // 7 days
          isLoading: false,
          error: null,
        });

        console.log('✅ OAuth Success - User authenticated:', userData.email, 'Role:', userData.role);

        // Redirect based on user role
        const redirectPath = getUserRedirectPath(userData.role);
        
        // Small delay to ensure state is updated
        setTimeout(() => {
          setIsProcessing(false);
          router.replace(redirectPath);
        }, 500);

      } catch (error) {
        console.error('❌ Auth success processing failed:', error);
        // Clear any partial auth data
        clearAuthData();
        setIsProcessing(false);
        router.replace('/login?error=Authentication processing failed');
      }
    };

    processAuthSuccess();
  }, [router]);

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
    localStorage.removeItem('auth-storage');
    
    // Clear cookies
    document.cookie = 'access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    document.cookie = 'user_role=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    document.cookie = 'userData=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
  };

  const getUserRedirectPath = (role: string): string => {
    switch (role) {
      case 'ADMIN':
        return '/admin/dashboard';
      case 'EVENT_ORGANIZER':
        return '/organizer/dashboard';
      default:
        return '/';
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
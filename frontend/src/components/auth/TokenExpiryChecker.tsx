'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';

/**
 * TokenExpiryChecker - Component to check token expiry in real-time
 * Automatically logs out user when token expires
 */
export function TokenExpiryChecker() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const logout = useAuthStore((state) => state.logout);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const initialCheckDoneRef = useRef(false);

  useEffect(() => {
    if (!isAuthenticated) {
      // Clear interval if user is not authenticated
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      initialCheckDoneRef.current = false;
      return;
    }

    // Function to check token expiry
    const checkTokenExpiry = async () => {
      try {
        // Get cookies
        const cookies = document.cookie.split(';').reduce((acc, cookie) => {
          const [key, value] = cookie.trim().split('=');
          acc[key] = value;
          return acc;
        }, {} as Record<string, string>);

        const token = cookies['access_token'];

        if (!token) {
          // Only logout if this is not the initial check after login
          if (initialCheckDoneRef.current) {
            console.log('🔴 No access_token found - logging out');
            await logout();
            router.push('/login');
          } else {
            console.log('⏳ Initial check - no token yet, waiting...');
          }
          return;
        }
        
        // Mark initial check as done once we have a token
        initialCheckDoneRef.current = true;

        // Decode JWT to check expiry
        try {
          const payload = token.split('.')[1];
          if (!payload) {
            console.log('🔴 Invalid token format - logging out');
            await logout();
            router.push('/login');
            return;
          }

          const decoded = JSON.parse(atob(payload));
          
          if (decoded.exp) {
            const now = Math.floor(Date.now() / 1000); // Convert to seconds
            const timeUntilExpiry = decoded.exp - now;

            if (timeUntilExpiry <= 0) {
              console.log('🔴 Token expired - logging out');
              await logout();
              router.push('/login?reason=session_expired');
              return;
            }

            // Log warning if token expires soon (less than 5 minutes)
            if (timeUntilExpiry <= 300) {
              console.log(`⚠️ Token expires in ${timeUntilExpiry} seconds`);
            }
          }
        } catch (decodeError) {
          console.error('Failed to decode token:', decodeError);
          await logout();
          router.push('/login');
        }
      } catch (error) {
        console.error('Error checking token expiry:', error);
      }
    };

    // Delay initial check by 2 seconds to allow OAuth flow to complete
    const initialTimeout = setTimeout(() => {
      checkTokenExpiry();
    }, 2000);

    // Check every 30 seconds after initial check
    intervalRef.current = setInterval(checkTokenExpiry, 30000);

    return () => {
      clearTimeout(initialTimeout);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isAuthenticated, logout, router]);

  // This component doesn't render anything
  return null;
}

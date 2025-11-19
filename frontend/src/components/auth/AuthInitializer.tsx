'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/store/auth.store';
import { TokenExpiryChecker } from './TokenExpiryChecker';

/**
 * AuthInitializer - Component to initialize auth state on app mount
 * Replaces the need for AuthProvider/Context
 * Also includes real-time token expiry checking
 */
export function AuthInitializer() {
  const checkAuthStatus = useAuthStore((state) => state.checkAuthStatus);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  useEffect(() => {
    // Quick check: if token exists in cookies but isAuthenticated is false, 
    // immediately trigger checkAuthStatus to prevent user being stuck on home
    const hasAccessToken = document.cookie.includes('access_token=');
    
    if (hasAccessToken && !isAuthenticated) {
      console.log('🔄 AuthInitializer: Token found in cookies, checking auth status...');
    } else if (!hasAccessToken && isAuthenticated) {
      console.log('⚠️ AuthInitializer: No token in cookies but isAuthenticated is true, clearing state...');
    }
    
    // Check authentication status on mount
    console.log('🔄 AuthInitializer: Checking auth status...');
    checkAuthStatus()
      .then(() => {
        console.log('✅ AuthInitializer: Auth check completed');
      })
      .catch((error) => {
        console.error('❌ AuthInitializer: Auth check failed:', error);
      });
  }, [checkAuthStatus, isAuthenticated]);

  return (
    <>
      {/* Real-time token expiry checker */}
      <TokenExpiryChecker />
    </>
  );
}

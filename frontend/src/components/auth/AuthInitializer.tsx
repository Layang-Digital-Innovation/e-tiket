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

  useEffect(() => {
    // Check authentication status on mount
    console.log('🔄 AuthInitializer: Checking auth status...');
    checkAuthStatus()
      .then(() => {
        console.log('✅ AuthInitializer: Auth check completed');
      })
      .catch((error) => {
        console.error('❌ AuthInitializer: Auth check failed:', error);
      });
  }, [checkAuthStatus]);

  return (
    <>
      {/* Real-time token expiry checker */}
      <TokenExpiryChecker />
    </>
  );
}

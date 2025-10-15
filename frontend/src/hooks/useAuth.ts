/**
 * useAuth - Custom hook for authentication
 * Uses Zustand store directly without Context API
 * 
 * @example
 * import { useAuth } from '@/hooks/useAuth';
 * 
 * const { user, isAuthenticated, login, logout } = useAuth();
 */

import { useAuthStore } from '@/store/auth.store';

export function useAuth() {
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isLoading = useAuthStore((state) => state.isLoading);
  const error = useAuthStore((state) => state.error);
  const tokenExpiry = useAuthStore((state) => state.tokenExpiry);
  const login = useAuthStore((state) => state.login);
  const register = useAuthStore((state) => state.register);
  const logout = useAuthStore((state) => state.logout);
  const refreshProfile = useAuthStore((state) => state.refreshProfile);
  const checkAuthStatus = useAuthStore((state) => state.checkAuthStatus);
  const clearError = useAuthStore((state) => state.clearError);

  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    tokenExpiry,
    login,
    register,
    logout,
    refreshProfile,
    checkAuthStatus,
    clearError,
  };
}

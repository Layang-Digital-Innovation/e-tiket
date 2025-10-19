import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { apiService } from '@/services/api';
import { User, LoginRequest } from '@/types';
import { getQueryClient } from '@/lib/react-query';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  tokenExpiry: number | null;
}

interface AuthActions {
  login: (credentials: LoginRequest) => Promise<void>;
  register: (userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  checkAuthStatus: () => Promise<void>;
  clearError: () => void;
  setTokenExpiry: (expiry: number) => void;
}

type AuthStore = AuthState & AuthActions;

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      tokenExpiry: null,

      // Actions
      login: async (credentials) => {
        set({ isLoading: true, error: null });

        try {
          const response = await apiService.login(credentials);
          
          // Fetch user profile after login
          const user = await apiService.getProfile();
          
          // Calculate token expiry (assuming 1 hour from now if not provided)
          const expiry = Date.now() + (60 * 60 * 1000);
          
          set({
            user: user.data,
            isAuthenticated: true,
            isLoading: false,
            error: null,
            tokenExpiry: expiry,
          });
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : 'Login gagal. Silakan coba lagi.';
          set({
            isLoading: false,
            error: errorMessage,
            user: null,
            isAuthenticated: false,
          });
          throw error;
        }
      },

      register: async (userData) => {
        set({ isLoading: true, error: null });

        try {
          await apiService.register(userData);
          
          // After successful registration, log the user in
          await get().login({
            email: userData.email,
            password: userData.password,
          });
        } catch (error) {
          const errorMessage =
            error instanceof Error
              ? error.message
              : 'Pendaftaran gagal. Silakan coba lagi.';
          set({
            isLoading: false,
            error: errorMessage,
          });
          throw error;
        }
      },

      logout: async () => {
        set({ isLoading: true, error: null });

        try {
          await apiService.logout();
        } catch (error) {
          console.error('Logout error:', error);
          // Even if API call fails, clear local state
        } finally {
          // Clear cookies manually (client-side)
          document.cookie = 'access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax';
          document.cookie = 'user_role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax';
          
          // Clear local storage
          localStorage.removeItem('auth-storage');
          
          // Clear all React Query cache
          const queryClient = getQueryClient();
          queryClient.clear();
          console.log('✅ React Query cache cleared');
          
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
            tokenExpiry: null,
          });
        }
      },

      refreshProfile: async () => {
        if (!get().isAuthenticated) return;

        try {
          const user = await apiService.getProfile();
          set({ user: user.data , error: null });
        } catch (error) {
          const errorMessage =
            error instanceof Error
              ? error.message
              : 'Gagal memuat profil pengguna.';
          set({ error: errorMessage });
        }
      },

      checkAuthStatus: async () => {
        set({ isLoading: true, error: null });

        try {
          console.log('🔍 Auth Store: Fetching user profile...');
          const response = await apiService.getProfile();
          console.log('📦 Auth Store: Profile response:', response);
          
          // Calculate token expiry if we got user data
          const expiry = Date.now() + (60 * 60 * 1000);
          
          set({
            user: response.data,
            isAuthenticated: true,
            isLoading: false,
            error: null,
            tokenExpiry: expiry,
          });
          
          console.log('✅ Auth Store: User data set:', response.data);
        } catch (error) {
          console.error('❌ Auth Store: Failed to get profile:', error);
          // User is not authenticated
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
            tokenExpiry: null,
          });
        }
      },

      clearError: () => {
        set({ error: null });
      },

      setTokenExpiry: (expiry) => {
        set({ tokenExpiry: expiry });
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      // Only persist user and isAuthenticated, not loading/error states
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        tokenExpiry: state.tokenExpiry,
      }),
    }
  )
);

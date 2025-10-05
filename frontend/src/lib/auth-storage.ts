// Authentication Storage Utilities
export interface StoredUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'event_organizer' | 'user';
  status: 'active' | 'inactive' | 'suspended';
}

export interface AuthData {
  token: string;
  user: StoredUser;
  expiresAt: number;
}

// Storage keys
const AUTH_TOKEN_KEY = 'authToken';
const AUTH_USER_KEY = 'authUser';
const AUTH_EXPIRES_KEY = 'authExpires';
const REMEMBER_ME_KEY = 'rememberMe';

export class AuthStorage {
  // Check if we're in browser environment
  private static isBrowser(): boolean {
    return typeof window !== 'undefined';
  }

  // Get storage type based on remember me preference
  private static getStorage(): Storage {
    if (!this.isBrowser()) {
      throw new Error('Storage not available in server environment');
    }
    
    const rememberMe = localStorage.getItem(REMEMBER_ME_KEY) === 'true';
    return rememberMe ? localStorage : sessionStorage;
  }

  // Set authentication data
  static setAuthData(authData: AuthData, rememberMe: boolean = false): void {
    if (!this.isBrowser()) return;

    try {
      // Set remember me preference
      localStorage.setItem(REMEMBER_ME_KEY, rememberMe.toString());
      
      const storage = rememberMe ? localStorage : sessionStorage;
      
      storage.setItem(AUTH_TOKEN_KEY, authData.token);
      storage.setItem(AUTH_USER_KEY, JSON.stringify(authData.user));
      storage.setItem(AUTH_EXPIRES_KEY, authData.expiresAt.toString());
      
      // Also set in localStorage for cross-tab communication if using sessionStorage
      if (!rememberMe) {
        localStorage.setItem('sessionAuthActive', 'true');
      }
    } catch (error) {
      console.error('Error saving auth data:', error);
    }
  }

  // Get authentication data
  static getAuthData(): AuthData | null {
    if (!this.isBrowser()) return null;

    try {
      const storage = this.getStorage();
      
      const token = storage.getItem(AUTH_TOKEN_KEY);
      const userStr = storage.getItem(AUTH_USER_KEY);
      const expiresStr = storage.getItem(AUTH_EXPIRES_KEY);

      if (!token || !userStr || !expiresStr) {
        return null;
      }

      const expiresAt = parseInt(expiresStr, 10);
      const now = Date.now();

      // Check if token is expired
      if (now >= expiresAt) {
        this.clearAuthData();
        return null;
      }

      const user = JSON.parse(userStr);

      return {
        token,
        user,
        expiresAt,
      };
    } catch (error) {
      console.error('Error retrieving auth data:', error);
      this.clearAuthData();
      return null;
    }
  }

  // Get just the token
  static getToken(): string | null {
    const authData = this.getAuthData();
    return authData?.token || null;
  }

  // Get just the user
  static getUser(): StoredUser | null {
    const authData = this.getAuthData();
    return authData?.user || null;
  }

  // Check if user is authenticated
  static isAuthenticated(): boolean {
    return this.getAuthData() !== null;
  }

  // Check if token is about to expire (within 5 minutes)
  static isTokenExpiringSoon(): boolean {
    const authData = this.getAuthData();
    if (!authData) return false;

    const fiveMinutes = 5 * 60 * 1000; // 5 minutes in milliseconds
    const now = Date.now();
    
    return (authData.expiresAt - now) <= fiveMinutes;
  }

  // Get time until token expires
  static getTimeUntilExpiry(): number {
    const authData = this.getAuthData();
    if (!authData) return 0;

    return Math.max(0, authData.expiresAt - Date.now());
  }

  // Update user data
  static updateUser(userData: Partial<StoredUser>): void {
    if (!this.isBrowser()) return;

    try {
      const authData = this.getAuthData();
      if (!authData) return;

      const updatedUser = { ...authData.user, ...userData };
      const storage = this.getStorage();
      
      storage.setItem(AUTH_USER_KEY, JSON.stringify(updatedUser));
    } catch (error) {
      console.error('Error updating user data:', error);
    }
  }

  // Clear authentication data
  static clearAuthData(): void {
    if (!this.isBrowser()) return;

    try {
      // Clear from both storages to be safe
      localStorage.removeItem(AUTH_TOKEN_KEY);
      localStorage.removeItem(AUTH_USER_KEY);
      localStorage.removeItem(AUTH_EXPIRES_KEY);
      localStorage.removeItem(REMEMBER_ME_KEY);
      localStorage.removeItem('sessionAuthActive');
      
      sessionStorage.removeItem(AUTH_TOKEN_KEY);
      sessionStorage.removeItem(AUTH_USER_KEY);
      sessionStorage.removeItem(AUTH_EXPIRES_KEY);
    } catch (error) {
      console.error('Error clearing auth data:', error);
    }
  }

  // Check if remember me is enabled
  static isRememberMeEnabled(): boolean {
    if (!this.isBrowser()) return false;
    return localStorage.getItem(REMEMBER_ME_KEY) === 'true';
  }

  // Listen for storage changes (for cross-tab logout)
  static onStorageChange(callback: (isAuthenticated: boolean) => void): () => void {
    if (!this.isBrowser()) return () => {};

    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === AUTH_TOKEN_KEY || event.key === 'sessionAuthActive') {
        const isAuthenticated = this.isAuthenticated();
        callback(isAuthenticated);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Return cleanup function
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }

  // Refresh token if it's about to expire
  static async refreshTokenIfNeeded(refreshCallback: () => Promise<AuthData>): Promise<boolean> {
    if (!this.isTokenExpiringSoon()) {
      return false;
    }

    try {
      const newAuthData = await refreshCallback();
      const rememberMe = this.isRememberMeEnabled();
      this.setAuthData(newAuthData, rememberMe);
      return true;
    } catch (error) {
      console.error('Error refreshing token:', error);
      this.clearAuthData();
      return false;
    }
  }
}

// Helper function to decode JWT token (basic implementation)
export function decodeJWT(token: string): any {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Error decoding JWT:', error);
    return null;
  }
}

// Helper function to get token expiry time
export function getTokenExpiry(token: string): number {
  const decoded = decodeJWT(token);
  return decoded?.exp ? decoded.exp * 1000 : Date.now() + (24 * 60 * 60 * 1000); // Default to 24 hours
}
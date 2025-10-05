import { AuthStorage } from './auth-storage';

// Auto-logout middleware
export class AuthMiddleware {
  private static logoutTimer: NodeJS.Timeout | null = null;
  private static warningTimer: NodeJS.Timeout | null = null;
  private static onLogoutCallback: (() => void) | null = null;
  private static onWarningCallback: ((timeLeft: number) => void) | null = null;

  // Initialize auto-logout functionality
  static initialize(
    onLogout: () => void,
    onWarning?: (timeLeft: number) => void
  ): void {
    this.onLogoutCallback = onLogout;
    this.onWarningCallback = onWarning;
    
    this.setupAutoLogout();
    this.setupStorageListener();
  }

  // Setup auto-logout timer
  private static setupAutoLogout(): void {
    this.clearTimers();

    const timeUntilExpiry = AuthStorage.getTimeUntilExpiry();
    
    if (timeUntilExpiry <= 0) {
      // Token already expired
      this.handleLogout();
      return;
    }

    // Set warning timer (5 minutes before expiry)
    const warningTime = Math.max(0, timeUntilExpiry - (5 * 60 * 1000));
    if (warningTime > 0 && this.onWarningCallback) {
      this.warningTimer = setTimeout(() => {
        const remainingTime = AuthStorage.getTimeUntilExpiry();
        if (remainingTime > 0 && this.onWarningCallback) {
          this.onWarningCallback(remainingTime);
        }
      }, warningTime);
    }

    // Set logout timer
    this.logoutTimer = setTimeout(() => {
      this.handleLogout();
    }, timeUntilExpiry);
  }

  // Handle logout
  private static handleLogout(): void {
    this.clearTimers();
    AuthStorage.clearAuthData();
    
    if (this.onLogoutCallback) {
      this.onLogoutCallback();
    }
  }

  // Clear all timers
  private static clearTimers(): void {
    if (this.logoutTimer) {
      clearTimeout(this.logoutTimer);
      this.logoutTimer = null;
    }
    
    if (this.warningTimer) {
      clearTimeout(this.warningTimer);
      this.warningTimer = null;
    }
  }

  // Setup storage listener for cross-tab logout
  private static setupStorageListener(): void {
    AuthStorage.onStorageChange((isAuthenticated) => {
      if (!isAuthenticated) {
        this.handleLogout();
      } else {
        // Re-setup timers if user logged in from another tab
        this.setupAutoLogout();
      }
    });
  }

  // Refresh timers (call this after token refresh)
  static refreshTimers(): void {
    this.setupAutoLogout();
  }

  // Cleanup
  static cleanup(): void {
    this.clearTimers();
    this.onLogoutCallback = null;
    this.onWarningCallback = null;
  }
}

// API Interceptor for automatic token handling
export class ApiInterceptor {
  private static baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  // Enhanced fetch with automatic token handling
  static async fetch(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<Response> {
    const url = endpoint.startsWith('http') ? endpoint : `${this.baseURL}${endpoint}`;
    
    // Get token from storage
    const token = AuthStorage.getToken();
    
    // Prepare headers
    const headers = new Headers(options.headers);
    headers.set('Content-Type', 'application/json');
    
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }

    // Make request
    const response = await fetch(url, {
      ...options,
      headers,
    });

    // Handle unauthorized response
    if (response.status === 401) {
      // Token is invalid or expired
      AuthStorage.clearAuthData();
      
      // Redirect to login if not already on login page
      if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
      
      throw new Error('Unauthorized - redirecting to login');
    }

    return response;
  }

  // Wrapper for JSON responses
  static async fetchJSON<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const response = await this.fetch(endpoint, options);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
    
    return response.json();
  }

  // GET request
  static async get<T>(endpoint: string): Promise<T> {
    return this.fetchJSON<T>(endpoint, { method: 'GET' });
  }

  // POST request
  static async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.fetchJSON<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  // PUT request
  static async put<T>(endpoint: string, data?: any): Promise<T> {
    return this.fetchJSON<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  // PATCH request
  static async patch<T>(endpoint: string, data?: any): Promise<T> {
    return this.fetchJSON<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  // DELETE request
  static async delete<T>(endpoint: string): Promise<T> {
    return this.fetchJSON<T>(endpoint, { method: 'DELETE' });
  }
}

// Session timeout warning component data
export interface SessionWarningData {
  isVisible: boolean;
  timeLeft: number;
  onExtend: () => void;
  onLogout: () => void;
}

// Utility function to format time remaining
export const formatTimeRemaining = (milliseconds: number): string => {
  if (milliseconds <= 0) return '0 seconds';
  
  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  
  if (hours > 0) {
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  } else if (minutes > 0) {
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  } else {
    return `${seconds}s`;
  }
};

export { AuthMiddleware, ApiInterceptor, ActivityTracker };

// Activity tracker to reset logout timer on user activity
export class ActivityTracker {
  private static isActive = false;
  private static activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
  private static onActivityCallback: (() => void) | null = null;

  static initialize(onActivity: () => void): void {
    this.onActivityCallback = onActivity;
    this.startTracking();
  }

  private static startTracking(): void {
    if (typeof window === 'undefined') return;

    this.activityEvents.forEach(event => {
      document.addEventListener(event, this.handleActivity, true);
    });
  }

  private static handleActivity = (): void => {
    if (!this.isActive) {
      this.isActive = true;
      
      if (this.onActivityCallback) {
        this.onActivityCallback();
      }
      
      // Reset activity flag after a short delay
      setTimeout(() => {
        this.isActive = false;
      }, 1000);
    }
  };

  static cleanup(): void {
    if (typeof window === 'undefined') return;

    this.activityEvents.forEach(event => {
      document.removeEventListener(event, this.handleActivity, true);
    });
    
    this.onActivityCallback = null;
  }
}
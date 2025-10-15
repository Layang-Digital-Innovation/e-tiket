export interface AuthMiddlewareConfig {
  onLogout: () => void;
  onWarning?: (timeLeft: number) => void;
  warningTime?: number; // Time in ms before expiry to show warning (default: 5 minutes)
  checkInterval?: number; // How often to check token expiry (default: 1 minute)
}

// Helper function to format time remaining
export function formatTimeRemaining(ms: number): string {
  if (ms <= 0) return '0s';
  
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  
  if (hours > 0) {
    return `${hours}h ${minutes % 60}m`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  } else {
    return `${seconds}s`;
  }
}

export class AuthMiddleware {
  private config: Required<AuthMiddlewareConfig>;
  private intervalId: NodeJS.Timeout | null = null;
  private warningShown: boolean = false;

  constructor(config: AuthMiddlewareConfig) {
    this.config = {
      onLogout: config.onLogout,
      onWarning: config.onWarning || (() => {}),
      warningTime: config.warningTime || 5 * 60 * 1000, // 5 minutes
      checkInterval: config.checkInterval || 60 * 1000, // 1 minute
    };
  }

  start(): void {
    if (this.intervalId) {
      this.stop();
    }

    this.intervalId = setInterval(() => {
      this.checkTokenExpiry();
    }, this.config.checkInterval);

    // Check immediately on start
    this.checkTokenExpiry();
  }

  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.warningShown = false;
  }

  private checkTokenExpiry(): void {
    // Get token expiry from localStorage
    const authStorage = localStorage.getItem('auth-storage');
    
    if (!authStorage) {
      return;
    }

    try {
      const { state } = JSON.parse(authStorage);
      const tokenExpiry = state?.tokenExpiry;

      if (!tokenExpiry) {
        return;
      }

      const now = Date.now();
      const timeLeft = tokenExpiry - now;

      // Token has expired
      if (timeLeft <= 0) {
        this.stop();
        this.config.onLogout();
        return;
      }

      // Show warning if time left is less than warning time
      if (timeLeft <= this.config.warningTime && !this.warningShown) {
        this.warningShown = true;
        this.config.onWarning(timeLeft);
      }
    } catch (error) {
      console.error('Error checking token expiry:', error);
    }
  }

  resetWarning(): void {
    this.warningShown = false;
  }
}

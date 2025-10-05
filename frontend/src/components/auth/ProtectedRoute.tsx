'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

// Types
type UserRole = 'admin' | 'event_organizer' | 'user';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: UserRole[];
  requireAuth?: boolean;
  redirectTo?: string;
  fallback?: React.ReactNode;
}

// Loading component
const LoadingSpinner: React.FC = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    <span className="ml-3 text-gray-600">Loading...</span>
  </div>
);

// Unauthorized component
const UnauthorizedAccess: React.FC<{ requiredRoles?: UserRole[] }> = ({ requiredRoles }) => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="text-center">
      <div className="text-6xl text-red-500 mb-4">🚫</div>
      <h1 className="text-2xl font-bold text-gray-800 mb-2">Access Denied</h1>
      <p className="text-gray-600 mb-4">
        You don&apos;t have permission to access this page.
        {requiredRoles && (
          <span className="block mt-2">
            Required roles: {requiredRoles.join(', ')}
          </span>
        )}
      </p>
      <button
        onClick={() => window.history.back()}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
      >
        Go Back
      </button>
    </div>
  </div>
);

// Main ProtectedRoute component
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRoles = [],
  requireAuth = true,
  redirectTo = '/login',
  fallback,
}) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    if (isLoading) return;

    // If authentication is required but user is not authenticated
    if (requireAuth && !isAuthenticated) {
      router.push(redirectTo);
      return;
    }

    // If specific roles are required
    if (requiredRoles.length > 0 && user) {
      const hasRequiredRole = requiredRoles.includes(user.role);
      if (!hasRequiredRole) {
        setShouldRender(false);
        return;
      }
    }

    setShouldRender(true);
  }, [isAuthenticated, isLoading, user, requireAuth, requiredRoles, router, redirectTo]);

  // Show loading while checking authentication
  if (isLoading) {
    return fallback || <LoadingSpinner />;
  }

  // If authentication is required but user is not authenticated
  if (requireAuth && !isAuthenticated) {
    return null; // Router will handle redirect
  }

  // If specific roles are required but user doesn't have them
  if (requiredRoles.length > 0 && user && !requiredRoles.includes(user.role)) {
    return <UnauthorizedAccess requiredRoles={requiredRoles} />;
  }

  // If we shouldn't render yet, show loading
  if (!shouldRender) {
    return fallback || <LoadingSpinner />;
  }

  return <>{children}</>;
};

// HOC version for easier use
export function withProtectedRoute<P extends object>(
  Component: React.ComponentType<P>,
  options: Omit<ProtectedRouteProps, 'children'> = {}
) {
  return function ProtectedComponent(props: P) {
    return (
      <ProtectedRoute {...options}>
        <Component {...props} />
      </ProtectedRoute>
    );
  };
}

// Specific role-based components
export const AdminRoute: React.FC<{ children: React.ReactNode; fallback?: React.ReactNode }> = ({
  children,
  fallback,
}) => (
  <ProtectedRoute requiredRoles={['admin']} fallback={fallback}>
    {children}
  </ProtectedRoute>
);

export const OrganizerRoute: React.FC<{ children: React.ReactNode; fallback?: React.ReactNode }> = ({
  children,
  fallback,
}) => (
  <ProtectedRoute requiredRoles={['admin', 'event_organizer']} fallback={fallback}>
    {children}
  </ProtectedRoute>
);

export const UserRoute: React.FC<{ children: React.ReactNode; fallback?: React.ReactNode }> = ({
  children,
  fallback,
}) => (
  <ProtectedRoute requiredRoles={['admin', 'event_organizer', 'user']} fallback={fallback}>
    {children}
  </ProtectedRoute>
);

// Public route (for pages that should only be accessible when NOT authenticated)
export const PublicRoute: React.FC<{
  children: React.ReactNode;
  redirectTo?: string;
}> = ({ children, redirectTo = '/dashboard' }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push(redirectTo);
    }
  }, [isAuthenticated, isLoading, router, redirectTo]);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (isAuthenticated) {
    return null; // Router will handle redirect
  }

  return <>{children}</>;
};

// Hook for checking permissions
export const usePermissions = () => {
  const { user } = useAuth();

  const hasRole = (role: UserRole): boolean => {
    return user?.role === role;
  };

  const hasAnyRole = (roles: UserRole[]): boolean => {
    return user ? roles.includes(user.role) : false;
  };

  const isAdmin = (): boolean => {
    return hasRole('admin');
  };

  const isOrganizer = (): boolean => {
    return hasRole('event_organizer');
  };

  const isUser = (): boolean => {
    return hasRole('user');
  };

  const canAccessAdminPanel = (): boolean => {
    return isAdmin();
  };

  const canManageEvents = (): boolean => {
    return hasAnyRole(['admin', 'event_organizer']);
  };

  const canPurchaseTickets = (): boolean => {
    return hasAnyRole(['admin', 'event_organizer', 'user']);
  };

  return {
    user,
    hasRole,
    hasAnyRole,
    isAdmin,
    isOrganizer,
    isUser,
    canAccessAdminPanel,
    canManageEvents,
    canPurchaseTickets,
  };
};
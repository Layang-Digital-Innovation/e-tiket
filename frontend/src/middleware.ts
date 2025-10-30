import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Helper function to decode JWT and check expiry
function decodeAndValidateToken(token: string): { role: string | null; isValid: boolean } {
  try {
    // Decode JWT token (base64)
    const payload = token.split('.')[1];
    if (!payload) return { role: null, isValid: false };
    
    const decoded = JSON.parse(Buffer.from(payload, 'base64').toString());
    
    // Check if token is expired
    if (decoded.exp) {
      const now = Math.floor(Date.now() / 1000); // Convert to seconds
      if (decoded.exp < now) {
        console.log('⏰ TOKEN EXPIRED - exp:', decoded.exp, 'now:', now);
        return { role: null, isValid: false };
      }
    }
    
    return { role: decoded.role || null, isValid: true };
  } catch (error) {
    console.error('Failed to decode token:', error);
    return { role: null, isValid: false };
  }
}

// Role-based default routes
const roleDefaultRoutes: Record<string, string> = {
  'admin': '/admin/dashboard',
  'event_organizer': '/organizer/events',
  'user': '/dashboard',
};

export function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;
  
  // Check for access_token cookie set by backend
  const token = req.cookies.get('access_token')?.value;
  
  // Validate token and get user role
  let userRole: string | null = null;
  let isTokenValid = false;
  
  if (token) {
    const { role, isValid } = decodeAndValidateToken(token);
    userRole = role;
    isTokenValid = isValid;
    
    // Fallback: check user_role cookie if JWT decode fails
    if (!userRole) {
      userRole = req.cookies.get('user_role')?.value || null;
    }
  }

  // Protected routes that require authentication
  const protectedPaths = ['/dashboard', '/organizer', '/admin', '/redeem', '/checkin'];
  const isProtectedPath = protectedPaths.some(path => 
    pathname === path || pathname.startsWith(path + '/')
  );

  // Public routes that authenticated users should not access
  const authPaths = ['/login', '/register'];
  const isAuthPath = authPaths.includes(pathname);

  // Debug logging
  if (process.env.NODE_ENV === 'development') {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔍 Middleware Check');
    console.log('📍 Path:', pathname);
    console.log('🔒 Protected:', isProtectedPath);
    console.log('🍪 Token:', token ? 'EXISTS' : 'MISSING');
    console.log('✅ Valid:', isTokenValid);
    console.log('👤 Role:', userRole || 'UNKNOWN');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  }

  // 1. Redirect to login if accessing protected route without token OR with expired token
  if ((!token || !isTokenValid) && isProtectedPath) {
    console.log('❌ REDIRECTING TO LOGIN - No token or expired token for protected route');
    const loginUrl = new URL('/login', req.url);
    loginUrl.searchParams.set('redirect', pathname);
    
    // Create response with cleared cookies if token is invalid
    const response = NextResponse.redirect(loginUrl);
    if (token && !isTokenValid) {
      response.cookies.delete('access_token');
      response.cookies.delete('user_role');
    }
    return response;
  }

  // 2. Redirect authenticated users from auth pages to their role-based route
  if (token && isAuthPath) {
    const defaultRoute = userRole ? roleDefaultRoutes[userRole] || '/' : '/';
    console.log('✅ REDIRECTING TO ROLE ROUTE - Already authenticated, role:', userRole, '→', defaultRoute);
    return NextResponse.redirect(new URL(defaultRoute, req.url));
  }

  // 2.5. Redirect authenticated users from home page to their role-based route
  if (token && pathname === '/' && userRole) {
    const defaultRoute = roleDefaultRoutes[userRole];
    if (defaultRoute && defaultRoute !== '/') {
      console.log('✅ REDIRECTING FROM HOME - Role:', userRole, '→', defaultRoute);
      return NextResponse.redirect(new URL(defaultRoute, req.url));
    }
  }

  // 3. Role-based access control for protected routes
  if (token && isProtectedPath && userRole) {
    // Admin can access everything
    if (userRole === 'admin') {
      console.log('✅ ACCESS GRANTED - Admin access');
      return NextResponse.next();
    }

    // Organizer can only access /organizer, /redeem, and /checkin routes
    if ((userRole === 'organizer' || userRole === 'event_organizer') && (pathname.startsWith('/organizer') || pathname.startsWith('/redeem') || pathname.startsWith('/checkin'))) {
      console.log('✅ ACCESS GRANTED - Organizer access to organizer, redeem, and checkin routes');
      return NextResponse.next();
    }

    // Regular users can only access /dashboard
    if (userRole === 'user' && pathname.startsWith('/dashboard')) {
      console.log('✅ ACCESS GRANTED - User access to dashboard');
      return NextResponse.next();
    }

    // Unauthorized access - redirect to role's default route
    const defaultRoute = roleDefaultRoutes[userRole] || '/';
    console.log('⚠️ UNAUTHORIZED - Redirecting to default route:', defaultRoute);
    return NextResponse.redirect(new URL(defaultRoute, req.url));
  }

  console.log('✅ ACCESS GRANTED - Continue to', pathname);
  return NextResponse.next();
}

export const config = {
  // Only match specific paths to avoid unnecessary middleware runs
  matcher: [
    '/dashboard/:path*',
    '/organizer/:path*',
    '/admin/:path*',
    '/redeem/:path*',
    '/checkin/:path*',
    '/login',
    '/register',
    '/', // Home page untuk redirect berdasarkan role
  ],
};

import axios from 'axios';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const tokenFromQuery = searchParams.get('token');
  const tokenFromCookie = request.cookies.get('access_token')?.value;
  const error = searchParams.get('error');

  // Prefer token from query if provided, otherwise fall back to cookie set by backend
  const token = tokenFromQuery || tokenFromCookie;

  // Handle OAuth error
  if (error) {
    console.error('OAuth error:', error);
    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent('Authentication failed')}`, request.url)
    );
  }

  // Handle missing token
  if (!token) {
    console.error('No token received from OAuth callback (neither query param nor cookie)');
    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent('No authentication token received')}`, request.url)
    );
  }

  try {
    // Verify token with backend
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    console.log(' Verifying token with backend:', backendUrl);

    const response = await axios.get(`${backendUrl}/auth/profile`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      withCredentials: true,
    });

    if (response.status !== 200) {
      throw new Error('Invalid token');
    }

    const payload = response.data
    const userData = payload.data
    console.log(' Token verified, user:', userData.email)

    // Create response with redirect
    const redirectResponse = NextResponse.redirect(
      new URL('/auth/success', request.url)
    );

    // Set only userData cookie for client-side state
    // Backend already set access_token with correct domain and httpOnly
    const isProduction = process.env.NODE_ENV === 'production';

    // Set user role cookie for middleware fallback
    redirectResponse.cookies.set('user_role', userData.role, {
      httpOnly: false,
      secure: isProduction,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
      domain: isProduction ? '.naikkellas.com' : undefined,
    });

    redirectResponse.cookies.set('userData', JSON.stringify(userData), {
      httpOnly: false, // Allow client-side access
      secure: isProduction,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
      domain: isProduction ? '.naikkellas.com' : undefined,
    });

    return redirectResponse;

  } catch (error) {
    console.error('Token verification failed:', error);
    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent('Authentication verification failed')}`, request.url)
    );
  }
}
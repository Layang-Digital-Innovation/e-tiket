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
    console.error('No token received from OAuth callback');
    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent('No authentication token received')}`, request.url)
    );
  }

  try {
    // Verify token with backend
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    console.log('🔐 Verifying token with backend:', backendUrl);

    // Use the token to fetch user profile
    const response = await axios.get(`${backendUrl}/auth/profile`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (response.status !== 200) {
      throw new Error('Invalid token');
    }

    const payload = response.data;
    const userData = payload.data;
    console.log('✅ Token verified, user:', userData.email);

    // Create response with redirect to success page
    const redirectResponse = NextResponse.redirect(
      new URL('/auth/success', request.url)
    );

    const isProduction = process.env.NODE_ENV === 'production';
    const cookieOptions = {
      httpOnly: true, // Secure: Client JS cannot read this
      secure: isProduction, // HTTPS only in production
      sameSite: 'lax' as const,
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
      domain: isProduction ? '.naikkellas.com' : undefined,
    };

    // 1. Set access_token (HttpOnly - Security Critical)
    redirectResponse.cookies.set('access_token', token, cookieOptions);

    // 2. Set user_role (HttpOnly - For Middleware)
    redirectResponse.cookies.set('user_role', userData.role, cookieOptions);

    // 3. Set userData (NOT HttpOnly - For Client UI State)
    // This allows the client to know WHO is logged in without exposing the token
    redirectResponse.cookies.set('userData', JSON.stringify(userData), {
      ...cookieOptions,
      httpOnly: false,
    });

    return redirectResponse;

  } catch (error) {
    console.error('❌ Token verification failed:', error);
    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent('Authentication verification failed')}`, request.url)
    );
  }
}
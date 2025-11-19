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
    const response = await axios.get(`${backendUrl}/api/auth/profile`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (response.status !== 200) {
      throw new Error('Invalid token');
    }

    const payload = response.data
    const userData = payload.data

    // Create response with redirect
    const redirectResponse = NextResponse.redirect(
      new URL('/auth/success', request.url)
    );

    // Set secure cookies for token and user data
    const isProduction = process.env.NODE_ENV === 'production';
    
    // IMPORTANT: Use 'access_token' to match middleware expectations
    redirectResponse.cookies.set('access_token', token, {  
      httpOnly: false, // Allow client-side access for API calls
      secure: isProduction,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    // Set user role cookie for middleware fallback
    redirectResponse.cookies.set('user_role', userData.role, {
      httpOnly: false,
      secure: isProduction,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    redirectResponse.cookies.set('userData', JSON.stringify(userData), {
      httpOnly: false, // Allow client-side access
      secure: isProduction,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    return redirectResponse;

  } catch (error) {
    console.error('Token verification failed:', error);
    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent('Authentication verification failed')}`, request.url)
    );
  }
}
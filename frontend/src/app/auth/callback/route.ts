import axios from 'axios';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const token = searchParams.get('token');
  const error = searchParams.get('error');

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
    
    redirectResponse.cookies.set('authToken', token, {  
      httpOnly: false, // Allow client-side access for API calls
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
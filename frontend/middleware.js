import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  const unprotectedPaths = ['/login', '/register'];
  const pushhome = ['/profil'];
  const protectedPaths = [
    '/chat',
    '/setting',
  ];

  if (pushhome.some(path => pathname.startsWith(path))) {
    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/check-session`, {
        headers: {
          Cookie: request.headers.get('cookie') || '',
        },
        withCredentials: true,
      });

      if (!res.data.loggedIn) {
        return NextResponse.redirect(new URL('/', request.url));
      }
    } catch (error) {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  if (unprotectedPaths.some(path => pathname.startsWith(path))) {
    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/check-session`, {
        headers: {
          Cookie: request.headers.get('cookie') || '',
        },
        withCredentials: true,
      });

      if (res.data.loggedIn) {
        return NextResponse.redirect(new URL('/', request.url));
      }
    } catch (error) {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  if (protectedPaths.some(path => pathname.startsWith(path))) {
    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/check-session`, {
        headers: {
          Cookie: request.headers.get('cookie') || '',
        },
        withCredentials: true,
      });

      if (!res.data.loggedIn) {
        return NextResponse.redirect(new URL('/login', request.url));
      }
    } catch (error) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/login',
    '/register',
    '/chat/:path*',
    '/setting/:path*',
    '/profil'
  ],
}
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  
  const isAuth = !!token;
  const isAuthPage = req.nextUrl.pathname.startsWith('/admin/login');
  
  if (isAuthPage) {
    if (isAuth) {
      return NextResponse.redirect(new URL('/admin/sessions', req.url));
    }
    return null;
  }
  
  if (!isAuth && req.nextUrl.pathname.startsWith('/admin')) {
    return NextResponse.redirect(new URL('/admin/login', req.url));
  }
}

export const config = {
  matcher: ['/admin/:path*']
};

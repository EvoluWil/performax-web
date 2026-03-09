import { getToken } from 'next-auth/jwt';
import { NextRequest, NextResponse } from 'next/server';

const SESSION_COOKIE =
  process.env.NODE_ENV === 'production'
    ? '__Secure-next-auth.session-token'
    : 'next-auth.session-token';

export async function middleware(req: NextRequest) {
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const { pathname } = req.nextUrl;

  const isAuthRoute =
    pathname.startsWith('/auth') || pathname.startsWith('/sign-in');

  if (token?.error === 'RefreshAccessTokenError' && !isAuthRoute) {
    const signInUrl = new URL('/auth/sign-in', req.url);
    signInUrl.searchParams.set('error', 'SessionExpired');
    const response = NextResponse.redirect(signInUrl);
    response.cookies.delete(SESSION_COOKIE);
    return response;
  }

  if (!token && !isAuthRoute) {
    const signInUrl = new URL('/auth/sign-in', req.url);
    signInUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|public).*)'],
};

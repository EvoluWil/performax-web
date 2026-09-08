import { getToken } from 'next-auth/jwt';
import { NextRequest, NextResponse } from 'next/server';

const SESSION_COOKIE =
  process.env.NODE_ENV === 'production'
    ? '__Secure-next-auth.session-token'
    : 'next-auth.session-token';

const LEGACY_SIGN_IN_PATHS = new Set([
  '/sign-in',
  '/signin',
  '/api/auth/signin',
]);

function signInRedirect(req: NextRequest, error?: string) {
  const signInUrl = new URL('/auth/sign-in', req.url);
  if (error) {
    signInUrl.searchParams.set('error', error);
  }
  const response = NextResponse.redirect(signInUrl);
  if (error) {
    response.cookies.delete(SESSION_COOKIE);
  }
  return response;
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (LEGACY_SIGN_IN_PATHS.has(pathname)) {
    return signInRedirect(req);
  }

  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const isAuthRoute = pathname.startsWith('/auth');

  if (token?.error === 'RefreshAccessTokenError' && !isAuthRoute) {
    return signInRedirect(req, 'SessionExpired');
  }

  if (!token && !isAuthRoute) {
    const signInUrl = new URL('/auth/sign-in', req.url);
    signInUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
    '/api/auth/signin',
  ],
};

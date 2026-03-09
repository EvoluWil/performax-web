import { decode, encode } from 'next-auth/jwt';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

const COOKIE_NAME =
  process.env.NODE_ENV === 'production'
    ? '__Secure-next-auth.session-token'
    : 'next-auth.session-token';

const SECRET = process.env.NEXTAUTH_SECRET!;

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const existingCookie = cookieStore.get(COOKIE_NAME)?.value;

    if (!existingCookie) {
      return NextResponse.json({ error: 'No session cookie' }, { status: 401 });
    }

    const existing = await decode({ token: existingCookie, secret: SECRET });

    if (!existing) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
    }

    const { session: newSession, user } = await req.json();

    if (!newSession?.accessToken) {
      return NextResponse.json(
        { error: 'Missing accessToken' },
        { status: 400 },
      );
    }

    const maxAge = 30 * 24 * 60 * 60;

    const newToken = await encode({
      token: {
        ...existing,
        session: newSession,
        user: user ?? existing.user,
        error: undefined,
      },
      secret: SECRET,
      maxAge,
    });

    const response = NextResponse.json({ ok: true });
    response.cookies.set(COOKIE_NAME, newToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge,
    });

    return response;
  } catch (err) {
    console.error('[refresh-session] Error:', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

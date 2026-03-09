import { authService } from '@/features/auth/services/auth.service';
import { NextAuthOptions } from 'next-auth';
import { JWT } from 'next-auth/jwt';
import CredentialsProvider from 'next-auth/providers/credentials';
import { api } from '../api';

async function refreshAccessToken(token: JWT): Promise<JWT> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/auth/refresh-token`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: token.session?.refreshToken }),
      },
    );

    if (!response.ok) {
      return { ...token, error: 'RefreshAccessTokenError' as const };
    }

    const data = await response.json();

    return {
      ...token,
      user: data.user,
      session: data.session,
      error: undefined,
    };
  } catch {
    return { ...token, error: 'RefreshAccessTokenError' as const };
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'email', type: 'email' },
        password: { label: 'password', type: 'password' },
      },
      async authorize(credentials) {
        const result = await authService.signIn({
          email: credentials?.email as string,
          password: credentials?.password as string,
        });

        if (result) {
          return {
            ...result,
            id: result.user?.id,
          };
        }

        return null;
      },
    }),
  ],
  pages: {
    signIn: '/auth/sign-in',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.user = user?.user || {};
        token.session = user?.session || {};
      }

      if (!token.session?.refreshToken) {
        return token;
      }

      if (
        token.session?.accessTokenExpires &&
        Date.now() < token.session.accessTokenExpires - 30_000
      ) {
        return token;
      }

      return refreshAccessToken(token);
    },
    async session({ session, token }) {
      session.user = token.user;
      session.session = token.session;
      session.error = token.error;

      api.defaults.headers.common.Authorization = `Bearer ${token.session?.accessToken}`;
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

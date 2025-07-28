import { authService } from '@/features/auth/services/auth.service';
import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { api } from '../api';

// async function refreshAccessToken(refreshToken: string) {
//   try {
//     const result = await authService.refreshToken(refreshToken);

//     if (result) {
//       return result;
//     }

//     return null;
//   } catch {
//     return null;
//   }
// }

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

      if (
        token.session?.accessTokenExpires &&
        Date.now() < token.session.accessTokenExpires
      ) {
        return token;
      }
      console.warn('Access token expired, refreshing...');
      // const result = await refreshAccessToken(token.session?.refreshToken);
      // console.log('Result from refreshAccessToken:', result);
      // if (result) {
      //   token.user = result.user;
      //   token.session = result.session;
      //   return token;
      // }
      console.warn('RefreshAccessToken failed');
      return token;
      // return {
      //   ...token,
      //   user: null as any,
      //   session: null as any,
      //   error: 'RefreshAccessTokenError',
      // };
    },
    async session({ session, token }) {
      session.user = token.user;
      session.session = token.session;

      api.defaults.headers.common.Authorization = `Bearer ${token.session?.accessToken}`;
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

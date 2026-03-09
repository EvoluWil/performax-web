import { Session as SessionType } from '@/features/auth/types/session';
import { User as UserType } from '@/types/user';
import 'next-auth';
import 'next-auth/jwt';

declare module 'next-auth' {
  interface User {
    user: UserType;
    session: SessionType;
  }

  interface Session {
    user: UserType;
    session: SessionType;
    error?: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    session: SessionType;
    user: UserType;
    error?: string;
  }
}

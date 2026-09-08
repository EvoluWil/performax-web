'use client';

import { api } from '@/config/api';
import { User } from '@/types/user';
import {
  SessionProvider,
  signOut,
  useSession as useSessionBase,
} from 'next-auth/react';
import { PropsWithChildren, useEffect, useMemo, useRef } from 'react';

function SessionErrorHandler() {
  const { data } = useSessionBase();
  const handled = useRef(false);

  useEffect(() => {
    if (data?.error !== 'RefreshAccessTokenError' || handled.current) return;
    handled.current = true;
    signOut({ redirect: false });
  }, [data?.error]);

  return null;
}

export default function AuthProvider({ children }: PropsWithChildren) {
  return (
    <SessionProvider refetchOnWindowFocus={false} refetchWhenOffline={false}>
      <SessionErrorHandler />
      {children}
    </SessionProvider>
  );
}

export const useSession = () => {
  const session = useSessionBase();

  const user = useMemo(() => {
    if (!session?.data?.user || session.data.error === 'RefreshAccessTokenError') {
      return null;
    }

    api.defaults.headers.common.Authorization = `Bearer ${session?.data?.session?.accessToken}`;
    return session?.data?.user as User;
  }, [session]);

  return { user };
};

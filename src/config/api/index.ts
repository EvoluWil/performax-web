import axios, { AxiosHeaders, InternalAxiosRequestConfig } from 'axios';
import { QueryString } from 'nestjs-prisma-querybuilder-interface';
import { getServerSession } from 'next-auth';
import { getSession, signOut } from 'next-auth/react';
import { toast } from 'react-toastify';
import { authOptions } from '../auth';

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  paramsSerializer: (params) => QueryString(params),
});

let refreshPromise: Promise<string> | null = null;

function setAuthHeader(config: InternalAxiosRequestConfig, token: string) {
  if (config.headers instanceof AxiosHeaders) {
    config.headers.set('Authorization', `Bearer ${token}`);
  } else {
    (config.headers as Record<string, string>).Authorization =
      `Bearer ${token}`;
  }
}

async function doRefresh(): Promise<string> {
  const currentSession = await getSession();
  const refreshToken = currentSession?.session?.refreshToken;

  if (!refreshToken) {
    throw new Error('No refresh token available');
  }

  const refreshRes = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/auth/refresh-token`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    },
  );

  if (!refreshRes.ok) {
    throw new Error('Refresh token request failed');
  }

  const refreshData = await refreshRes.json();
  const newToken: string = refreshData?.session?.accessToken;

  if (!newToken) {
    throw new Error('Refresh response missing accessToken');
  }

  await fetch('/api/auth/refresh-session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      session: refreshData.session,
      user: refreshData.user ?? currentSession?.user,
    }),
  });

  api.defaults.headers.common.Authorization = `Bearer ${newToken}`;

  return newToken;
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as
      | (InternalAxiosRequestConfig & { _retry?: boolean })
      | undefined;

    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      global?.window
    ) {
      originalRequest._retry = true;

      if (!refreshPromise) {
        refreshPromise = doRefresh().finally(() => {
          refreshPromise = null;
        });
      }

      try {
        const newToken = await refreshPromise;
        setAuthHeader(originalRequest, newToken);
        return api(originalRequest);
      } catch (refreshError) {
        signOut({ callbackUrl: '/auth/sign-in' });
        return Promise.reject(refreshError);
      }
    }

    if (error.response?.status === 401) {
      return Promise.reject(error);
    }

    if (global?.window) {
      const defaultMessage =
        'Ops! Algo deu errado. Tente novamente mais tarde.';
      if (typeof error.response?.data?.message === 'string') {
        toast.error(error.response.data.message);
      } else {
        toast.error(error.response?.data?.message?.[0] ?? defaultMessage);
      }
    }

    return Promise.reject(error);
  },
);

api.interceptors.request.use(async (config) => {
  const hasAuth =
    config.headers instanceof AxiosHeaders
      ? !!config.headers.get('Authorization')
      : !!(config.headers as Record<string, string>)?.Authorization;

  if (!hasAuth) {
    if (!global?.window) {
      const session = await getServerSession(authOptions);
      if (
        session?.error !== 'RefreshAccessTokenError' &&
        session?.session?.accessToken
      ) {
        setAuthHeader(config, session.session.accessToken);
      }
    } else {
      const defaultAuth = api.defaults.headers.common.Authorization;
      if (defaultAuth) {
        setAuthHeader(config, (defaultAuth as string).replace('Bearer ', ''));
      } else {
        const session = await getSession();
        if (session?.session?.accessToken) {
          const token = session.session.accessToken;
          api.defaults.headers.common.Authorization = `Bearer ${token}`;
          setAuthHeader(config, token);
        }
      }
    }
  }

  return config;
});

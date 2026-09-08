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

const PUBLIC_AUTH_PATHS = [
  '/auth/sign-in',
  '/auth/sign-up',
  '/auth/forgot-password',
  '/auth/refresh-token',
  '/auth/delete-account',
  '/auth/validate-code',
  '/auth/recovery-password',
];

let sessionRefreshPromise: Promise<
  Awaited<ReturnType<typeof getSession>>
> | null = null;

function setAuthHeader(config: InternalAxiosRequestConfig, token: string) {
  if (config.headers instanceof AxiosHeaders) {
    config.headers.set('Authorization', `Bearer ${token}`);
  } else {
    (config.headers as Record<string, string>).Authorization =
      `Bearer ${token}`;
  }
}

function getRequestToken(config: InternalAxiosRequestConfig) {
  const header =
    config.headers instanceof AxiosHeaders
      ? config.headers.get('Authorization')
      : (config.headers as Record<string, string>)?.Authorization;

  return typeof header === 'string' ? header.replace(/^Bearer\s+/i, '') : '';
}

function isPublicAuthRequest(url?: string) {
  if (!url) return false;
  return PUBLIC_AUTH_PATHS.some((path) => url.includes(path));
}

function isAuthPage() {
  if (!global?.window) return false;
  const { pathname } = window.location;
  return (
    pathname.startsWith('/auth') ||
    pathname === '/sign-in' ||
    pathname === '/signin'
  );
}

function showApiError(error: { response?: { data?: { message?: string | string[] } } }) {
  const defaultMessage = 'Ops! Algo deu errado. Tente novamente mais tarde.';
  if (typeof error.response?.data?.message === 'string') {
    toast.error(error.response.data.message);
    return;
  }
  toast.error(error.response?.data?.message?.[0] ?? defaultMessage);
}

function loadSession() {
  if (!sessionRefreshPromise) {
    sessionRefreshPromise = getSession().finally(() => {
      sessionRefreshPromise = null;
    });
  }
  return sessionRefreshPromise;
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as
      | (InternalAxiosRequestConfig & { _retry?: boolean })
      | undefined;

    if (isPublicAuthRequest(originalRequest?.url)) {
      if (global?.window && !originalRequest?.url?.includes('/auth/sign-in')) {
        showApiError(error);
      }
      return Promise.reject(error);
    }

    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      global?.window
    ) {
      originalRequest._retry = true;

      try {
        const session = await loadSession();
        const newToken = session?.session?.accessToken;
        const failedToken = getRequestToken(originalRequest);

        if (
          session?.error === 'RefreshAccessTokenError' ||
          !newToken ||
          newToken === failedToken
        ) {
          if (!isAuthPage()) {
            signOut({ callbackUrl: '/auth/sign-in' });
          }
          return Promise.reject(error);
        }

        api.defaults.headers.common.Authorization = `Bearer ${newToken}`;
        setAuthHeader(originalRequest, newToken);
        return api(originalRequest);
      } catch (refreshError) {
        if (!isAuthPage()) {
          signOut({ callbackUrl: '/auth/sign-in' });
        }
        return Promise.reject(refreshError);
      }
    }

    if (error.response?.status === 401) {
      return Promise.reject(error);
    }

    if (global?.window && !isAuthPage()) {
      showApiError(error);
    }

    return Promise.reject(error);
  },
);

api.interceptors.request.use(async (config) => {
  if (isPublicAuthRequest(config.url)) {
    return config;
  }

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
        if (
          session?.error !== 'RefreshAccessTokenError' &&
          session?.session?.accessToken
        ) {
          const token = session.session.accessToken;
          api.defaults.headers.common.Authorization = `Bearer ${token}`;
          setAuthHeader(config, token);
        }
      }
    }
  }

  return config;
});

import axios from 'axios';
import { QueryString } from 'nestjs-prisma-querybuilder-interface';
import { getServerSession } from 'next-auth';
import { getSession } from 'next-auth/react';
import { toast } from 'react-toastify';
import { authOptions } from '../auth';

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  paramsSerializer: (params) => QueryString(params),
});

api.interceptors.response.use(null, (err) => {
  if (global?.window) {
    const defaultMessage = 'Ops! Algo deu errado. Tente novamente mais tarde.';
    if (typeof err.response?.data?.message === 'string') {
      toast?.error(err.response?.data?.message);
    } else {
      toast?.error(err.response?.data?.message[0] || defaultMessage);
    }
  }
  return { data: null };
});

api.interceptors.request.use(async (config) => {
  if (!config.headers.Authorization) {
    if (!global?.window) {
      const session = await getServerSession(authOptions);
      config.headers.Authorization = `Bearer ${session?.session?.accessToken}`;
    }
    if (global?.window) {
      const session = await getSession();
      if (session?.session?.accessToken) {
        config.headers.Authorization = `Bearer ${session?.session?.accessToken}`;
      }
    }
  }

  return config;
});

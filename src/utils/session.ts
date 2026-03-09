import { authOptions } from '@/config/auth';
import { getServerSession } from 'next-auth';

export const getUserSession = async () => {
  const session = await getServerSession(authOptions);
  if (!session || session.error === 'RefreshAccessTokenError') return null;
  return session.user || null;
};

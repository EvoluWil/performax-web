import { api } from '@/config/api';
import {
  ResetPasswordFormDto,
  SignUpFormDto,
  UpdatePasswordFormDto,
} from '@/features/auth/schemas';
import { Session } from '@/features/auth/types/session';
import { User } from '@/types/user';
import { signIn } from 'next-auth/react';

type SignInResponse = {
  user: User;
  session: Session;
};

type Credentials = {
  email: string;
  password: string;
};

class AuthService {
  async signIn(credentials: Credentials) {
    const { data } = await api.post<SignInResponse>(
      '/auth/sign-in',
      credentials,
    );

    return data;
  }

  async signUp(signUpFormDto: SignUpFormDto) {
    const { data } = await api.post<User>('/auth/sign-up', signUpFormDto);
    return data;
  }

  async credentials(credentials: Credentials) {
    const result = await signIn('credentials', {
      ...credentials,
      redirect: false,
    });

    return result;
  }

  async getMe() {
    const { data } = await api.get<User>('/auth/me');
    return data;
  }

  async updatePassword(updatePasswordFormDto: UpdatePasswordFormDto) {
    const { data } = await api.put<User>(
      '/auth/update-password',
      updatePasswordFormDto,
    );

    return data;
  }

  async resetPassword(
    token: string,
    resetPasswordFormDto: ResetPasswordFormDto,
  ) {
    const { data } = await api.post(
      `/auth/recovery-password/${token}`,
      resetPasswordFormDto,
    );

    return data;
  }

  async forgotPassword(email: string) {
    const { data } = await api.post('/auth/forgot-password', { email });

    return data;
  }

  async validateCode(code: string, email: string) {
    const { data } = await api.post<{ token: string }>(
      `/auth/validate-code/${code}`,
      {
        email,
      },
    );

    return data;
  }

  async refreshToken(refreshToken: string): Promise<SignInResponse> {
    const { data } = await api.post<SignInResponse>('/auth/refresh-token', {
      refreshToken,
    });

    return data;
  }
}

export const authService = new AuthService();

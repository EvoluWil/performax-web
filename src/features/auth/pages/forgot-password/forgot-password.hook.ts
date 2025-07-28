'use client';

import {
  ForgotPasswordFormDto,
  forgotPasswordFormInitialValues,
  forgotPasswordFormSchema,
} from '@/features/auth/schemas';
import { authService } from '@/features/auth/services';
import { yupResolver } from '@hookform/resolvers/yup';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';

export const useForgotPassword = () => {
  const [loading, setLoading] = useState(false);
  const { control, handleSubmit } = useForm<ForgotPasswordFormDto>({
    defaultValues: forgotPasswordFormInitialValues,
    resolver: yupResolver(forgotPasswordFormSchema),
  });

  const { replace } = useRouter();

  const handleSendEmail = handleSubmit(async (data: ForgotPasswordFormDto) => {
    setLoading(true);
    const result = await authService.forgotPassword(data.email);

    if (result) {
      toast.success('E-mail de recuperação enviado!');
      return replace(`/auth/email-validation/${data.email}`);
    }
    setLoading(false);
  });

  return {
    control,
    loading,
    handleSendEmail,
  };
};

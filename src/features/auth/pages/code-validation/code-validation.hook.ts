'use client';

import {
  CodeValidationFormDto,
  codeValidationFormInitialValues,
  codeValidationFormSchema,
} from '@/features/auth/schemas';
import { authService } from '@/features/auth/services';
import { yupResolver } from '@hookform/resolvers/yup';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';

export const useCodeValidation = () => {
  const [loading, setLoading] = useState(false);
  const { control, handleSubmit } = useForm<CodeValidationFormDto>({
    defaultValues: codeValidationFormInitialValues,
    resolver: yupResolver(codeValidationFormSchema),
  });
  const { replace } = useRouter();
  const { email } = useParams<{ email: string }>();

  const handleCodeValidation = handleSubmit(
    async (data: CodeValidationFormDto) => {
      setLoading(true);
      const decodedEmail = decodeURIComponent(email);
      const result = await authService.validateCode(data.code, decodedEmail);

      if (result) {
        toast.success('Código validado com sucesso!');
        return replace(`/auth/reset-password/${result.token}`);
      }
      setLoading(false);
    },
  );

  return {
    control,
    loading,
    handleCodeValidation,
  };
};

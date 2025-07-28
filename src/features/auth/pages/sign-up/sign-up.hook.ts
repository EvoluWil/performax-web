import {
  SignUpFormDto,
  signUpFormInitialValues,
  signUpFormSchema,
} from '@/features/auth/schemas';
import { authService } from '@/features/auth/services';
import { yupResolver } from '@hookform/resolvers/yup';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';

export const useSignUp = () => {
  const [loading, setLoading] = useState(false);
  const { control, handleSubmit, watch } = useForm<SignUpFormDto>({
    defaultValues: signUpFormInitialValues,
    resolver: yupResolver(signUpFormSchema),
  });

  const { replace } = useRouter();

  const handleCreateAccount = handleSubmit(async (data: SignUpFormDto) => {
    setLoading(true);

    const result = await authService.signUp(data);
    if (result) {
      toast.success('Conta criada com sucesso!');
      replace('/auth/sign-in');
    }
    setLoading(false);
  });

  const password = watch('credentials.password');

  return {
    control,
    handleSubmit,
    handleCreateAccount,
    loading,
    password,
  };
};

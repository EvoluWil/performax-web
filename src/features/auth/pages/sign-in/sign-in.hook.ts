import {
  SignFormDto,
  signInFormInitialValues,
  signInFormSchema,
} from '@/features/auth/schemas';
import { authService } from '@/features/auth/services';
import { yupResolver } from '@hookform/resolvers/yup';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';

export const useSignIn = () => {
  const [loading, setLoading] = useState(false);
  const [selectCompanyModalOpen, setSelectCompanyModalOpen] = useState(false);
  const { control, handleSubmit } = useForm<SignFormDto>({
    defaultValues: signInFormInitialValues,
    resolver: yupResolver(signInFormSchema),
  });

  const router = useRouter();

  const handleSignIn = handleSubmit(async (signFormData: SignFormDto) => {
    setLoading(true);
    const result = await authService.credentials(signFormData);

    if (result?.error) {
      setLoading(false);
      return toast.error('Usuário ou senha inválidos!');
    }

    setSelectCompanyModalOpen(true);
  });

  const handleCloseSelectCompanyModal = () => {
    setSelectCompanyModalOpen(false);
  };

  const handleSelectCompany = () => {
    router.replace('/panel');
  };

  return {
    control,
    handleSignIn,
    handleCloseSelectCompanyModal,
    loading,
    selectCompanyModalOpen,
    handleSelectCompany,
  };
};

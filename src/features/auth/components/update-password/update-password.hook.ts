import {
  UpdatePasswordFormDto,
  updatePasswordFormInitialValues,
  updatePasswordFormSchema,
} from '@/features/auth/schemas';
import { authService } from '@/features/auth/services';
import { yupResolver } from '@hookform/resolvers/yup';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { UpdatePasswordDrawerProps } from './update-password';

export const useUpdatePassword = ({
  onClose,
  open,
}: UpdatePasswordDrawerProps) => {
  const [loading, setLoading] = useState(false);
  const { control, handleSubmit, reset } = useForm<UpdatePasswordFormDto>({
    defaultValues: updatePasswordFormInitialValues,
    resolver: yupResolver(updatePasswordFormSchema),
  });

  const handleUpdatePassword = handleSubmit(
    async (data: UpdatePasswordFormDto) => {
      setLoading(true);
      const result = await authService.updatePassword(data);
      if (result) {
        toast.success('Senha alterada com sucesso');
        handleClose();
      }
      setLoading(false);
    },
  );

  const handleClose = () => {
    onClose();
    reset();
    setLoading(false);
  };

  return {
    control,
    handleUpdatePassword,
    loading,
    handleClose,
    open,
  };
};

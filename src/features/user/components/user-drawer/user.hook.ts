import { useUserMutation } from '@/features/user/hooks';
import {
  UserFormDto,
  userFormInitialValues,
  userFormSchema,
} from '@/features/user/schemas';
import { yupResolver } from '@hookform/resolvers/yup';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { UserDrawerProps } from './user';

export const useUserDrawer = ({
  onClose,
  open,
  user,
  initialName,
  onCreated,
}: UserDrawerProps) => {
  const userMutation = useUserMutation();

  const { control, handleSubmit, reset } = useForm<UserFormDto>({
    defaultValues: userFormInitialValues,
    resolver: yupResolver(userFormSchema),
  });

  const handleUser = handleSubmit(async (data: UserFormDto) => {
    const result = await userMutation.mutateAsync({
      type: user ? 'update' : 'create',
      data: data,
      id: user?.id,
    });

    if (result) {
      onCreated?.(result);
      toast.success(
        user ? 'Usuário atualizado com sucesso' : 'Usuário criado com sucesso',
      );
      handleClose();
      onClose();
    }
  });

  const handleClose = () => {
    onClose();
    reset();
  };

  useEffect(() => {
    if (user) {
      reset({
        name: user.name,
        cpf: user.cpf,
        email: user.email,
      });
    } else {
      reset({ ...userFormInitialValues, name: initialName ?? '' });
    }
  }, [user, reset, initialName]);

  return {
    control,
    handleUser,
    loading: userMutation.isPending,
    handleClose,
    open,
    editing: !!user,
  };
};

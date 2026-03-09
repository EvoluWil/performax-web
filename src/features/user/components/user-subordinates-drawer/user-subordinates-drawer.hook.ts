import { useUserRolesQuery, useUsersQuery } from '@/features/user/hooks';
import {
  UserSubordinatesFormDto,
  userSubordinatesFormInitialValues,
  userSubordinatesFormSchema,
} from '@/features/user/schemas';
import { User } from '@/types/user';
import { yupResolver } from '@hookform/resolvers/yup';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { useUserRoleTargetMutation } from '../../hooks/queries/user-role.query';

export type UserSubordinatesDrawerProps = {
  open: boolean;
  onClose: () => void;
  user: User | null;
};

export const useUserSubordinatesDrawer = ({
  onClose,
  open,
  user,
}: UserSubordinatesDrawerProps) => {
  const mutation = useUserRoleTargetMutation();
  const { data: usersData } = useUsersQuery({
    scopeModule: 'user',
    pageSize: 1000,
  });
  const { data: currentSubordinates } = useUserRolesQuery(
    user?.id || '',
    !!user?.id,
  );

  const { control, handleSubmit, reset, watch, setValue } =
    useForm<UserSubordinatesFormDto>({
      defaultValues: userSubordinatesFormInitialValues,
      resolver: yupResolver(userSubordinatesFormSchema),
    });

  const watchedUserIds = watch('targetIds') || [];

  // Filtrar usuários disponíveis (excluir o próprio usuário e proprietário)
  const availableUsers =
    usersData?.users?.filter(
      (u) => u.id !== user?.id && !u.companies?.some((c) => c.ownerId === u.id),
    ) || [];

  // Obter usuários selecionados baseado nos IDs
  const selectedUsers = availableUsers.filter((u) =>
    watchedUserIds.includes(u.id),
  );

  const handleAssignSubordinates = handleSubmit(
    async (data: UserSubordinatesFormDto) => {
      if (!user?.id) return;

      await mutation.mutateAsync({
        userId: user.id,
        data,
      });

      toast.success('Subordinados adicionados com sucesso');
      handleClose();
    },
  );

  const handleClose = () => {
    onClose();
    reset();
  };

  useEffect(() => {
    setValue('targetIds', currentSubordinates?.targetIds || []);
  }, [currentSubordinates, setValue]);

  return {
    control,
    handleAssignSubordinates,
    loading: mutation.isPending,
    handleClose,
    open,
    availableUsers,
    selectedUsers,
  };
};

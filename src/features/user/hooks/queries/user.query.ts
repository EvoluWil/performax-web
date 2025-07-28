import { UserFormDto } from '@/features/user/schemas';
import { userService } from '@/features/user/services';
import { User } from '@/types/user';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

type UserMutationInput = {
  type: 'create' | 'update' | 'delete';
  id?: string;
  data?: UserFormDto;
};

export function useUsersQuery() {
  return useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const users = await userService.get();
      return users;
    },
    initialData: { data: [], count: 0 },
    refetchOnWindowFocus: false,
  });
}

export const useUserMutation = () => {
  const queryUser = useQueryClient();

  const mutationFn = async (input: UserMutationInput): Promise<User> => {
    switch (input.type) {
      case 'create':
        return userService.create(input?.data as UserFormDto);
      case 'update':
        return userService.update(
          input?.id as string,
          input?.data as UserFormDto,
        );
      case 'delete':
        return userService.delete(input?.id as string);
    }
  };

  return useMutation<User, Error, UserMutationInput>({
    mutationFn,
    onSuccess: () => {
      queryUser.invalidateQueries({ queryKey: ['users'] });
    },
  });
};

import { RoleFormDto } from '@/features/role/schemas';
import { roleService } from '@/features/role/services';
import { Role } from '@/features/role/types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

type RoleMutationInput = {
  type: 'create' | 'update' | 'delete';
  id?: string;
  data?: RoleFormDto;
};

export function useRolesQuery() {
  return useQuery({
    queryKey: ['roles'],
    queryFn: async () => {
      const roles = await roleService.get();
      return roles;
    },
    initialData: [],
    refetchOnWindowFocus: false,
  });
}

export const useRoleMutation = () => {
  const queryClient = useQueryClient();

  const mutationFn = async (input: RoleMutationInput): Promise<Role> => {
    switch (input.type) {
      case 'create':
        return roleService.create(input?.data as RoleFormDto);
      case 'update':
        return roleService.update(
          input?.id as string,
          input?.data as RoleFormDto,
        );
      case 'delete':
        return roleService.delete(input?.id as string);
    }
  };

  return useMutation<Role, Error, RoleMutationInput>({
    mutationFn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
    },
  });
};

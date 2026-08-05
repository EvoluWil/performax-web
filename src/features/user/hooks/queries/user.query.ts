import { UserFormDto } from '@/features/user/schemas';
import { getUserQuery, userService } from '@/features/user/services';
import { useCompanyPermissions } from '@/hooks/common/permission';
import { User } from '@/types/user';
import { applyScopedFilter } from '@/utils/query';
import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import { useMemo } from 'react';

type UserMutationInput = {
  type: 'create' | 'update' | 'delete';
  id?: string;
  data?: UserFormDto;
};

type UsersQueryOptions = {
  scopeModule?: string;
  pageSize?: number;
  enabled?: boolean;
};

export function useUsersQuery(options: UsersQueryOptions = {}) {
  const {
    scopeModule = 'user',
    pageSize = getUserQuery.limit ?? 30,
    enabled: enabledOption = true,
  } = options;
  const { getScopedUserIds, userId, hasFilterAccess, isReady } =
    useCompanyPermissions();

  const scopedUserIds = useMemo(
    () => getScopedUserIds(scopeModule),
    [getScopedUserIds, scopeModule],
  );

  const baseScopedQuery = useMemo(() => {
    const baseQuery = {
      ...getUserQuery,
      filter: getUserQuery.filter ? [...getUserQuery.filter] : [],
      limit: pageSize,
    };

    return applyScopedFilter(baseQuery, scopedUserIds, userId, {
      field: 'id',
      operator: 'in',
    });
  }, [scopedUserIds, userId, pageSize]);

  const enabled =
    enabledOption && isReady && hasFilterAccess(scopeModule) && baseScopedQuery !== null;

  const query = useInfiniteQuery({
    queryKey: ['users', scopeModule, baseScopedQuery ?? 'no-access'],
    queryFn: async ({ pageParam = 1 }) => {
      if (!baseScopedQuery) {
        return { data: [], count: 0 };
      }
      return userService.get({ ...baseScopedQuery, page: pageParam });
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage, pages) => {
      const fetched = pages.length * pageSize;
      return fetched < lastPage.count ? pages.length + 1 : undefined;
    },
    enabled,
    refetchOnWindowFocus: false,
    select: (data) => {
      const users = data.pages.flatMap((p) => p.data);
      const total = data.pages[0]?.count ?? 0;
      return { ...data, users, count: total };
    },
  });

  return query;
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

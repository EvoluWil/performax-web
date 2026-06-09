import { ClientFormDto } from '@/features/client/schemas';
import { clientService } from '@/features/client/services';
import { getClientQuery } from '@/features/client/services/client.service';
import { Client } from '@/features/client/types';
import { useCompanyPermissions } from '@/hooks/common/permission';
import { applyScopedFilter } from '@/utils/query';
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { useMemo } from 'react';

type ClientMutationInput = {
  type: 'create' | 'update' | 'delete';
  id?: string;
  data?: ClientFormDto;
};

type ClientsQueryOptions = {
  scopeModule?: string;
  pageSize?: number;
};

export function useClientsQuery(options: ClientsQueryOptions = {}) {
  const { scopeModule = 'client', pageSize = getClientQuery.limit ?? 30 } =
    options;
  const { getScopedUserIds, userId } = useCompanyPermissions();

  const scopedUserIds = useMemo(
    () => getScopedUserIds(scopeModule),
    [getScopedUserIds, scopeModule],
  );

  const baseScopedQuery = useMemo(() => {
    const baseQuery = {
      ...getClientQuery,
      filter: getClientQuery.filter ? [...getClientQuery.filter] : [],
      limit: pageSize,
    };

    return applyScopedFilter(baseQuery, scopedUserIds, userId, {
      field: 'userIds',
      operator: 'hasSome',
    });
  }, [scopedUserIds, userId, pageSize]);

  const enabled = baseScopedQuery !== null;

  const query = useInfiniteQuery({
    queryKey: ['clients', scopeModule, baseScopedQuery ?? 'no-access'],
    queryFn: async ({ pageParam = 1 }) => {
      if (!baseScopedQuery) {
        return { data: [], count: 0 };
      }

      return clientService.get({
        ...baseScopedQuery,
        page: pageParam,
      });
    },

    initialPageParam: 1,

    getNextPageParam: (lastPage, pages) => {
      const fetched = pages.length * pageSize;
      return fetched < lastPage.count ? pages.length + 1 : undefined;
    },

    enabled,
    refetchOnWindowFocus: false,

    select: (data) => {
      const clients = data.pages.flatMap((p) => p.data);
      const total = data.pages[0]?.count ?? 0;

      return {
        ...data,
        clients,
        count: total,
        loadedCount: clients.length,
      };
    },
  });

  return query;
}

export const useClientMutation = () => {
  const queryClient = useQueryClient();

  const mutationFn = async (input: ClientMutationInput): Promise<Client> => {
    switch (input.type) {
      case 'create':
        return clientService.create(input.data as ClientFormDto);

      case 'update':
        return clientService.update(
          input.id as string,
          input.data as ClientFormDto,
        );

      case 'delete':
        return clientService.delete(input.id as string);
    }
  };

  return useMutation<Client, Error, ClientMutationInput>({
    mutationFn,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['clients'],
      });
      queryClient.invalidateQueries({
        queryKey: ['client-detail'],
      });
    },
  });
};

export function useClientDetailQuery(clientId: string) {
  return useQuery({
    queryKey: ['client-detail', clientId],
    queryFn: () => clientService.getById(clientId),
    refetchOnWindowFocus: false,
    enabled: !!clientId,
  });
}

import { useCompanyPermissions } from '@/hooks/common/permission';
import { applyScopedFilter } from '@/utils/query';
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { useMemo } from 'react';
import { getOccurrenceQuery, occurrenceService } from '../../services';
import { CreateOccurrenceDto, Occurrence } from '../../types';

type OccurrencesQueryOptions = {
  pageSize?: number;
};

type OccurrenceMutationInput = {
  type: 'create' | 'update' | 'delete';
  id?: string;
  data?: Partial<CreateOccurrenceDto>;
};

export function useOccurrencesQuery(options: OccurrencesQueryOptions = {}) {
  const { pageSize = getOccurrenceQuery.limit ?? 30 } = options;
  const { getScopedUserIds, userId } = useCompanyPermissions();

  const scopedUserIds = useMemo(
    () => getScopedUserIds('occurrence'),
    [getScopedUserIds],
  );

  const baseScopedQuery = useMemo(() => {
    const baseQuery = {
      ...getOccurrenceQuery,
      filter: getOccurrenceQuery.filter ? [...getOccurrenceQuery.filter] : [],
      limit: pageSize,
    };

    return applyScopedFilter(baseQuery, scopedUserIds, userId, {
      field: 'createdById',
      operator: 'in',
    });
  }, [scopedUserIds, userId, pageSize]);

  const enabled = baseScopedQuery !== null;

  return useInfiniteQuery({
    queryKey: ['occurrences', baseScopedQuery ?? 'no-access'],
    queryFn: async ({ pageParam = 1 }) => {
      if (!baseScopedQuery) {
        return { data: [], count: 0 };
      }
      return occurrenceService.get({ ...baseScopedQuery, page: pageParam });
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage, pages) => {
      const fetched = pages.length * pageSize;
      return fetched < lastPage.count ? pages.length + 1 : undefined;
    },
    enabled,
    refetchOnWindowFocus: false,
    select: (data) => {
      const occurrences = data.pages.flatMap((p) => p.data);
      const total = data.pages[0]?.count ?? 0;
      return { ...data, occurrences, count: total };
    },
  });
}

export function useOccurrenceDetailQuery(occurrenceId: string) {
  return useQuery({
    queryKey: ['occurrence-detail', occurrenceId],
    queryFn: async () => occurrenceService.getById(occurrenceId),
    enabled: !!occurrenceId,
    refetchOnWindowFocus: false,
  });
}

export const useOccurrenceMutation = (occurrenceId?: string) => {
  const queryClient = useQueryClient();

  const mutationFn = async (
    input: OccurrenceMutationInput,
  ): Promise<Occurrence> => {
    switch (input.type) {
      case 'create':
        return occurrenceService.create(input.data as CreateOccurrenceDto);
      case 'update':
        return occurrenceService.update(input.id as string, input.data as any);
      case 'delete':
        return occurrenceService.delete(input.id as string);
    }
  };

  const queryKey: (string | undefined)[] = [
    'occurrences',
    'occurrence-detail',
    occurrenceId,
  ];

  return useMutation<Occurrence, Error, OccurrenceMutationInput>({
    mutationFn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['occurrences'] });
      queryClient.invalidateQueries({
        queryKey: queryKey.filter(Boolean) as string[],
      });
    },
  });
};

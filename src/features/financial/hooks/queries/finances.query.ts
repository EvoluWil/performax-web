import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { Query } from 'nestjs-prisma-querybuilder-interface';
import type { FinanceFormDto } from '../../schemas/finance-drawer.schema';
import {
  financeService,
  getFinanceQuery,
} from '../../services/finance.service';
import type {
  CreateTransferDto,
  Finance,
  FinanceStatusEnum,
} from '../../types/finance';

type FinanceMutationInput = {
  type: 'create' | 'update' | 'delete';
  id?: string;
  data?: Partial<FinanceFormDto>;
};

export function useFinancesQuery(params?: Query) {
  const pageSize = params?.limit ?? getFinanceQuery.limit ?? 30;

  return useInfiniteQuery({
    queryKey: ['finances', params ?? getFinanceQuery],
    queryFn: async ({ pageParam = 1 }) => {
      return financeService.get({
        ...(params ?? getFinanceQuery),
        page: pageParam,
      });
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage, pages) => {
      const fetched = pages.length * pageSize;
      return fetched < lastPage.count ? pages.length + 1 : undefined;
    },
    refetchOnWindowFocus: false,
    select: (data) => {
      const finances = data.pages.flatMap((p) => p.data);
      const total = data.pages[0]?.count ?? 0;
      return { ...data, finances, count: total };
    },
  });
}

export function useFinanceDetailQuery(financeId: string) {
  return useQuery({
    queryKey: ['finance-detail', financeId],
    queryFn: async () => financeService.getById(financeId),
    enabled: !!financeId,
    refetchOnWindowFocus: false,
  });
}

export const useFinanceMutation = (financeId?: string) => {
  const queryClient = useQueryClient();

  const mutationFn = async (input: FinanceMutationInput): Promise<Finance> => {
    switch (input.type) {
      case 'create':
        return financeService.create(input?.data as any);
      case 'update':
        return financeService.update(input?.id as string, input?.data as any);
      case 'delete':
        return financeService.delete(input?.id as string);
    }
  };

  return useMutation<Finance, Error, FinanceMutationInput>({
    mutationFn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['finances'] });
      if (financeId) {
        queryClient.invalidateQueries({
          queryKey: ['finance-detail', financeId],
        });
      }
    },
  });
};

export const useFinanceApprovalMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<Finance, Error, { id: string; approved: boolean }>({
    mutationFn: ({ id, approved }) => financeService.approve(id, approved),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['finances'] });
    },
  });
};

export const useFinanceStatusMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<Finance, Error, { id: string; status: FinanceStatusEnum }>(
    {
      mutationFn: ({ id, status }) =>
        financeService.update(id, { status } as any),
      onSuccess: (_, vars) => {
        queryClient.invalidateQueries({ queryKey: ['finances'] });
        queryClient.invalidateQueries({
          queryKey: ['finance-detail', vars.id],
        });
      },
    },
  );
};

export const useFinanceTransferMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<Finance[], Error, CreateTransferDto>({
    mutationFn: (dto) => financeService.transfer(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['finances'] });
    },
  });
};

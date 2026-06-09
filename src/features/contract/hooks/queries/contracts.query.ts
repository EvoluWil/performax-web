import { CreateContractDto, GenerateContractRecurringDto } from '@/features/contract/types';
import {
  contractService,
  getContractQuery,
} from '@/features/contract/services/contract.service';
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

type ContractMutationInput = {
  type: 'create' | 'update' | 'delete' | 'inactivate' | 'activate';
  id?: string;
  data?: CreateContractDto;
};

type ContractsQueryOptions = {
  pageSize?: number;
  clientId?: string;
  enabled?: boolean;
};

export function useContractsQuery(options: ContractsQueryOptions = {}) {
  const { pageSize = getContractQuery.limit ?? 30, clientId, enabled = true } =
    options;

  const baseQuery = {
    ...getContractQuery,
    filter: getContractQuery.filter ? [...getContractQuery.filter] : [],
    limit: pageSize,
  };

  if (clientId) {
    baseQuery.filter.push({
      path: 'clientId',
      value: clientId,
      filterGroup: 'and',
    });
  }

  const query = useInfiniteQuery({
    queryKey: ['contracts', baseQuery],
    queryFn: async ({ pageParam = 1 }) => {
      return contractService.get({
        ...baseQuery,
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
      const contracts = data.pages.flatMap((p) => p.data);
      const total = data.pages[0]?.count ?? 0;

      return {
        ...data,
        contracts,
        count: total,
        loadedCount: contracts.length,
      };
    },
  });

  return query;
}

export function useContractDetailQuery(contractId: string) {
  return useQuery({
    queryKey: ['contract-detail', contractId],
    queryFn: () => contractService.getById(contractId),
    refetchOnWindowFocus: false,
    enabled: !!contractId,
  });
}

export const useContractMutation = (contractId?: string) => {
  const queryClient = useQueryClient();

  const mutationFn = async (input: ContractMutationInput): Promise<unknown> => {
    switch (input.type) {
      case 'create':
        return contractService.create(input.data as CreateContractDto);
      case 'update':
        return contractService.update(
          input.id as string,
          input.data as CreateContractDto,
        );
      case 'delete':
        return contractService.delete(input.id as string);
      case 'inactivate':
        return contractService.inactivate(input.id as string);
      case 'activate':
        return contractService.activate(input.id as string);
    }
  };

  return useMutation({
    mutationFn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contracts'] });
      if (contractId) {
        queryClient.invalidateQueries({
          queryKey: ['contract-detail', contractId],
        });
      }
      queryClient.invalidateQueries({ queryKey: ['client-detail'] });
      queryClient.invalidateQueries({ queryKey: ['financeRecurrings'] });
    },
  });
};

export const useGenerateContractRecurring = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      contractId,
      data,
    }: {
      contractId: string;
      data: GenerateContractRecurringDto;
    }) => contractService.generateRecurring(contractId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contracts'] });
      queryClient.invalidateQueries({ queryKey: ['client-detail'] });
      queryClient.invalidateQueries({ queryKey: ['financeRecurrings'] });
      queryClient.invalidateQueries({ queryKey: ['finances'] });
    },
  });
};

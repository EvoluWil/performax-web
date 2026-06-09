import { contractTypeService } from '@/features/contract/services/contract-type.service';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { companyService } from '@/services/company.service';
import { ContractTypeFormDto } from '../../schemas/contract-type.schema';
import { ContractType } from '../../types/contract-type';

type ContractTypeMutationInput = {
  type: 'create' | 'update' | 'delete' | 'adjustment';
  id?: string;
  data?: ContractTypeFormDto;
  percentage?: number;
};

export function useContractTypesQuery(companyId?: string) {
  const defaultCompanyId = companyService.getDefaultCompany()?.id;
  const effectiveId = companyId || defaultCompanyId;

  return useQuery({
    queryKey: ['contractTypes', effectiveId ?? 'default'],
    queryFn: async () => {
      if (companyId && companyId !== defaultCompanyId) {
        const original = companyService.getDefaultCompany();
        companyService.setDefaultCompany({ id: companyId } as any);
        try {
          return await contractTypeService.get();
        } finally {
          if (original) companyService.setDefaultCompany(original);
        }
      }
      return contractTypeService.get();
    },
    initialData: [],
    refetchOnWindowFocus: false,
  });
}

export const useContractTypeMutation = () => {
  const queryClient = useQueryClient();

  const mutationFn = async (
    input: ContractTypeMutationInput,
  ): Promise<ContractType> => {
    switch (input.type) {
      case 'create':
        return contractTypeService.create(input.data as ContractTypeFormDto);
      case 'update':
        return contractTypeService.update(
          input.id as string,
          input.data as ContractTypeFormDto,
        );
      case 'delete':
        return contractTypeService.delete(input.id as string);
      case 'adjustment':
        return contractTypeService.applyAdjustment(
          input.id as string,
          input.percentage as number,
        );
    }
  };

  return useMutation<ContractType, Error, ContractTypeMutationInput>({
    mutationFn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contractTypes'] });
      queryClient.invalidateQueries({ queryKey: ['contracts'] });
      queryClient.invalidateQueries({ queryKey: ['client-detail'] });
    },
  });
};

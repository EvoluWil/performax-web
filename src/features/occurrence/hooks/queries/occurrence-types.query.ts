import { OccurrenceTypeFormDto } from '@/features/occurrence/schemas';
import { occurrenceTypeService } from '@/features/occurrence/services';
import { OccurrenceType } from '@/features/occurrence/types';
import { companyService } from '@/services/company.service';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

type OccurrenceTypeMutationInput = {
  type: 'create' | 'update' | 'delete';
  id?: string;
  data?: OccurrenceTypeFormDto;
};

export function useOccurrenceTypesQuery(companyId?: string) {
  const defaultCompanyId = companyService.getDefaultCompany()?.id;
  const effectiveId = companyId || defaultCompanyId;

  return useQuery({
    queryKey: ['occurrenceTypes', effectiveId ?? 'default'],
    queryFn: async () => {
      if (companyId && companyId !== defaultCompanyId) {
        const original = companyService.getDefaultCompany();
        companyService.setDefaultCompany({ id: companyId } as any);
        try {
          return await occurrenceTypeService.get();
        } finally {
          if (original) companyService.setDefaultCompany(original);
        }
      }
      const types = await occurrenceTypeService.get();
      return types;
    },
    initialData: [],
    refetchOnWindowFocus: false,
  });
}

export const useOccurrenceTypeMutation = () => {
  const queryClient = useQueryClient();

  const mutationFn = async (
    input: OccurrenceTypeMutationInput,
  ): Promise<OccurrenceType> => {
    switch (input.type) {
      case 'create':
        return occurrenceTypeService.create(
          input?.data as OccurrenceTypeFormDto,
        );
      case 'update':
        return occurrenceTypeService.update(
          input?.id as string,
          input?.data as OccurrenceTypeFormDto,
        );
      case 'delete':
        return occurrenceTypeService.delete(input?.id as string);
    }
  };

  return useMutation<OccurrenceType, Error, OccurrenceTypeMutationInput>({
    mutationFn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['occurrenceTypes'] });
    },
  });
};

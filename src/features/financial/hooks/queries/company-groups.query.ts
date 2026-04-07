import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { CompanyGroupFormDto } from '../../schemas/company-group.schema';
import { companyGroupService } from '../../services/company-group.service';
import type { CompanyGroup } from '../../types/company-group';

type CompanyGroupMutationInput = {
  type: 'create' | 'update' | 'delete';
  id?: string;
  data?: CompanyGroupFormDto;
};

export function useCompanyGroupsQuery() {
  return useQuery({
    queryKey: ['companyGroups'],
    queryFn: () => companyGroupService.getAll(),
    initialData: [],
    refetchOnWindowFocus: false,
  });
}

export function useCompanyGroupCompaniesQuery(groupId: string) {
  return useQuery({
    queryKey: ['companyGroupCompanies', groupId],
    queryFn: () => companyGroupService.getCompanies(groupId),
    enabled: !!groupId,
    initialData: [],
    refetchOnWindowFocus: false,
  });
}

export const useCompanyGroupMutation = () => {
  const queryClient = useQueryClient();

  const mutationFn = async (
    input: CompanyGroupMutationInput,
  ): Promise<CompanyGroup> => {
    switch (input.type) {
      case 'create':
        return companyGroupService.create(input.data as CompanyGroupFormDto);
      case 'update':
        return companyGroupService.update(
          input.id as string,
          input.data as CompanyGroupFormDto,
        );
      case 'delete':
        return companyGroupService.delete(input.id as string);
    }
  };

  return useMutation<CompanyGroup, Error, CompanyGroupMutationInput>({
    mutationFn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companyGroups'] });
    },
  });
};

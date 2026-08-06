import { CompanyModule } from '@/types/company';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  CreateCompanyDto,
  customizationService,
  UpdateCompanySettingsDto,
  UpsertWhiteLabelDto,
} from '../../services/customization.service';
import { fiscalConfigService } from '../../services/fiscal-config.service';
import { UpsertFiscalConfigDto } from '../../types/fiscal-config';

export function useWhiteLabelQuery() {
  return useQuery({
    queryKey: ['whiteLabel'],
    queryFn: () => customizationService.getWhiteLabel(),
    refetchOnWindowFocus: false,
  });
}

export function useWhiteLabelMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: UpsertWhiteLabelDto) =>
      customizationService.upsertWhiteLabel(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['whiteLabel'] });
    },
  });
}

export function useCompanySettingsMutation() {
  return useMutation({
    mutationFn: (dto: UpdateCompanySettingsDto) =>
      customizationService.updateCompany(dto),
  });
}

export function useOwnedCompaniesQuery() {
  return useQuery({
    queryKey: ['ownedCompanies'],
    queryFn: () => customizationService.getOwnedCompanies(),
    initialData: [],
    refetchOnWindowFocus: false,
  });
}

export function useCreateCompanyMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: CreateCompanyDto) =>
      customizationService.createCompany(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ownedCompanies'] });
    },
  });
}

export function useLinkCompanyMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      companyId,
      targetCompanyId,
    }: {
      companyId: string;
      targetCompanyId: string;
    }) => customizationService.linkCompany(companyId, targetCompanyId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ownedCompanies'] });
    },
  });
}

export function useUnlinkCompanyMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      companyId,
      targetCompanyId,
    }: {
      companyId: string;
      targetCompanyId: string;
    }) => customizationService.unlinkCompany(companyId, targetCompanyId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ownedCompanies'] });
    },
  });
}

export function useAllModulesQuery() {
  return useQuery({
    queryKey: ['allModules'],
    queryFn: () => customizationService.getAllModules(),
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000,
  });
}

export function useCompanyModulesQuery() {
  return useQuery({
    queryKey: ['customization-company-modules'],
    queryFn: () => customizationService.getCompanyModules(),
    refetchOnWindowFocus: false,
  });
}

export function useToggleModuleMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      moduleId,
      enabled,
    }: {
      moduleId: string;
      enabled: boolean;
    }) =>
      enabled
        ? customizationService.enableModule(moduleId)
        : customizationService
            .disableModule(moduleId)
            .then(() => null as unknown as CompanyModule),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['customization-company-modules'],
      });
      queryClient.invalidateQueries({ queryKey: ['company-modules'] });
    },
  });
}

export function useFiscalConfigQuery() {
  return useQuery({
    queryKey: ['fiscalConfig'],
    queryFn: () => fiscalConfigService.get(),
    refetchOnWindowFocus: false,
  });
}

export function useFiscalConfigStatusQuery() {
  return useQuery({
    queryKey: ['fiscalConfigStatus'],
    queryFn: () => fiscalConfigService.getStatus(),
    refetchOnWindowFocus: false,
  });
}

export function useFiscalConfigMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: UpsertFiscalConfigDto) => fiscalConfigService.upsert(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fiscalConfig'] });
      queryClient.invalidateQueries({ queryKey: ['fiscalConfigStatus'] });
    },
  });
}

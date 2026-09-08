'use client';

import { useCompanyModules } from '@/hooks/common/module';
import { useUpload } from '@/hooks/common/upload';
import { useWhiteLabel } from '@/providers/white-label';
import { companyService } from '@/services/company.service';
import { DEFAULT_WHITE_LABEL } from '@/utils/white-label.utils';
import { yupResolver } from '@hookform/resolvers/yup';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import {
  useAllModulesQuery,
  useCompanyModulesQuery,
  useCompanySettingsMutation,
  useCreateCompanyMutation,
  useLinkCompanyMutation,
  useOwnedCompaniesQuery,
  useToggleModuleMutation,
  useUnlinkCompanyMutation,
  useWhiteLabelMutation,
  useWhiteLabelQuery,
} from '../../hooks/queries/customization.query';
import {
  CustomizationFormDto,
  customizationFormInitialValues,
  customizationFormSchema,
} from '../../schemas/customization.schema';

export const useCustomizationSettings = () => {
  const [resetLogoContrast, setResetLogoContrast] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [faviconFile, setFaviconFile] = useState<File | null>(null);
  const [logoPreviewUrl, setLogoPreviewUrl] = useState<string | null>(null);
  const [bannerPreviewUrl, setBannerPreviewUrl] = useState<string | null>(null);
  const [faviconPreviewUrl, setFaviconPreviewUrl] = useState<string | null>(
    null,
  );
  const [loading, setLoading] = useState(false);
  const [openCreateCompany, setOpenCreateCompany] = useState(false);
  const [newCompanyName, setNewCompanyName] = useState('');
  const [createLoading, setCreateLoading] = useState(false);

  const { sendFile } = useUpload();
  const { setWhiteLabel } = useWhiteLabel();
  const { hasModule } = useCompanyModules();

  const company = companyService.getDefaultCompany();
  const { data: whiteLabel } = useWhiteLabelQuery();
  const { data: ownedCompanies = [] } = useOwnedCompaniesQuery();
  const createCompanyMutation = useCreateCompanyMutation();
  const linkMutation = useLinkCompanyMutation();
  const unlinkMutation = useUnlinkCompanyMutation();
  const { data: allModules = [] } = useAllModulesQuery();
  const { data: companyModules = [] } = useCompanyModulesQuery();
  const toggleModuleMutation = useToggleModuleMutation();

  const whiteLabelMutation = useWhiteLabelMutation();
  const companyMutation = useCompanySettingsMutation();

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<CustomizationFormDto>({
    defaultValues: customizationFormInitialValues,
    resolver: yupResolver(customizationFormSchema) as any,
  });

  useEffect(() => {
    if (!logoFile) {
      setLogoPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(logoFile);
    setLogoPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [logoFile]);

  useEffect(() => {
    if (!bannerFile) {
      setBannerPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(bannerFile);
    setBannerPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [bannerFile]);

  useEffect(() => {
    if (!faviconFile) {
      setFaviconPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(faviconFile);
    setFaviconPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [faviconFile]);

  useEffect(() => {
    const c = companyService.getDefaultCompany();
    if (c) {
      reset({
        companyName: c.name ?? '',
        wlName: whiteLabel?.name ?? '',
        logo: whiteLabel?.logo ?? '',
        banner: whiteLabel?.banner ?? '',
        favicon: whiteLabel?.favicon ?? '',
        primaryColor:
          whiteLabel?.primaryColor || DEFAULT_WHITE_LABEL.primaryColor,
        secondaryColor:
          whiteLabel?.secondaryColor || DEFAULT_WHITE_LABEL.secondaryColor,
      });
    }
  }, [whiteLabel, reset]);

  // Derive the current company's latest groupId from the owned list (updated after link ops)
  const currentCompanyId = company?.id ?? '';
  const currentCompanyGroupId = ownedCompanies.find(
    (c) => c.id === currentCompanyId,
  )?.groupId;

  const handleSave = handleSubmit(async (values: CustomizationFormDto) => {
    setLoading(true);
    try {
        let logoUrl = values.logo;
        let bannerUrl = values.banner;
        let faviconUrl = values.favicon;

        if (logoFile) {
          const result = await sendFile(
            logoFile,
            `white-label/${company?.id}/logo`,
          );
          if (result?.url) logoUrl = result.url;
        }

        if (bannerFile) {
          const result = await sendFile(
            bannerFile,
            `white-label/${company?.id}/banner`,
          );
          if (result?.url) bannerUrl = result.url;
        }

        if (faviconFile) {
          const result = await sendFile(
            faviconFile,
            `white-label/${company?.id}/favicon`,
          );
          if (result?.url) faviconUrl = result.url;
        }

        await companyMutation.mutateAsync({ name: values.companyName });

        const updatedWhiteLabel = await whiteLabelMutation.mutateAsync({
          name: values.wlName,
          logo: logoUrl,
          logoContrast: logoFile
            ? undefined
            : resetLogoContrast
              ? DEFAULT_WHITE_LABEL.logoContrast
              : undefined,
          banner: bannerUrl,
          favicon: faviconUrl,
          primaryColor: values.primaryColor,
          secondaryColor: values.secondaryColor,
        });

        setWhiteLabel(updatedWhiteLabel);

        if (company) {
          companyService.setDefaultCompany({
            ...company,
            name: values.companyName,
            whiteLabel: updatedWhiteLabel,
          });
        }

        const previousFavicon = whiteLabel?.favicon ?? '';
        const faviconChanged = !!faviconFile || faviconUrl !== previousFavicon;
        setLogoFile(null);
        setBannerFile(null);
        setFaviconFile(null);
        setResetLogoContrast(false);
        toast.success('Configurações salvas com sucesso');
        if (faviconChanged) {
          setTimeout(() => window.location.reload(), 1000);
        }
      } catch {
        toast.error('Erro ao salvar configurações');
      } finally {
        setLoading(false);
      }
  });

  const handleResetWhiteLabelField = (
    field:
      | 'wlName'
      | 'logo'
      | 'banner'
      | 'favicon'
      | 'primaryColor'
      | 'secondaryColor',
  ) => {
    if (field === 'wlName') {
      setValue('wlName', DEFAULT_WHITE_LABEL.name, { shouldDirty: true });
      return;
    }
    if (field === 'logo') {
      setLogoFile(null);
      setResetLogoContrast(true);
      setValue('logo', DEFAULT_WHITE_LABEL.logo, { shouldDirty: true });
      return;
    }
    if (field === 'banner') {
      setBannerFile(null);
      setValue('banner', DEFAULT_WHITE_LABEL.banner, { shouldDirty: true });
      return;
    }
    if (field === 'favicon') {
      setFaviconFile(null);
      setValue('favicon', DEFAULT_WHITE_LABEL.favicon, { shouldDirty: true });
      return;
    }
    if (field === 'primaryColor') {
      setValue('primaryColor', DEFAULT_WHITE_LABEL.primaryColor, {
        shouldDirty: true,
      });
      return;
    }
    setValue('secondaryColor', DEFAULT_WHITE_LABEL.secondaryColor, {
      shouldDirty: true,
    });
  };

  const handleLogoChange = (file: File) => {
    setResetLogoContrast(false);
    setLogoFile(file);
  };

  const handleCreateCompany = async () => {
    if (!newCompanyName.trim()) return;
    setCreateLoading(true);
    try {
      await createCompanyMutation.mutateAsync({ name: newCompanyName.trim() });
      toast.success('Empresa criada com sucesso');
      setNewCompanyName('');
      setOpenCreateCompany(false);
    } catch {
      toast.error('Erro ao criar empresa');
    } finally {
      setCreateLoading(false);
    }
  };

  const handleLinkCompany = async (targetCompanyId: string) => {
    if (!currentCompanyId) return;
    try {
      await linkMutation.mutateAsync({
        companyId: currentCompanyId,
        targetCompanyId,
      });
      toast.success('Empresa vinculada com sucesso');
    } catch {
      toast.error('Erro ao vincular empresa');
    }
  };

  const handleUnlinkCompany = async (targetCompanyId: string) => {
    if (!currentCompanyId) return;
    try {
      await unlinkMutation.mutateAsync({
        companyId: currentCompanyId,
        targetCompanyId,
      });
      toast.success('Empresa desvinculada com sucesso');
    } catch {
      toast.error('Erro ao desvincular empresa');
    }
  };

  const enabledModuleIds = new Set(companyModules.map((cm) => cm.moduleId));

  const handleToggleModule = async (moduleId: string) => {
    const enabled = !enabledModuleIds.has(moduleId);
    try {
      await toggleModuleMutation.mutateAsync({ moduleId, enabled });
    } catch {
      toast.error(
        enabled ? 'Erro ao ativar módulo' : 'Erro ao desativar módulo',
      );
    }
  };

  return {
    control,
    handleSave,
    loading,
    errors,
    setValue,
    logoFile,
    setLogoFile: handleLogoChange,
    bannerFile,
    setBannerFile,
    faviconFile,
    setFaviconFile,
    logoPreviewUrl,
    bannerPreviewUrl,
    faviconPreviewUrl,
    whiteLabel,
    ownedCompanies,
    currentCompanyId,
    currentCompanyGroupId,
    openCreateCompany,
    setOpenCreateCompany,
    newCompanyName,
    setNewCompanyName,
    createLoading,
    handleCreateCompany,
    handleLinkCompany,
    handleUnlinkCompany,
    linkLoading: linkMutation.isPending,
    unlinkLoading: unlinkMutation.isPending,
    allModules,
    enabledModuleIds,
    handleToggleModule,
    toggleModuleLoading: toggleModuleMutation.isPending,
    hasWhiteLabelModule: hasModule('whitelabel'),
    hasFiscalModule: hasModule('fiscal'),
    handleResetWhiteLabelField,
  };
};

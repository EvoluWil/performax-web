'use client';

import { useUserCompaniesQuery } from '@/hooks/queries/user-companies.query';
import { companyService } from '@/services/company.service';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { SelectCompanyModalProps } from './select-company.modal';
import {
  SelectCompanyFormDto,
  selectCompanyFormInitialValues,
} from './select-company.schema';

export const useSelectCompany = ({
  onSuccess = () => null,
  open,
  onClose,
}: SelectCompanyModalProps) => {
  const { control, handleSubmit, setValue } = useForm<SelectCompanyFormDto>({
    defaultValues: selectCompanyFormInitialValues,
  });
  const { data: companies, isLoading } = useUserCompaniesQuery();

  const handleSelectCompany = () => {
    handleSubmit((data: SelectCompanyFormDto) => {
      const company = companies.find((c) => c.id === data.companyId);
      if (!company) {
        return toast.error('Empresa não encontrada!');
      }

      companyService.setDefaultCompany(company);
      onSuccess();
      onClose();
      toast.success('Empresa selecionada com sucesso!');
    })();
  };

  const handleClose = () => {
    onClose();
    setValue('companyId', '');
  };

  useEffect(() => {
    if (open) {
      const company = companyService.getDefaultCompany();
      if (!!company && companies?.some((c) => c.id === company.id)) {
        setValue('companyId', company.id);
      } else {
        setValue('companyId', '');
      }
    }
  }, [companies, open, setValue]);

  return {
    control,
    handleSelectCompany,
    handleClose,
    companies,
    open,
    isLoading,
  };
};

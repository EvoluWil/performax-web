import { CONTRACT_FILTER_FIELDS } from '@/constants/filter-permissions';
import { useFilterFieldAccess } from '@/hooks/common/use-filter-field-access';
import { useFormResources } from '@/hooks/use-form-resources';
import { ResourceKey } from '@/services/form-resources.service';
import { yupResolver } from '@hookform/resolvers/yup';
import { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import {
  ContractFilterDto,
  contractFilterInitialValues,
  contractFilterSchema,
} from '../../schemas/contract.schema';

export const useContractFilter = (
  onFilter: (data: ContractFilterDto) => void,
  values?: ContractFilterDto,
) => {
  const fieldAccess = useFilterFieldAccess(CONTRACT_FILTER_FIELDS);

  const resources = useMemo(() => {
    const keys: ResourceKey[] = [];
    if (fieldAccess.clientIds) keys.push('clients');
    if (fieldAccess.typeIds) keys.push('contractTypes');
    return keys;
  }, [fieldAccess]);

  const { options, setSearch, isLoading } = useFormResources(resources);

  const { control, handleSubmit, reset } = useForm<ContractFilterDto>({
    defaultValues: values ?? contractFilterInitialValues,
    resolver: yupResolver(contractFilterSchema) as any,
  });

  useEffect(() => {
    if (values) {
      reset(values);
    }
  }, [values, reset]);

  const handleFilter = handleSubmit((data) => onFilter(data));

  return { control, handleFilter, options, setSearch, isLoading, fieldAccess };
};

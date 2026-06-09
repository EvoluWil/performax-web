import { useClientsQuery } from '@/features/client/hooks';
import { useContractTypesQuery } from '@/features/contract/hooks/queries/contract-types.query';
import { yupResolver } from '@hookform/resolvers/yup';
import { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import {
  ContractFilterDto,
  contractFilterInitialValues,
  contractFilterSchema,
} from '../../schemas/contract.schema';

export const useContractFilter = (onFilter: (data: ContractFilterDto) => void) => {
  const { data: clientsData } = useClientsQuery({ scopeModule: 'client' });
  const { data: contractTypes } = useContractTypesQuery();

  const { control, handleSubmit } = useForm<ContractFilterDto>({
    defaultValues: contractFilterInitialValues,
    resolver: yupResolver(contractFilterSchema) as any,
  });

  const options = useMemo(
    () => ({
      clients: (clientsData?.clients ?? []).map((c) => ({
        value: c.id,
        label: c.name,
      })),
      types: (contractTypes ?? []).map((t) => ({
        value: t.id,
        label: t.name,
      })),
    }),
    [clientsData, contractTypes],
  );

  const handleFilter = handleSubmit((data) => onFilter(data));

  return { control, handleFilter, options };
};

import { useContractPdf } from '@/features/contract/hooks/use-contract-pdf';
import { contractService } from '@/features/contract/services/contract.service';
import { useFormResources } from '@/hooks/use-form-resources';
import { yupResolver } from '@hookform/resolvers/yup';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { useContractMutation } from '../../hooks/queries/contracts.query';
import { useContractTypesQuery } from '../../hooks/queries/contract-types.query';
import {
  ContractFormDto,
  contractFormInitialValues,
  contractFormSchema,
  contractFormToPayload,
} from '../../schemas/contract.schema';
import { Contract } from '../../types/contract';
import { ContractDrawerProps } from './contract';

export const useContractDrawer = ({
  onClose,
  open,
  contract: selectedContract,
  defaultClientId,
  onSuccess,
  onSaved,
}: ContractDrawerProps) => {
  const contract = selectedContract || null;
  const [loading, setLoading] = useState(false);
  const { generateAndSaveContractPdf, generating: generatingPdf } =
    useContractPdf();
  const contractMutation = useContractMutation(contract?.id);
  const { data: contractTypes } = useContractTypesQuery();
  const { options, setSearch } = useFormResources(['clients']);

  const { control, handleSubmit, reset, watch } = useForm<ContractFormDto>({
    defaultValues: contractFormInitialValues,
    resolver: yupResolver(contractFormSchema) as any,
  });

  const typeId = watch('typeId');
  const selectedType = contractTypes?.find((t) => t.id === typeId);

  const handleContract = handleSubmit(async (data: ContractFormDto) => {
    setLoading(true);
    try {
      const payload = contractFormToPayload(data);

      const saved = (await contractMutation.mutateAsync({
        type: contract ? 'update' : 'create',
        id: contract?.id,
        data: payload,
      })) as Contract;

      const fullContract = await contractService.getById(saved.id);
      await generateAndSaveContractPdf(fullContract);

      toast.success(
        contract
          ? 'Contrato atualizado e PDF gerado com sucesso'
          : 'Contrato criado e PDF gerado com sucesso',
      );

      onSaved?.(fullContract);
      onSuccess?.();
      handleClose();
      onClose();
    } finally {
      setLoading(false);
    }
  });

  const handleClose = () => {
    onClose();
    reset();
  };

  useEffect(() => {
    if (contract) {
      reset({
        clientId: contract.clientId,
        typeId: contract.typeId,
        value: (contract.value ?? 0) / 100,
        startDate: contract.startDate
          ? String(contract.startDate).slice(0, 10)
          : '',
        endDate: contract.endDate ? String(contract.endDate).slice(0, 10) : '',
        dueDate: contract.dueDate ? String(contract.dueDate).slice(0, 10) : '',
        scope: contract.scope || '',
      });
    } else {
      reset({
        ...contractFormInitialValues,
        clientId: defaultClientId || '',
      });
    }
  }, [contract, reset, defaultClientId]);

  return {
    control,
    handleContract,
    loading: loading || contractMutation.isPending || generatingPdf,
    handleClose,
    open,
    editing: !!contract,
    options,
    setSearch,
    selectedType,
    contractTypes: contractTypes || [],
  };
};

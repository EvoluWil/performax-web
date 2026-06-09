import { yupResolver } from '@hookform/resolvers/yup';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { useContractTypeMutation } from '../../hooks/queries/contract-types.query';
import {
  ContractTypeFormDto,
  contractTypeFormInitialValues,
  contractTypeFormSchema,
} from '../../schemas/contract-type.schema';
import { ContractTypeDrawerProps } from './contract-type';

export const useContractTypeDrawer = ({
  onClose,
  open,
  contractType,
  initialName,
  onCreated,
}: ContractTypeDrawerProps) => {
  const mutation = useContractTypeMutation();

  const { control, handleSubmit, reset } = useForm<ContractTypeFormDto>({
    defaultValues: contractTypeFormInitialValues,
    resolver: yupResolver(contractTypeFormSchema) as any,
  });

  const handleContractType = handleSubmit(async (data: ContractTypeFormDto) => {
    const result = await mutation.mutateAsync({
      type: contractType ? 'update' : 'create',
      data,
      id: contractType?.id,
    });

    if (result) {
      toast.success(
        contractType
          ? 'Tipo de contrato atualizado com sucesso'
          : 'Tipo de contrato criado com sucesso',
      );
      if (!contractType) {
        onCreated?.(result);
      }
      handleClose();
      onClose();
    }
  });

  const handleClose = () => {
    onClose();
    reset();
  };

  useEffect(() => {
    if (contractType) {
      reset({ name: contractType.name });
    } else {
      reset({ ...contractTypeFormInitialValues, name: initialName || '' });
    }
  }, [contractType, reset, initialName]);

  return {
    control,
    handleContractType,
    loading: mutation.isPending,
    handleClose,
    open,
    editing: !!contractType,
  };
};

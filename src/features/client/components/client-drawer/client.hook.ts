import { useClientMutation } from '@/features/client/hooks';
import {
  ClientFormDto,
  clientFormInitialValues,
  clientFormSchema,
} from '@/features/client/schemas';
import { yupResolver } from '@hookform/resolvers/yup';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { ClientDrawerProps } from './client';

export const useClientDrawer = ({
  onClose,
  open,
  client,
}: ClientDrawerProps) => {
  const clientMutation = useClientMutation();

  const { control, handleSubmit, reset } = useForm<ClientFormDto>({
    defaultValues: clientFormInitialValues,
    resolver: yupResolver(clientFormSchema),
  });

  const handleClient = handleSubmit(async (data: ClientFormDto) => {
    const result = await clientMutation.mutateAsync({
      type: client ? 'update' : 'create',
      data: data,
      id: client?.id,
    });

    if (result) {
      toast.success(
        client
          ? 'Cliente atualizado com sucesso'
          : 'Cliente criado com sucesso',
      );
      handleClose();
      onClose();
    }
  });

  const handleClose = () => {
    onClose();
    reset();
  };

  useEffect(() => {
    if (client) {
      reset({
        name: client.name,
        address: client.address,
        cnpj: client.cnpj,
      });
    } else {
      reset(clientFormInitialValues);
    }
  }, [client, reset]);

  return {
    control,
    handleClient,
    loading: clientMutation.isPending,
    handleClose,
    open,
    editing: !!client,
  };
};

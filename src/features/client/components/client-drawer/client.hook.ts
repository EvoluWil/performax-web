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
  initialName,
  onCreated,
  onSuccess,
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
      if (!client) {
        onCreated?.(result);
      } else {
        onSuccess?.();
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
    if (client) {
      reset({
        name: client.name,
        address: client.address,
        cnpj: client.cnpj,
      });
    } else {
      reset({ ...clientFormInitialValues, name: initialName || '' });
    }
  }, [client, reset, initialName]);

  return {
    control,
    handleClient,
    loading: clientMutation.isPending,
    handleClose,
    open,
    editing: !!client,
  };
};

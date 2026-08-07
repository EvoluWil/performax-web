import { useClientMutation } from '@/features/client/hooks';
import {
  ClientFormDto,
  clientFormInitialValues,
  clientFormSchema,
} from '@/features/client/schemas';
import { clientService } from '@/features/client/services/client.service';
import { FiscalStatus } from '@/features/client/types';
import { yupResolver } from '@hookform/resolvers/yup';
import { useEffect, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { toast } from 'react-toastify';
import { ClientDrawerProps } from './client';

function clientToFormValues(client: NonNullable<ClientDrawerProps['client']>): ClientFormDto {
  return {
    name: client.name,
    personType: client.personType ?? (client.cnpj ? 'PJ' : client.cpf ? 'PF' : 'PJ'),
    cpf: client.cpf ?? '',
    cnpj: client.cnpj ?? '',
    email: client.email ?? '',
    phone: client.phone ?? '',
    address: client.address ?? '',
    fiscalAddress: {
      street: client.fiscalAddress?.street ?? client.address ?? '',
      number: client.fiscalAddress?.number ?? '',
      complement: client.fiscalAddress?.complement ?? '',
      neighborhood: client.fiscalAddress?.neighborhood ?? '',
      city: client.fiscalAddress?.city ?? '',
      state: client.fiscalAddress?.state ?? '',
      postalCode: client.fiscalAddress?.postalCode ?? '',
      cityCode: client.fiscalAddress?.cityCode ?? '',
    },
  };
}

export const useClientDrawer = ({
  onClose,
  open,
  client,
  initialName,
  onCreated,
  onSuccess,
}: ClientDrawerProps) => {
  const clientMutation = useClientMutation();
  const [fiscalStatus, setFiscalStatus] = useState<FiscalStatus | undefined>();

  const { control, handleSubmit, reset, setValue } = useForm<ClientFormDto>({
    defaultValues: clientFormInitialValues,
    resolver: yupResolver(clientFormSchema) as any,
  });

  const personType = useWatch({ control, name: 'personType' });
  const postalCode = useWatch({ control, name: 'fiscalAddress.postalCode' });

  const handleClient = handleSubmit(async (data: ClientFormDto) => {
    const payload: ClientFormDto = {
      ...data,
      cpf: data.personType === 'PF' ? data.cpf : undefined,
      cnpj: data.personType === 'PJ' ? data.cnpj : undefined,
    };

    const result = await clientMutation.mutateAsync({
      type: client ? 'update' : 'create',
      data: payload,
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
    setFiscalStatus(undefined);
  };

  useEffect(() => {
    if (client) {
      reset(clientToFormValues(client));
      clientService.getFiscalStatus(client.id).then(setFiscalStatus).catch(() => {});
    } else {
      reset({ ...clientFormInitialValues, name: initialName || '' });
      setFiscalStatus(undefined);
    }
  }, [client, reset, initialName]);

  return {
    control,
    handleClient,
    loading: clientMutation.isPending,
    handleClose,
    open,
    editing: !!client,
    personType,
    setValue,
    fiscalStatus,
    postalCode,
  };
};

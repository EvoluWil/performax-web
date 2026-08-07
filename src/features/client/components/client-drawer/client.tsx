'use client';

import { BaseDrawer } from '@/components/drawer';
import { MaskInput, SelectInput, TextInput } from '@/components/inputs';
import { Client } from '@/features/client/types';
import { fetchViaCep } from '@/utils/viacep';
import { Box, Button, Chip, Divider, Typography } from '@mui/material';
import { useClientDrawer } from './client.hook';

export type ClientDrawerProps = {
  open: boolean;
  onClose: () => void;
  client: Client | null;
  initialName?: string;
  onCreated?: (client: Client) => void;
  onSuccess?: () => void;
};

export const ClientDrawer: React.FC<ClientDrawerProps> = (props) => {
  const {
    control,
    handleClient,
    loading,
    handleClose,
    open,
    editing,
    personType,
    setValue,
    fiscalStatus,
    postalCode,
  } = useClientDrawer(props);

  const handleCepLookup = async () => {
    const cep = postalCode?.replace(/\D/g, '') ?? '';
    if (cep.length !== 8) return;
    const data = await fetchViaCep(cep);
    if (!data) return;
    if (data.logradouro) setValue('fiscalAddress.street', data.logradouro);
    if (data.bairro) setValue('fiscalAddress.neighborhood', data.bairro);
    if (data.localidade) setValue('fiscalAddress.city', data.localidade);
    if (data.uf) setValue('fiscalAddress.state', data.uf);
    if (data.ibge) setValue('fiscalAddress.cityCode', data.ibge);
    if (data.complemento) setValue('fiscalAddress.complement', data.complemento);
  };

  return (
    <BaseDrawer
      open={open}
      setOpen={handleClose}
      height="auto"
      title={editing ? 'Editar Cliente' : 'Novo Cliente'}
      content={
        <Box
          gap={2}
          component="form"
          display="flex"
          alignItems="center"
          justifyContent="center"
          flexDirection="column"
          flex={1}
        >
          {fiscalStatus && (
            <Chip
              label={
                fiscalStatus.ready
                  ? 'Dados fiscais completos'
                  : `Pendente: ${fiscalStatus.missingFields.join(', ')}`
              }
              color={fiscalStatus.ready ? 'success' : 'warning'}
              size="small"
              sx={{ alignSelf: 'flex-start' }}
            />
          )}

          <TextInput label="Nome do cliente" name="name" control={control} />

          <SelectInput
            label="Tipo de pessoa"
            name="personType"
            control={control}
            options={[
              { label: 'Pessoa Jurídica (PJ)', value: 'PJ' },
              { label: 'Pessoa Física (PF)', value: 'PF' },
            ]}
          />

          {personType === 'PF' ? (
            <MaskInput
              mask="999.999.999-99"
              label="CPF"
              name="cpf"
              control={control}
            />
          ) : (
            <MaskInput
              mask="99.999.999/9999-99"
              label="CNPJ"
              name="cnpj"
              control={control}
            />
          )}

          <TextInput label="E-mail" name="email" control={control} />
          <MaskInput
            mask="(99) 99999-9999"
            label="Telefone"
            name="phone"
            control={control}
          />

          <Divider sx={{ width: '100%' }} />
          <Typography variant="subtitle2" alignSelf="flex-start">
            Endereço fiscal
          </Typography>

          <Box display="flex" gap={1} width="100%" alignItems="flex-start">
            <Box flex={1}>
              <MaskInput
                mask="99999-999"
                label="CEP"
                name="fiscalAddress.postalCode"
                control={control}
              />
            </Box>
            <Button variant="outlined" size="small" sx={{ mt: 1 }} onClick={handleCepLookup}>
              Buscar
            </Button>
          </Box>

          <TextInput
            label="Logradouro"
            name="fiscalAddress.street"
            control={control}
          />
          <TextInput label="Número" name="fiscalAddress.number" control={control} />
          <TextInput
            label="Complemento"
            name="fiscalAddress.complement"
            control={control}
          />
          <TextInput label="Bairro" name="fiscalAddress.neighborhood" control={control} />
          <TextInput label="Cidade" name="fiscalAddress.city" control={control} />
          <TextInput label="UF" name="fiscalAddress.state" control={control} />

          <Box
            mt="auto"
            display="flex"
            gap={2}
            justifyContent="space-between"
            width="100%"
          >
            <Button
              variant="outlined"
              color="error"
              onClick={handleClose}
              loading={loading}
              fullWidth
            >
              Cancelar
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={handleClient}
              type="submit"
              loading={loading}
              fullWidth
            >
              Confirmar
            </Button>
          </Box>
        </Box>
      }
    />
  );
};

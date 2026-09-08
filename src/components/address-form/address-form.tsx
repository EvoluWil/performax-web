'use client';

import { MaskInput, TextInput } from '@/components/inputs';
import { useViaCepQuery } from '@/hooks/queries/viacep.query';
import { Box, CircularProgress, Divider, Typography } from '@mui/material';
import { useEffect, useRef } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';

type AddressFormProps = {
  name: string;
  title?: string;
};

function digits(value?: string) {
  return (value ?? '').replace(/\D/g, '');
}

export function AddressForm({ name, title = 'Endereço' }: AddressFormProps) {
  const { setValue, getValues } = useFormContext();
  const postalCode = useWatch({ name: `${name}.postalCode` }) as string | undefined;
  const street = useWatch({ name: `${name}.street` }) as string | undefined;
  const cep = digits(postalCode);
  const { data, isFetching, isFetched } = useViaCepQuery(cep);
  const appliedCep = useRef('');
  const showDetails = cep.length === 8 || Boolean(street?.trim());

  useEffect(() => {
    if (!data || cep.length !== 8 || appliedCep.current === cep) return;
    const overwrite = appliedCep.current.length === 8;
    appliedCep.current = cep;

    const current = (getValues(name) ?? {}) as Record<string, string>;
    const fill = (field: string, value?: string) => {
      if (!value?.trim()) return;
      if (!overwrite && current[field]?.trim()) return;
      setValue(`${name}.${field}`, value, { shouldValidate: true });
    };

    fill('street', data.logradouro);
    fill('neighborhood', data.bairro);
    fill('city', data.localidade);
    fill('state', data.uf);
    fill('cityCode', data.ibge);
  }, [cep, data, getValues, name, setValue]);

  return (
    <Box display="flex" flexDirection="column" gap={2} width="100%">
      <Divider />
      <Typography variant="subtitle2">{title}</Typography>
      <Box display="flex" gap={1} alignItems="flex-start">
        <Box flex={1}>
          <MaskInput mask="99999-999" label="CEP" name={`${name}.postalCode`} />
        </Box>
        {isFetching && <CircularProgress size={22} sx={{ mt: 2 }} />}
      </Box>
      {isFetched && cep.length === 8 && !data && !isFetching && (
        <Typography variant="caption" color="error">
          CEP não encontrado
        </Typography>
      )}
      {showDetails && (
        <>
          <TextInput label="Logradouro" name={`${name}.street`} />
          <TextInput label="Número" name={`${name}.number`} />
          <TextInput label="Complemento" name={`${name}.complement`} />
          <TextInput label="Bairro" name={`${name}.neighborhood`} />
          <TextInput label="Cidade" name={`${name}.city`} />
          <TextInput label="UF" name={`${name}.state`} />
        </>
      )}
    </Box>
  );
}

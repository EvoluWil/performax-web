'use client';

import { MaskInput, SelectInput, TextInput } from '@/components/inputs';
import { useCnpjQuery } from '@/hooks/queries/cnpj.query';
import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import {
  Box,
  Button,
  CircularProgress,
  Divider,
  IconButton,
  Typography,
} from '@mui/material';
import { useEffect, useMemo, useRef } from 'react';
import { useFieldArray, useFormContext, useFormState, useWatch } from 'react-hook-form';

export const companyFormFieldDefaults = {
  cnpj: 'federalTaxNumber',
  legalName: 'legalName',
  tradeName: 'tradeName',
  email: 'email',
  phone: 'phone',
  stateTaxNumber: 'stateTaxNumber',
  cityTaxNumber: 'cityTaxNumber',
  activities: 'economicActivities',
};

type CompanyFormFields = typeof companyFormFieldDefaults;

type CompanyFormProps = {
  addressName?: string;
  fields?: Partial<CompanyFormFields>;
  title?: string;
};

export function CompanyForm({
  addressName,
  fields: fieldOverrides,
  title = 'Identificação',
}: CompanyFormProps) {
  const fields = useMemo(
    () => ({ ...companyFormFieldDefaults, ...fieldOverrides }),
    [fieldOverrides],
  );
  const { setValue, getValues } = useFormContext();
  const { dirtyFields } = useFormState();
  const cnpj = useWatch({ name: fields.cnpj }) as string | undefined;
  const legalName = useWatch({ name: fields.legalName }) as string | undefined;
  const digits = (cnpj ?? '').replace(/\D/g, '');
  const unlocked = digits.length === 14 || Boolean(legalName?.trim());
  const { data, isFetching, isFetched } = useCnpjQuery(digits);
  const appliedCnpj = useRef('');
  const activities = useFieldArray({ name: fields.activities });

  useEffect(() => {
    const cnpjDirty = Boolean(
      (dirtyFields as Record<string, boolean>)[fields.cnpj],
    );
    if (!data || digits.length !== 14 || !cnpjDirty || appliedCnpj.current === digits) {
      return;
    }
    appliedCnpj.current = digits;

    const fill = (field: string, value?: string) => {
      if (!value?.trim()) return;
      setValue(field, value, { shouldValidate: true, shouldDirty: true });
    };

    fill(fields.legalName, data.legalName);
    fill(fields.tradeName, data.tradeName);
    fill(fields.email, data.email);
    fill(fields.phone, data.phone);

    if (data.activities.length) {
      setValue(fields.activities, data.activities, {
        shouldValidate: true,
        shouldDirty: true,
      });
    }

    if (addressName) {
      const current = (getValues(addressName) ?? {}) as Record<string, string>;
      const fillAddress = (field: string, value?: string) => {
        if (!value?.trim() || current[field]?.trim()) return;
        setValue(`${addressName}.${field}`, value, { shouldValidate: true });
      };
      fillAddress('postalCode', data.postalCode);
      fillAddress('street', data.street);
      fillAddress('number', data.number);
      fillAddress('complement', data.complement);
      fillAddress('neighborhood', data.neighborhood);
      fillAddress('city', data.city);
      fillAddress('state', data.state);
      fillAddress('cityCode', data.cityCode);
    }
  }, [addressName, data, digits, dirtyFields, fields, getValues, setValue]);

  return (
    <Box display="flex" flexDirection="column" gap={2} width="100%">
      <Divider />
      <Typography variant="subtitle2">{title}</Typography>
      <Box display="flex" gap={1} alignItems="flex-start">
        <Box flex={1}>
          <MaskInput
            mask="99.999.999/9999-99"
            label="CNPJ"
            name={fields.cnpj}
          />
        </Box>
        {isFetching && <CircularProgress size={22} sx={{ mt: 2 }} />}
      </Box>
      {isFetched && digits.length === 14 && !data && !isFetching && (
        <Typography variant="caption" color="error">
          CNPJ não encontrado
        </Typography>
      )}
      {unlocked && (
        <>
          <TextInput label="Razão social" name={fields.legalName} />
          <TextInput label="Nome fantasia" name={fields.tradeName} />
          <TextInput label="Inscrição estadual" name={fields.stateTaxNumber} />
          <TextInput label="Inscrição municipal" name={fields.cityTaxNumber} />
          <TextInput label="E-mail" name={fields.email} />
          <MaskInput mask="(99) 99999-9999" label="Telefone" name={fields.phone} />

          <Divider />
          <Typography variant="subtitle2">CNAEs</Typography>
          {activities.fields.map((field, index) => (
            <Box key={field.id} display="flex" gap={1}>
              <TextInput
                label="CNAE"
                name={`${fields.activities}.${index}.code`}
              />
              <SelectInput
                label="Principal"
                name={`${fields.activities}.${index}.isMain`}
                options={[
                  { label: 'Sim', value: 'true' },
                  { label: 'Não', value: 'false' },
                ]}
              />
              {activities.fields.length > 1 && (
                <IconButton onClick={() => activities.remove(index)}>
                  <DeleteOutlineIcon />
                </IconButton>
              )}
            </Box>
          ))}
          <Button
            startIcon={<AddIcon />}
            onClick={() => activities.append({ code: '', isMain: 'false' })}
          >
            Adicionar CNAE
          </Button>
        </>
      )}
    </Box>
  );
}

'use client';

import { AddressForm } from '@/components/address-form/address-form';
import { CompanyForm } from '@/components/company-form/company-form';
import { BaseDrawer } from '@/components/drawer';
import { SelectInput } from '@/components/inputs';
import { yupResolver } from '@hookform/resolvers/yup';
import {
  Button,
  Divider,
  Stack,
  SxProps,
  Theme,
  Typography,
} from '@mui/material';
import { FormProvider, useForm, useWatch } from 'react-hook-form';
import { toast } from 'react-toastify';
import { useFiscalConfigMutation } from '../../../hooks/queries/customization.query';
import { companyCadastroSchema } from '../../../schemas/fiscal-drawers.schema';
import { FiscalConfig, TAX_REGIME_OPTIONS } from '../../../types/fiscal-config';

function CompanyDrawerFields({
  saving,
  onSave,
}: {
  saving: boolean;
  onSave: () => void;
}) {
  const cnpj = useWatch({ name: 'federalTaxNumber' }) as string | undefined;
  const legalName = useWatch({ name: 'legalName' }) as string | undefined;
  const unlocked =
    (cnpj ?? '').replace(/\D/g, '').length === 14 || Boolean(legalName?.trim());

  return (
    <Stack gap={2} p={2}>
      <CompanyForm addressName="address" />
      {unlocked && (
        <>
          <AddressForm name="address" />
          <Divider />
          <Typography variant="subtitle2">Tributação</Typography>
          <SelectInput
            label="Regime tributário"
            name="taxRegime"
            options={TAX_REGIME_OPTIONS.map((item) => ({ ...item }))}
          />
          <Button variant="contained" onClick={onSave} loading={saving}>
            Salvar cadastro
          </Button>
        </>
      )}
    </Stack>
  );
}

export function CompanyCadastroDrawer({
  open,
  config,
  onClose,
  onSaved,
  sx,
}: {
  open: boolean;
  config?: FiscalConfig | null;
  onClose: () => void;
  onSaved?: () => void;
  sx?: SxProps<Theme>;
}) {
  const mutation = useFiscalConfigMutation();
  const methods = useForm({
    resolver: yupResolver(companyCadastroSchema),
    values: {
      legalName: config?.legalName ?? '',
      tradeName: config?.tradeName ?? '',
      federalTaxNumber: config?.federalTaxNumber ?? '',
      stateTaxNumber: config?.stateTaxNumber ?? '',
      cityTaxNumber: config?.cityTaxNumber ?? '',
      email: config?.email ?? '',
      phone: config?.phone ?? '',
      taxRegime: config?.taxRegime ?? '',
      economicActivities: config?.economicActivities?.length
        ? config.economicActivities.map((item) => ({
            code: item.code,
            isMain:
              item.isMain === true || item.isMain === 'true' ? 'true' : 'false',
          }))
        : [{ code: '', isMain: 'true' }],
      address: {
        street: config?.address?.street ?? '',
        number: config?.address?.number ?? '',
        complement: config?.address?.complement ?? '',
        neighborhood: config?.address?.neighborhood ?? '',
        city: config?.address?.city ?? '',
        state: config?.address?.state ?? '',
        postalCode: config?.address?.postalCode ?? '',
        cityCode: config?.address?.cityCode ?? '',
      },
    },
  });

  const save = methods.handleSubmit(async (values) => {
    await mutation.mutateAsync({
      legalName: values.legalName,
      tradeName: values.tradeName || undefined,
      federalTaxNumber: values.federalTaxNumber.replace(/\D/g, ''),
      stateTaxNumber: values.stateTaxNumber || undefined,
      cityTaxNumber: values.cityTaxNumber || undefined,
      email: values.email,
      phone: values.phone.replace(/\D/g, ''),
      taxRegime: values.taxRegime as any,
      address: {
        ...values.address,
        postalCode: values.address.postalCode.replace(/\D/g, ''),
      },
      economicActivities: values.economicActivities.map((item) => ({
        code: item.code.trim(),
        isMain: item.isMain === true || item.isMain === 'true',
      })),
    });
    toast.success('Cadastro da empresa salvo');
    onSaved?.();
    onClose();
  });

  return (
    <BaseDrawer
      open={open}
      setOpen={onClose}
      title="Cadastro da empresa"
      width={42}
      sx={sx}
      content={
        <FormProvider {...methods}>
          <CompanyDrawerFields saving={mutation.isPending} onSave={save} />
        </FormProvider>
      }
    />
  );
}

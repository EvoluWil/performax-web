'use client';

import { BaseDrawer } from '@/components/drawer';
import { SelectInput, TextInput } from '@/components/inputs';
import { yupResolver } from '@hookform/resolvers/yup';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  Grid,
  Stack,
  Typography,
} from '@mui/material';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import {
  useFiscalConfigMutation,
  useFiscalConfigQuery,
  useFiscalConfigStatusQuery,
  useFiscalSyncMutation,
} from '../../../hooks/queries/customization.query';
import { fiscalConfigService } from '../../../services/fiscal-config.service';
import {
  nfseFormSchema,
  certificateFormSchema,
  NfseFormDto,
} from '../../../schemas/fiscal-drawers.schema';
import { CompanyCadastroDrawer } from './company-cadastro-drawer';
import {
  FiscalConfig,
  TAXATION_TYPE_OPTIONS,
} from '../../../types/fiscal-config';

type DrawerKey = 'company' | 'nfse' | 'certificate' | null;

function statusChip(ready: boolean, pendingLabel: string, readyLabel = 'Completo') {
  return (
    <Chip
      size="small"
      color={ready ? 'success' : 'warning'}
      label={ready ? readyLabel : pendingLabel}
    />
  );
}

export function FiscalHub() {
  const { data: config } = useFiscalConfigQuery();
  const { data: status } = useFiscalConfigStatusQuery();
  const [drawer, setDrawer] = useState<DrawerKey>(null);
  const syncMutation = useFiscalSyncMutation();

  const cadastroMissing = (status?.missingFields ?? []).filter(
    (field) =>
      ![
        'código federal do serviço',
        'código NBS',
        'série RPS',
        'número RPS',
      ].includes(field),
  );
  const nfsMissing = (status?.missingFields ?? []).filter((field) =>
    [
      'código federal do serviço',
      'código NBS',
      'série RPS',
      'número RPS',
    ].includes(field),
  );

  const syncLabel =
    config?.spedySyncStatus === 'SYNCED'
      ? 'Habilitado'
      : config?.spedySyncStatus === 'ERROR'
        ? 'Erro ao habilitar'
        : 'Não habilitado';

  const handleSync = async () => {
    try {
      await syncMutation.mutateAsync({});
      toast.success('Emissor habilitado');
    } catch {
      // API interceptor already surfaces the Spedy error.
    }
  };

  return (
    <>
      <Card variant="outlined">
        <CardContent>
          <Stack direction="row" alignItems="center" gap={1} mb={1} flexWrap="wrap">
            <Typography variant="h6" color="primary">
              Nota fiscal de serviço
            </Typography>
            <Chip
              size="small"
              label={syncLabel}
              color={
                config?.spedySyncStatus === 'SYNCED'
                  ? 'success'
                  : config?.spedySyncStatus === 'ERROR'
                    ? 'error'
                    : 'default'
              }
            />
          </Stack>
          {config?.spedySyncError && (
            <Typography variant="body2" color="error" mb={1}>
              {config.spedySyncError}
            </Typography>
          )}
          <Divider sx={{ mb: 1 }} />

          <SessionRow
            title="Cadastro da empresa"
            description={config?.legalName || 'Razão social, CNPJ e endereço'}
            chip={statusChip(cadastroMissing.length === 0, 'Pendente')}
            onClick={() => setDrawer('company')}
          />
          <SessionRow
            title="Configurações de NFS-e"
            description={config?.federalServiceCode || 'Códigos, ISS e RPS'}
            chip={statusChip(nfsMissing.length === 0, 'Pendente')}
            onClick={() => setDrawer('nfse')}
          />
          <SessionRow
            title="Certificado A1"
            description={
              config?.certificateUploadedAt
                ? config.certificateFileName || 'Enviado'
                : 'Arquivo .pfx e senha'
            }
            chip={statusChip(
              !!config?.certificateUploadedAt,
              'Pendente',
              'Enviado',
            )}
            onClick={() => setDrawer('certificate')}
          />

          <Button
            variant="contained"
            sx={{ mt: 2 }}
            onClick={handleSync}
            loading={syncMutation.isPending}
            disabled={!status?.readyForSync}
          >
            Habilitar emissor
          </Button>
        </CardContent>
      </Card>

      <CompanyCadastroDrawer
        open={drawer === 'company'}
        config={config}
        onClose={() => setDrawer(null)}
      />
      <NfseDrawer
        open={drawer === 'nfse'}
        config={config}
        cityRequirements={status?.cityRequirements}
        onClose={() => setDrawer(null)}
      />
      <CertificateDrawer
        open={drawer === 'certificate'}
        config={config}
        onClose={() => setDrawer(null)}
      />
    </>
  );
}

function SessionRow({
  title,
  description,
  chip,
  onClick,
}: {
  title: string;
  description: string;
  chip: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <Box
      onClick={onClick}
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        py: 1.5,
        cursor: 'pointer',
        borderBottom: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Box flex={1}>
        <Typography variant="subtitle2">{title}</Typography>
        <Typography variant="body2" color="text.secondary">
          {description}
        </Typography>
      </Box>
      {chip}
      <ChevronRightIcon color="action" />
    </Box>
  );
}

const CITY_REQUIREMENT_LABELS: Record<string, string> = {
  federalServiceCode: 'Código federal do serviço',
  nbsCode: 'Código NBS',
  rps: 'Número RPS',
  series: 'Série RPS',
  batchNumber: 'Lote (definido pela prefeitura)',
};

function NfseDrawer({
  open,
  config,
  cityRequirements,
  onClose,
}: {
  open: boolean;
  config?: FiscalConfig | null;
  cityRequirements?: Record<string, boolean> | null;
  onClose: () => void;
}) {
  const mutation = useFiscalConfigMutation();
  const queryClient = useQueryClient();
  const { control, handleSubmit } = useForm<NfseFormDto>({
    resolver: yupResolver(nfseFormSchema) as any,
    values: {
      federalServiceCode: config?.federalServiceCode ?? '',
      nationalTaxationCode: config?.nationalTaxationCode ?? '',
      cityServiceCode: config?.cityServiceCode ?? '',
      nbsCode: config?.nbsCode ?? '',
      cnaeCode: config?.cnaeCode ?? '',
      taxationType: config?.taxationType ?? 'taxationInMunicipality',
      issRate: config?.issRate ?? 0,
      issWithheld: config?.issWithheld ? 'true' : 'false',
      rpsSeries: config?.rpsSeries ?? '',
      rpsNumber: config?.rpsNumber ?? 1,
    },
  });

  const loadCityRules = async () => {
    try {
      const result = await fiscalConfigService.getCities(config?.address?.cityCode);
      await queryClient.invalidateQueries({ queryKey: ['fiscalConfig'] });
      await queryClient.invalidateQueries({ queryKey: ['fiscalConfigStatus'] });
      toast.info(
        result?.options
          ? 'Requisitos do município atualizados'
          : 'Município não encontrado',
      );
    } catch {
      toast.error('Não foi possível consultar o município');
    }
  };

  const save = handleSubmit(async (values) => {
    await mutation.mutateAsync({
      federalServiceCode: values.federalServiceCode,
      nationalTaxationCode: values.nationalTaxationCode || undefined,
      cityServiceCode: values.cityServiceCode || undefined,
      nbsCode: values.nbsCode || undefined,
      cnaeCode: values.cnaeCode || undefined,
      taxationType: values.taxationType,
      issRate: Number(values.issRate),
      issWithheld: values.issWithheld === 'true',
      rpsSeries: values.rpsSeries,
      rpsNumber: Number(values.rpsNumber),
    });
    toast.success('Configurações de NFS-e salvas');
    onClose();
  });

  return (
    <BaseDrawer
      open={open}
      setOpen={onClose}
      title="Configurações de NFS-e"
      width={42}
      content={
        <Stack gap={2} p={2}>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12 }}>
              <TextInput label="Código federal do serviço" name="federalServiceCode" control={control} />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextInput label="Código municipal" name="cityServiceCode" control={control} />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextInput label="Código NBS" name="nbsCode" control={control} />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextInput label="CNAE do serviço" name="cnaeCode" control={control} />
            </Grid>
          </Grid>
          <SelectInput
            label="Tipo de tributação"
            name="taxationType"
            control={control}
            options={TAXATION_TYPE_OPTIONS.map((item) => ({ ...item }))}
          />
          <TextInput label="Alíquota ISS (ex: 0.05)" name="issRate" control={control} type="number" />
          <SelectInput
            label="ISS retido"
            name="issWithheld"
            control={control}
            options={[
              { label: 'Não', value: 'false' },
              { label: 'Sim', value: 'true' },
            ]}
          />
          <TextInput label="Série RPS" name="rpsSeries" control={control} />
          <TextInput label="Número RPS" name="rpsNumber" control={control} type="number" />
          {cityRequirements && (
            <Stack direction="row" gap={1} flexWrap="wrap">
              {Object.entries(cityRequirements)
                .filter(([, required]) => required)
                .map(([key]) => (
                  <Chip
                    key={key}
                    size="small"
                    color="warning"
                    label={`Exigido: ${CITY_REQUIREMENT_LABELS[key] ?? key}`}
                  />
                ))}
            </Stack>
          )}
          <Button variant="outlined" onClick={loadCityRules}>
            Consultar requisitos do município
          </Button>
          <Button variant="contained" onClick={save} loading={mutation.isPending}>
            Salvar NFS-e
          </Button>
        </Stack>
      }
    />
  );
}

function CertificateDrawer({
  open,
  config,
  onClose,
}: {
  open: boolean;
  config?: FiscalConfig | null;
  onClose: () => void;
}) {
  const syncMutation = useFiscalSyncMutation();
  const [file, setFile] = useState<File | null>(null);
  const { control, handleSubmit, setValue, formState } = useForm({
    resolver: yupResolver(certificateFormSchema),
    defaultValues: {
      certificateFileName: '',
      certificatePassword: '',
    },
  });

  const send = handleSubmit(async (values) => {
    if (!file) return;
    const base64 = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = String(reader.result ?? '');
        resolve(result.split(',')[1] ?? result);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
    try {
      await syncMutation.mutateAsync({
        certificateFileName: values.certificateFileName,
        certificateFileBase64: base64,
        certificatePassword: values.certificatePassword,
      });
      toast.success('Certificado enviado');
      setFile(null);
      setValue('certificateFileName', '');
      setValue('certificatePassword', '');
      onClose();
    } catch {
      // API interceptor already surfaces the Spedy error.
    }
  });

  return (
    <BaseDrawer
      open={open}
      setOpen={onClose}
      title="Certificado A1"
      width={36}
      content={
        <Stack gap={2} p={2}>
          <Typography variant="body2" color="text.secondary">
            O arquivo e a senha não ficam armazenados no sistema.
          </Typography>
          {config?.certificateUploadedAt && (
            <Chip
              color="success"
              label={`Enviado: ${config.certificateFileName || 'certificado.pfx'}`}
              sx={{ alignSelf: 'flex-start' }}
            />
          )}
          <Button variant="outlined" component="label" sx={{ alignSelf: 'flex-start' }}>
            {file ? file.name : 'Selecionar .pfx'}
            <input
              hidden
              type="file"
              accept=".pfx,.p12"
              onChange={({ target }) => {
                const selected = target.files?.[0] ?? null;
                setFile(selected);
                setValue('certificateFileName', selected?.name ?? '', {
                  shouldValidate: true,
                });
              }}
            />
          </Button>
          {formState.errors.certificateFileName && (
            <Typography variant="caption" color="error">
              {formState.errors.certificateFileName.message}
            </Typography>
          )}
          <TextInput
            label="Senha do certificado"
            name="certificatePassword"
            type="password"
            control={control}
          />
          <Button variant="contained" onClick={send} loading={syncMutation.isPending}>
            Enviar certificado
          </Button>
        </Stack>
      }
    />
  );
}

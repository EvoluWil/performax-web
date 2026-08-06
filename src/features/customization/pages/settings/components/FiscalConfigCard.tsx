'use client';

import { MaskInput, SelectInput, TextInput } from '@/components/inputs';
import { fetchViaCep } from '@/utils/viacep';
import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  Grid,
  IconButton,
  Typography,
} from '@mui/material';
import {
  Control,
  UseFormSetValue,
  useFieldArray,
  useWatch,
} from 'react-hook-form';
import { FiscalConfigFormDto } from '../../../schemas/fiscal-config.schema';
import {
  FiscalStatus,
  TAX_LOCATION_OPTIONS,
  TAX_REGIME_OPTIONS,
  TAXATION_TYPE_OPTIONS,
} from '../../../types/fiscal-config';

type FiscalConfigCardProps = {
  control: Control<FiscalConfigFormDto>;
  setValue: UseFormSetValue<FiscalConfigFormDto>;
  fiscalStatus?: FiscalStatus;
  certificateFile: File | null;
  onCertificateChange: (file: File | null) => void;
  hasCertificate?: boolean;
};

export function FiscalConfigCard({
  control,
  setValue,
  fiscalStatus,
  certificateFile,
  onCertificateChange,
  hasCertificate,
}: FiscalConfigCardProps) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'economicActivities',
  });

  const postalCode = useWatch({ control, name: 'address.postalCode' });

  const handleCepLookup = async () => {
    const cep = postalCode?.replace(/\D/g, '') ?? '';
    if (cep.length !== 8) return;
    const data = await fetchViaCep(cep);
    if (!data) return;

    if (data.logradouro) setValue('address.street', data.logradouro);
    if (data.bairro) setValue('address.neighborhood', data.bairro);
    if (data.localidade) setValue('address.city', data.localidade);
    if (data.uf) setValue('address.state', data.uf);
    if (data.ibge) setValue('address.cityCode', data.ibge);
    if (data.complemento) setValue('address.complement', data.complemento);
  };

  return (
    <Card variant="outlined">
      <CardContent>
        <Box display="flex" alignItems="center" gap={1} mb={1} flexWrap="wrap">
          <Typography variant="h6" color="primary">
            Dados fiscais (NFS-e)
          </Typography>
          {fiscalStatus && (
            <Chip
              label={
                fiscalStatus.ready
                  ? 'Pronto para emissão'
                  : `Pendente: ${fiscalStatus.missingFields.slice(0, 3).join(', ')}${fiscalStatus.missingFields.length > 3 ? '...' : ''}`
              }
              color={fiscalStatus.ready ? 'success' : 'warning'}
              size="small"
            />
          )}
        </Box>
        <Divider sx={{ mb: 2 }} />

        <Typography variant="subtitle2" gutterBottom>
          Identificação
        </Typography>
        <Grid container spacing={2} mb={2}>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextInput label="Razão social" name="legalName" control={control} />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextInput label="Nome fantasia" name="tradeName" control={control} />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <MaskInput
              mask="99.999.999/9999-99"
              label="CNPJ"
              name="federalTaxNumber"
              control={control}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <TextInput
              label="Inscrição estadual"
              name="stateTaxNumber"
              control={control}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <TextInput
              label="Inscrição municipal"
              name="cityTaxNumber"
              control={control}
            />
          </Grid>
        </Grid>

        <Typography variant="subtitle2" gutterBottom>
          Contato
        </Typography>
        <Grid container spacing={2} mb={2}>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextInput label="E-mail fiscal" name="email" control={control} />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <MaskInput
              mask="(99) 99999-9999"
              label="Telefone"
              name="phone"
              control={control}
            />
          </Grid>
        </Grid>

        <Typography variant="subtitle2" gutterBottom>
          Endereço
        </Typography>
        <Grid container spacing={2} mb={2}>
          <Grid size={{ xs: 12, md: 4 }}>
            <Box display="flex" gap={1} alignItems="flex-start">
              <Box flex={1}>
                <MaskInput
                  mask="99999-999"
                  label="CEP"
                  name="address.postalCode"
                  control={control}
                />
              </Box>
              <Button
                variant="outlined"
                size="small"
                sx={{ mt: 1 }}
                onClick={handleCepLookup}
              >
                Buscar
              </Button>
            </Box>
          </Grid>
          <Grid size={{ xs: 12, md: 8 }}>
            <TextInput label="Logradouro" name="address.street" control={control} />
          </Grid>
          <Grid size={{ xs: 12, md: 3 }}>
            <TextInput label="Número" name="address.number" control={control} />
          </Grid>
          <Grid size={{ xs: 12, md: 3 }}>
            <TextInput
              label="Complemento"
              name="address.complement"
              control={control}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 3 }}>
            <TextInput label="Bairro" name="address.neighborhood" control={control} />
          </Grid>
          <Grid size={{ xs: 12, md: 2 }}>
            <TextInput label="Cidade" name="address.city" control={control} />
          </Grid>
          <Grid size={{ xs: 12, md: 1 }}>
            <TextInput label="UF" name="address.state" control={control} />
          </Grid>
          <Grid size={{ xs: 12, md: 3 }}>
            <TextInput
              label="Código IBGE"
              name="address.cityCode"
              control={control}
            />
          </Grid>
        </Grid>

        <Typography variant="subtitle2" gutterBottom>
          Regime tributário
        </Typography>
        <Grid container spacing={2} mb={2}>
          <Grid size={{ xs: 12, md: 6 }}>
            <SelectInput
              label="Regime tributário"
              name="taxRegime"
              control={control}
              options={TAX_REGIME_OPTIONS.map((o) => ({
                label: o.label,
                value: o.value,
              }))}
            />
          </Grid>
        </Grid>

        <Typography variant="subtitle2" gutterBottom>
          Atividades econômicas (CNAE)
        </Typography>
        <Box display="flex" flexDirection="column" gap={1} mb={2}>
          {fields.map((field, index) => (
            <Box key={field.id} display="flex" gap={1} alignItems="center">
              <TextInput
                label="Código CNAE"
                name={`economicActivities.${index}.code`}
                control={control}
              />
              <SelectInput
                label="Principal"
                name={`economicActivities.${index}.isMain`}
                control={control}
                options={[
                  { label: 'Sim', value: 'true' },
                  { label: 'Não', value: 'false' },
                ]}
              />
              {fields.length > 1 && (
                <IconButton
                  color="error"
                  onClick={() => remove(index)}
                  aria-label="Remover CNAE"
                >
                  <DeleteOutlineIcon />
                </IconButton>
              )}
            </Box>
          ))}
          <Button
            startIcon={<AddIcon />}
            size="small"
            onClick={() => append({ code: '', isMain: 'false' })}
            sx={{ alignSelf: 'flex-start' }}
          >
            Adicionar CNAE
          </Button>
        </Box>

        <Typography variant="subtitle2" gutterBottom>
          Parâmetros NFS-e
        </Typography>
        <Grid container spacing={2} mb={2}>
          <Grid size={{ xs: 12, md: 4 }}>
            <TextInput
              label="Código federal do serviço (LC 116)"
              name="federalServiceCode"
              control={control}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <TextInput
              label="Código nacional de tributação"
              name="nationalTaxationCode"
              control={control}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <TextInput
              label="Código do serviço no município"
              name="cityServiceCode"
              control={control}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <TextInput label="Código NBS" name="nbsCode" control={control} />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <TextInput label="CNAE do serviço" name="cnaeCode" control={control} />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <SelectInput
              label="Tipo de tributação"
              name="taxationType"
              control={control}
              options={TAXATION_TYPE_OPTIONS.map((o) => ({
                label: o.label,
                value: o.value,
              }))}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <SelectInput
              label="Local da tributação"
              name="taxLocation"
              control={control}
              options={TAX_LOCATION_OPTIONS.map((o) => ({
                label: o.label,
                value: o.value,
              }))}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <TextInput
              label="Alíquota ISS (decimal, ex: 0.05)"
              name="issRate"
              control={control}
              type="number"
            />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <SelectInput
              label="ISS retido"
              name="issWithheld"
              control={control}
              options={[
                { label: 'Não', value: 'false' },
                { label: 'Sim', value: 'true' },
              ]}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <TextInput label="Série RPS" name="rpsSeries" control={control} />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <TextInput
              label="Número RPS"
              name="rpsNumber"
              control={control}
              type="number"
            />
          </Grid>
        </Grid>

        <Typography variant="subtitle2" gutterBottom>
          Certificado digital A1
        </Typography>
        <Box display="flex" flexDirection="column" gap={2}>
          {hasCertificate && !certificateFile && (
            <Chip
              label="Certificado já cadastrado"
              color="info"
              size="small"
              sx={{ alignSelf: 'flex-start' }}
            />
          )}
          <Button
            variant="outlined"
            component="label"
            sx={{ alignSelf: 'flex-start' }}
          >
            {certificateFile ? certificateFile.name : 'Selecionar arquivo .pfx'}
            <input
              type="file"
              hidden
              accept=".pfx,.p12"
              onChange={({ target }) => {
                onCertificateChange(target.files?.[0] ?? null);
                if (target) target.value = '';
              }}
            />
          </Button>
          <TextInput
            label="Senha do certificado"
            name="certificatePassword"
            control={control}
            type="password"
          />
        </Box>
      </CardContent>
    </Card>
  );
}

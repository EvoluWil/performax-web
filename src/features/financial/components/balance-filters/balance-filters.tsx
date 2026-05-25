import { AutocompleteInput, DateInput } from '@/components/inputs';
import { FormResourceOption } from '@/hooks/use-form-resources';
import { ResourceKey } from '@/services/form-resources.service';
import { Box, Button, CircularProgress, Grid, Typography } from '@mui/material';
import { Control } from 'react-hook-form';
import { BalanceFilterDto } from '../../pages/balance/balance.hook';

type Props = {
  control: Control<BalanceFilterDto>;
  options: Partial<Record<ResourceKey, FormResourceOption[]>>;
  loading: boolean;
  onApply: () => void;
  onClear: () => void;
};

export function BalanceFilters({
  control,
  options,
  loading,
  onApply,
  onClear,
}: Props) {
  return (
    <Box>
      <Typography variant="h6" color="primary" fontWeight="bold" mb={2}>
        Filtros
      </Typography>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <DateInput control={control} name="dateFrom" label="Data início *" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <DateInput control={control} name="dateTo" label="Data fim *" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 2 }}>
          <AutocompleteInput
            control={control}
            name="flow"
            label="Fluxo"
            options={[
              { value: 'ALL', label: 'Todos' },
              { value: 'IN', label: 'Entrada' },
              { value: 'OUT', label: 'Saída' },
            ]}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <AutocompleteInput
            control={control}
            name="segmentId"
            label="Segmento"
            options={[
              { value: '', label: 'Todos' },
              ...(options.financeSegments ?? []),
            ]}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <AutocompleteInput
            control={control}
            name="categoryId"
            label="Categoria"
            options={[
              { value: '', label: 'Todas' },
              ...(options.financeCategories ?? []),
            ]}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <AutocompleteInput
            control={control}
            name="typeId"
            label="Centro de Custo"
            options={[
              { value: '', label: 'Todos' },
              ...(options.financeTypes ?? []),
            ]}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <AutocompleteInput
            control={control}
            name="bankId"
            label="Banco"
            options={[
              { value: '', label: 'Todos' },
              ...(options.financeBanks ?? []),
            ]}
          />
        </Grid>
      </Grid>
      <Box display="flex" justifyContent="flex-end" gap={2} mt={2}>
        <Button variant="outlined" onClick={onClear} disabled={loading}>
          Limpar
        </Button>
        <Button
          variant="contained"
          onClick={onApply}
          disabled={loading}
          startIcon={
            loading ? <CircularProgress size={16} color="inherit" /> : undefined
          }
        >
          Aplicar Filtros
        </Button>
      </Box>
    </Box>
  );
}

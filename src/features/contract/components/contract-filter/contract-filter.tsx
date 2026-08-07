import { AutocompleteInput } from '@/components/inputs';
import { Box, Button, Divider, Paper, Typography } from '@mui/material';
import { ContractFilterDto } from '../../schemas/contract.schema';
import { useContractFilter } from './contract-filter.hook';

type ContractFilterProps = {
  open: boolean;
  onFilter: (data: ContractFilterDto) => void;
  loading?: boolean;
  values?: ContractFilterDto;
};

export const ContractFilter: React.FC<ContractFilterProps> = ({
  open,
  onFilter,
  loading = false,
  values,
}) => {
  const { control, handleFilter, options, setSearch, isLoading, fieldAccess } =
    useContractFilter(onFilter, values);

  if (!open) return null;

  return (
    <Paper variant="outlined" sx={{ p: 2, overflowX: 'auto', my: 2 }}>
      <Typography variant="h6" fontWeight={600} gutterBottom>
        Filtros para contratos
      </Typography>
      <Divider sx={{ mb: 2 }} />

      <Box display="flex" flexWrap="wrap" gap={2}>
        {fieldAccess.clientIds && (
          <Box sx={{ minWidth: 280, flex: 1 }}>
            <AutocompleteInput
              name="clientIds"
              control={control}
              label="Cliente"
              multiple
              options={options.clients ?? []}
              loading={isLoading}
              onInputChange={(v) => setSearch('clients', v)}
            />
          </Box>
        )}
        {fieldAccess.typeIds && (
          <Box sx={{ minWidth: 280, flex: 1 }}>
            <AutocompleteInput
              name="typeIds"
              control={control}
              label="Tipo de contrato"
              multiple
              options={options.contractTypes ?? []}
              loading={isLoading}
              onInputChange={(v) => setSearch('contractTypes', v)}
            />
          </Box>
        )}
      </Box>

      <Box display="flex" justifyContent="flex-end" mt={2}>
        <Button variant="contained" onClick={handleFilter} loading={loading}>
          Aplicar filtros
        </Button>
      </Box>
    </Paper>
  );
};

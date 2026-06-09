import { SelectInput } from '@/components/inputs';
import { Box, Button, Divider, Paper, Typography } from '@mui/material';
import { ContractFilterDto } from '../../schemas/contract.schema';
import { useContractFilter } from './contract-filter.hook';

type ContractFilterProps = {
  open: boolean;
  onFilter: (data: ContractFilterDto) => void;
  loading?: boolean;
};

export const ContractFilter: React.FC<ContractFilterProps> = ({
  open,
  onFilter,
  loading = false,
}) => {
  const { control, handleFilter, options } = useContractFilter(onFilter);

  if (!open) return null;

  return (
    <Paper variant="outlined" sx={{ p: 2, overflowX: 'auto', my: 2 }}>
      <Typography variant="h6" fontWeight={600} gutterBottom>
        Filtros para contratos
      </Typography>
      <Divider sx={{ mb: 2 }} />

      <Box display="flex" flexWrap="wrap" gap={2}>
        <Box sx={{ minWidth: 280, flex: 1 }}>
          <SelectInput
            name="clientId"
            control={control}
            label="Cliente"
            options={options.clients}
          />
        </Box>
        <Box sx={{ minWidth: 280, flex: 1 }}>
          <SelectInput
            name="typeId"
            control={control}
            label="Tipo de contrato"
            options={options.types}
          />
        </Box>
      </Box>

      <Box display="flex" justifyContent="flex-end" mt={2}>
        <Button variant="contained" onClick={handleFilter} loading={loading}>
          Aplicar filtros
        </Button>
      </Box>
    </Paper>
  );
};

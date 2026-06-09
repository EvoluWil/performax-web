import { BaseDrawer } from '@/components/drawer';
import {
  AutocompleteInput,
  CurrencyInput,
  DateInput,
  SelectInput,
  TextInput,
} from '@/components/inputs';
import { Box, Button, Typography } from '@mui/material';
import { Contract } from '../../types/contract';
import { useContractDrawer } from './contract.hook';

export type ContractDrawerProps = {
  open: boolean;
  onClose: () => void;
  contract: Contract | null;
  defaultClientId?: string;
  onSuccess?: () => void;
  onSaved?: (contract: Contract) => void;
};

export const ContractDrawer: React.FC<ContractDrawerProps> = (props) => {
  const {
    control,
    handleContract,
    loading,
    handleClose,
    open,
    editing,
    options,
    setSearch,
    selectedType,
    contractTypes,
  } = useContractDrawer(props);

  const typeOptions =
    contractTypes?.map((t) => ({ value: t.id, label: t.name })) || [];

  return (
    <BaseDrawer
      open={open}
      setOpen={handleClose}
      height="auto"
      title={editing ? 'Editar Contrato' : 'Novo Contrato'}
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
          <AutocompleteInput
            label="Cliente"
            name="clientId"
            control={control}
            options={options.clients || []}
            onInputChange={(v) => setSearch('clients', v)}
            disabled={!!props.defaultClientId && !editing}
          />

          <SelectInput
            label="Tipo de contrato"
            name="typeId"
            control={control}
            options={typeOptions}
          />

          {selectedType?.lastAdjustmentPercentage != null && (
            <Typography variant="body2" color="text.secondary" width="100%">
              Último reajuste do tipo: {selectedType.lastAdjustmentPercentage}%
            </Typography>
          )}

          <CurrencyInput label="Valor" name="value" control={control} />

          <Box display="flex" gap={2} width="100%">
            <DateInput
              label="Início"
              name="startDate"
              control={control}
              sx={{ flex: 1 }}
            />
            <DateInput
              label="Término"
              name="endDate"
              control={control}
              sx={{ flex: 1 }}
            />
          </Box>

          <DateInput
            label="Data de vencimento"
            name="dueDate"
            control={control}
          />

          <TextInput
            label="Escopo"
            name="scope"
            control={control}
            multiline
            rows={4}
          />

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
              onClick={handleContract}
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

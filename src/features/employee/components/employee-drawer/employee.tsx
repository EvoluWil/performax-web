import { BaseDrawer } from '@/components/drawer';
import {
  AutocompleteInput,
  MaskInput,
  TextInput,
} from '@/components/inputs';
import { Employee } from '@/features/employee/types';
import { Box, Button } from '@mui/material';
import { useEmployeeDrawer } from './employee.hook';

export type EmployeeDrawerProps = {
  open: boolean;
  onClose: () => void;
  employee: Employee | null;
  initialName?: string;
  onCreated?: (employee: Employee) => void;
};

export const EmployeeDrawer: React.FC<EmployeeDrawerProps> = (props) => {
  const {
    control,
    handleEmployee,
    loading,
    handleClose,
    open,
    editing,
    clientOptions,
    handleClientSearch,
  } = useEmployeeDrawer(props);

  return (
    <BaseDrawer
      open={open}
      setOpen={handleClose}
      height="auto"
      title={editing ? 'Editar Funcionário' : 'Novo Funcionário'}
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
          <TextInput
            label="Nome do funcionário"
            name="name"
            control={control}
          />
          <MaskInput
            mask="999.999.999-99"
            label="CPF"
            name="cpf"
            control={control}
          />
          <AutocompleteInput
            label="Cliente (opcional)"
            name="clientId"
            control={control}
            options={clientOptions}
            onInputChange={handleClientSearch}
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
              onClick={handleEmployee}
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

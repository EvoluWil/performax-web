import { BaseDrawer } from '@/components/drawer';
import { TextInput } from '@/components/inputs';
import { Box, Button } from '@mui/material';
import { ContractType } from '../../types/contract-type';
import { useContractTypeDrawer } from './contract-type.hook';

export type ContractTypeDrawerProps = {
  open: boolean;
  onClose: () => void;
  contractType: ContractType | null;
  initialName?: string;
  onCreated?: (type: ContractType) => void;
};

export const ContractTypeDrawer: React.FC<ContractTypeDrawerProps> = (
  props,
) => {
  const { control, handleContractType, loading, handleClose, open, editing } =
    useContractTypeDrawer(props);

  return (
    <BaseDrawer
      open={open}
      setOpen={handleClose}
      height="auto"
      title={
        editing ? 'Editar Tipo de Contrato' : 'Novo Tipo de Contrato'
      }
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
            label="Nome do tipo de contrato"
            name="name"
            control={control}
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
              onClick={handleContractType}
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

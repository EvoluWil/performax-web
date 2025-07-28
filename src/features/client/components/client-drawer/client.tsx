import { BaseDrawer } from '@/components/drawer';
import { MaskInput, TextInput } from '@/components/inputs';
import { Client } from '@/features/client/types';
import { Box, Button } from '@mui/material';
import { useClientDrawer } from './client.hook';

export type ClientDrawerProps = {
  open: boolean;
  onClose: () => void;
  client: Client | null;
};

export const ClientDrawer: React.FC<ClientDrawerProps> = (props) => {
  const { control, handleClient, loading, handleClose, open, editing } =
    useClientDrawer(props);

  return (
    <BaseDrawer
      open={open}
      setOpen={handleClose}
      height="auto"
      title={editing ? 'Editar Cliente' : 'Novo Cliente'}
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
          <TextInput label="Nome do cliente" name="name" control={control} />
          <MaskInput
            mask="99.999.999/9999-99"
            label="CNPJ"
            name="cnpj"
            control={control}
          />
          <TextInput label="Endereço" name="address" control={control} />

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
              onClick={handleClient}
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

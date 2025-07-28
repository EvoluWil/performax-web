import { BaseDrawer } from '@/components/drawer';
import { MaskInput, TextInput } from '@/components/inputs';
import { User } from '@/types/user';
import { Box, Button } from '@mui/material';
import { useUserDrawer } from './user.hook';

export type UserDrawerProps = {
  open: boolean;
  onClose: () => void;
  user: User | null;
};

export const UserDrawer: React.FC<UserDrawerProps> = (props) => {
  const { control, handleUser, loading, handleClose, open, editing } =
    useUserDrawer(props);

  return (
    <BaseDrawer
      open={open}
      setOpen={handleClose}
      height="auto"
      title={editing ? 'Editar usuário' : 'Novo usuário'}
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
            label="Nome do usuário"
            name="name"
            control={control}
            disabled={editing}
          />
          <MaskInput
            mask="999.999.999-99"
            label="CPF"
            name="cpf"
            control={control}
            disabled={editing}
          />
          <TextInput
            label="E-mail"
            name="email"
            type="email"
            control={control}
            disabled={editing}
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
              onClick={handleUser}
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

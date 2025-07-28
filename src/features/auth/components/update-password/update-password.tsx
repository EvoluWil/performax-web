import { BaseDrawer } from '@/components/drawer';
import { TextInput } from '@/components/inputs';
import { Box, Button } from '@mui/material';
import { useUpdatePassword } from './update-password.hook';

export type UpdatePasswordDrawerProps = {
  open: boolean;
  onClose: () => void;
};

export const UpdatePassword: React.FC<UpdatePasswordDrawerProps> = (props) => {
  const { control, handleUpdatePassword, loading, handleClose, open } =
    useUpdatePassword(props);

  return (
    <BaseDrawer
      open={open}
      setOpen={handleClose}
      height="auto"
      title="Atualizar senha"
      content={
        <Box
          height="100%"
          gap={2}
          component="form"
          display="flex"
          alignItems="center"
          justifyContent="center"
          flexDirection="column"
        >
          <TextInput
            label="Senha atual"
            type="password"
            name="currentPassword"
            control={control}
          />
          <TextInput
            label="Nova senha"
            type="password"
            name="password"
            control={control}
          />
          <TextInput
            label="Confirme a senha"
            type="password"
            name="passwordConfirmation"
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
              onClick={handleUpdatePassword}
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

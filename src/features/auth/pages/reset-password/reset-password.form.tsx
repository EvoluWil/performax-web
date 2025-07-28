'use client';

import { TextInput } from '@/components/inputs';
import { Box, Button } from '@mui/material';
import { useResetPassword } from './reset-password.hook';

export const ResetPasswordForm = () => {
  const { control, loading, handleResetPassword } = useResetPassword();

  return (
    <Box
      component="form"
      onSubmit={handleResetPassword}
      display="flex"
      flexDirection="column"
      my={4}
      gap={4}
      width="100%"
    >
      <TextInput
        control={control}
        label="Senha"
        name="password"
        type="password"
      />

      <TextInput
        control={control}
        label="Confirmação de Senha"
        name="passwordConfirmation"
        type="password"
      />

      <Button
        type="submit"
        fullWidth
        variant="contained"
        sx={{ mt: 4, mb: -1 }}
        disabled={loading}
        loading={loading}
      >
        Confirmar
      </Button>
    </Box>
  );
};

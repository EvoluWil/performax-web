'use client';

import { TextInput } from '@/components/inputs';
import { Box, Button } from '@mui/material';
import { useForgotPassword } from './forgot-password.hook';

export const ForgotPasswordForm = () => {
  const { control, loading, handleSendEmail } = useForgotPassword();

  return (
    <Box
      component="form"
      onSubmit={handleSendEmail}
      display="flex"
      flexDirection="column"
      my={4}
      gap={4}
      width="100%"
    >
      <TextInput
        control={control}
        label="Email"
        name="email"
        type="email"
        autoComplete="email"
        autoFocus
      />
      <Button
        type="submit"
        fullWidth
        variant="contained"
        sx={{ mt: 4, mb: -1 }}
        disabled={loading}
        loading={loading}
      >
        Enviar
      </Button>
    </Box>
  );
};

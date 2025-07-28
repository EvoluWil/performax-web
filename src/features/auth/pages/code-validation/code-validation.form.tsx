'use client';

import { TextInput } from '@/components/inputs';
import { Box, Button } from '@mui/material';
import { useCodeValidation } from './code-validation.hook';

export const CodeValidationForm = () => {
  const { control, loading, handleCodeValidation } = useCodeValidation();

  return (
    <Box
      component="form"
      onSubmit={handleCodeValidation}
      display="flex"
      flexDirection="column"
      my={4}
      gap={4}
      width="100%"
    >
      <TextInput control={control} label="Código" name="code" autoFocus />
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

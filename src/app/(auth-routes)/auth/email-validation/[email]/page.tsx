'use client';

import { CodeValidationForm } from '@/features/auth/pages';
import { useWhiteLabel } from '@/providers/white-label';
import { Box, Typography } from '@mui/material';
import Image from 'next/image';

export default function EmailValidationPage() {
  const { whiteLabel } = useWhiteLabel();
  return (
    <Box
      sx={{
        p: 4,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-evenly',
        height: '100%',
        maxWidth: '400px',
        mx: 'auto',
      }}
    >
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
      >
        <Image
          src={whiteLabel.logoContrast}
          width="100"
          height="100"
          alt={whiteLabel.name}
        />
        <Typography
          variant="body2"
          mx="auto"
          pl={1}
          my={2}
          fontWeight="400"
          textAlign="center"
        >
          Insira o código que enviamos para o seu email
        </Typography>
      </Box>

      <CodeValidationForm />
    </Box>
  );
}

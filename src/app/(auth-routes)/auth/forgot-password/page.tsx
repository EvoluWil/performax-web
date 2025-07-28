import { ForgotPasswordForm } from '@/features/auth/pages';
import { Box, Typography } from '@mui/material';
import Image from 'next/image';

export default function ForgotPasswordPage() {
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
          src="/images/brand/logo.png"
          width="100"
          height="100"
          alt="Performax!"
        />
        <Typography
          variant="body2"
          mx="auto"
          pl={1}
          my={2}
          fontWeight="400"
          textAlign="center"
        >
          Vamos te enviar um email com um código para redefinir sua senha
        </Typography>
      </Box>

      <ForgotPasswordForm />
    </Box>
  );
}

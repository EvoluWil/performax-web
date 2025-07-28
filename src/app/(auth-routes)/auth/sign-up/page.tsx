import { SignUpForm } from '@/features/auth/pages';
import { Box, Container, Typography } from '@mui/material';

export default function SignUpPage() {
  const random = Math.floor(Math.random() * 3) + 1;

  return (
    <Box
      sx={{
        backgroundImage: `url(/images/background/auth-background-${random}.jpg)`,
        backgroundRepeat: 'no-repeat',
        backgroundSize: 'cover',
        backgroundPosition: 'bottom',
      }}
      p={{ xs: 2, md: 4 }}
    >
      <Box
        sx={{
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          boxShadow: '5px 5px 20px 0px rgba(0, 0, 0, 0.2)',
          borderRadius: 2,
        }}
        p={{ xs: 2, md: 4 }}
        component={Container}
      >
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          mb={{ xs: 2, md: 4 }}
        >
          <Typography
            variant="h6"
            mx="auto"
            pl={1}
            mt={1}
            fontWeight="700"
            color="primary.main"
          >
            Performax!
          </Typography>
          <Typography
            variant="body2"
            mx="auto"
            pl={1}
            mt={1}
            fontWeight="400"
            textAlign="center"
          >
            Crie sua conta, é rápido e fácil!
          </Typography>
        </Box>
        <SignUpForm />
      </Box>
    </Box>
  );
}

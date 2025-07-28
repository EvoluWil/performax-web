import { SignInForm } from '@/features/auth/pages';
import { Box, Grid, Paper, Typography } from '@mui/material';
import Image from 'next/image';

export default function SignInPage() {
  const random = Math.floor(Math.random() * 3) + 1;

  return (
    <Grid
      container
      component="main"
      sx={{
        minHeight: '100vh',
        backgroundImage: `url(/images/background/auth-background-${random}.jpg)`,
        backgroundRepeat: 'no-repeat',
        backgroundSize: 'cover',
        backgroundPosition: 'bottom',
      }}
    >
      <Grid
        size={{
          xs: false,
          sm: 4,
          md: 7,
        }}
      />
      <Grid
        size={{
          xs: 12,
          sm: 8,
          md: 5,
        }}
        component={Paper}
        elevation={6}
        square
        sx={{
          backgroundColor: 'rgba(255, 255, 255, 0.8)',
        }}
      >
        <Box
          sx={{
            p: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'space-evenly',
            height: '100%',
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
              A melhor plataforma de gestão e controle financeiro e operacional
              para o seu negócio
            </Typography>
          </Box>

          <SignInForm />
        </Box>
      </Grid>
    </Grid>
  );
}

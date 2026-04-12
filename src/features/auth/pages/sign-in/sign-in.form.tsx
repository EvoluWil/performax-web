'use client';

import { Link, TextInput } from '@/components/inputs';
import { SelectCompanyModal } from '@/components/modal';
import { BACKGROUND_IMAGES } from '@/constants/whitelabel/background.constant';
import { useWhiteLabel } from '@/providers/white-label';
import { MailOutline, VpnKeyOutlined } from '@mui/icons-material';
import { Box, Button, Grid, Paper, Typography } from '@mui/material';
import Image from 'next/image';
import { useSignIn } from './sign-in.hook';

const random = Math.floor(Math.random() * BACKGROUND_IMAGES.length) + 1;

export const SignInForm = () => {
  const {
    control,
    handleSignIn,
    loading,
    handleCloseSelectCompanyModal,
    selectCompanyModalOpen,
    handleSelectCompany,
  } = useSignIn();

  const { whiteLabel } = useWhiteLabel();
  const logoSrc = whiteLabel.logo;
  const companyName = whiteLabel.logo ? '' : whiteLabel.name;
  const hasCustomWhiteLabel = !!whiteLabel.id;

  const randomBackground = BACKGROUND_IMAGES[random - 1];

  return (
    <Grid
      container
      component="main"
      sx={{
        backgroundImage: `url(${randomBackground})`,
        backgroundRepeat: 'no-repeat',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
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
          }}
        >
          <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
          >
            <Image src={logoSrc} width={100} height={100} alt={companyName} />
            <Typography
              variant="h6"
              mx="auto"
              pl={1}
              mt={1}
              fontWeight="700"
              color="primary.main"
            >
              {companyName}
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

          <Box
            component="form"
            onSubmit={handleSignIn}
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
              icon={<MailOutline />}
            />
            <TextInput
              control={control}
              label="Senha"
              name="password"
              type="password"
              autoComplete="current-password"
              icon={<VpnKeyOutlined />}
            />
            <Box
              display="flex"
              alignItems="center"
              justifyContent="space-between"
              flexWrap="wrap"
              mt={-2}
            >
              <Link
                href="/auth/forgot-password"
                mui={{
                  variant: 'caption',
                  ml: 'auto',
                  whiteSpace: 'nowrap',
                  mt: 0.5,
                }}
              >
                Esqueceu sua senha?
              </Link>
            </Box>
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 4, mb: -1 }}
              disabled={loading}
              loading={loading}
            >
              Entrar
            </Button>

            {!hasCustomWhiteLabel && (
              <Link
                href="/auth/sign-up"
                mui={{ variant: 'caption', textAlign: 'center' }}
              >
                Não tem uma conta? Cadastre-se
              </Link>
            )}
          </Box>

          {selectCompanyModalOpen && (
            <SelectCompanyModal
              open={selectCompanyModalOpen}
              onClose={handleCloseSelectCompanyModal}
              onSuccess={handleSelectCompany}
            />
          )}
        </Box>
      </Grid>
    </Grid>
  );
};

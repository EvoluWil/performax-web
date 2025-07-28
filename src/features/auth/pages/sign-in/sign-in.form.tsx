'use client';

import { Link, TextInput } from '@/components/inputs';
import { SelectCompanyModal } from '@/components/modal';
import { MailOutline, VpnKeyOutlined } from '@mui/icons-material';
import { Box, Button } from '@mui/material';
import { useSignIn } from './sign-in.hook';

export const SignInForm = () => {
  const {
    control,
    handleSignIn,
    loading,
    handleCloseSelectCompanyModal,
    selectCompanyModalOpen,
    handleSelectCompany,
  } = useSignIn();

  return (
    <>
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

        <Link
          href="/auth/sign-up"
          mui={{ variant: 'caption', textAlign: 'center' }}
        >
          Não tem uma conta? Cadastre-se
        </Link>
      </Box>

      {selectCompanyModalOpen && (
        <SelectCompanyModal
          open={selectCompanyModalOpen}
          onClose={handleCloseSelectCompanyModal}
          onSuccess={handleSelectCompany}
        />
      )}
    </>
  );
};

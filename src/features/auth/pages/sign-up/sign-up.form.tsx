'use client';

import { MaskInput, TextInput } from '@/components/inputs';
import { PasswordStrength } from '@/features/auth/components';
import {
  ApartmentOutlined,
  BadgeOutlined,
  EmailOutlined,
  PersonOutlined,
  VpnKeyOutlined,
} from '@mui/icons-material';
import { Box, Button, Divider, Grid, Typography } from '@mui/material';
import { useSignUp } from './sign-up.hook';

export const SignUpForm = () => {
  const { control, handleCreateAccount, loading, password } = useSignUp();

  return (
    <Box
      borderRadius={1}
      component={'form'}
      onSubmit={handleCreateAccount}
      display="flex"
      flexDirection="column"
      gap={2}
      width="100%"
    >
      <Typography variant="h6" color="text.secondary">
        Dados pessoais
      </Typography>
      <Grid container>
        <TextInput
          control={control}
          name="profile.name"
          label="Nome completo"
          placeholder="Ex: João da Silva"
          icon={<PersonOutlined />}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 4 }}>
        <TextInput
          control={control}
          name="profile.email"
          label="E-mail"
          placeholder="Ex: exemplo@email.com"
          icon={<EmailOutlined />}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 4 }}>
        <MaskInput
          mask="999.999.999-99"
          control={control}
          name="profile.cpf"
          label="CPF"
          placeholder="Ex: 123.456.789-10"
          icon={<BadgeOutlined />}
        />
      </Grid>
      <Divider sx={{ my: 4 }} />
      <Typography variant="h6" color="text.secondary">
        Dados da empresa
      </Typography>

      <TextInput
        control={control}
        name="company.name"
        label="Nome fantasia da empresa"
        placeholder="Ex: Minha Empresa LTDA"
        icon={<ApartmentOutlined />}
      />

      <Divider sx={{ my: 4 }} />
      <Typography variant="h6" color="text.secondary">
        Segurança de acesso
      </Typography>

      <Box
        display="flex"
        gap={2}
        flexDirection={{ xs: 'column', md: 'row' }}
        width="100%"
      >
        <Box
          display="flex"
          flexDirection="column"
          gap={2}
          width={{ xs: '100%', md: '50%' }}
        >
          <TextInput
            control={control}
            label="Senha"
            name="credentials.password"
            type="password"
            placeholder="Digite uma senha forte"
            icon={<VpnKeyOutlined />}
          />
          <Box display={{ xs: 'block', md: 'none' }}>
            <PasswordStrength password={password} />
          </Box>

          <TextInput
            control={control}
            label="Confirmação de Senha"
            name="credentials.passwordConfirmation"
            type="password"
            placeholder="Repita a senha"
            icon={<VpnKeyOutlined />}
          />
        </Box>
        <Box display={{ xs: 'none', md: 'flex' }} width="50%">
          <PasswordStrength password={password} />
        </Box>
      </Box>
      <Box
        display="flex"
        justifyContent={{
          xs: 'center',
          md: 'flex-end',
        }}
        flexDirection={{
          xs: 'column-reverse',
          md: 'row',
        }}
        flexWrap="wrap"
        gap={2}
      >
        <Button
          variant="contained"
          color="secondary"
          size="large"
          type="submit"
          disabled={loading}
          loading={loading}
          sx={{ width: { xs: '100%', md: 'auto' } }}
        >
          Realizar cadastro
        </Button>
      </Box>
    </Box>
  );
};

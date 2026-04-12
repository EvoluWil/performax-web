'use client';
import { createDynamicTheme } from '@/config/theme';
import { CompanyWhiteLabel } from '@/types/company';
import { CssBaseline, ThemeProvider } from '@mui/material';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ptBR } from 'date-fns/locale';
import { useMemo } from 'react';
import { ToastContainer } from 'react-toastify';
import AuthProvider from './auth';
import { WhiteLabelProvider, useWhiteLabel } from './white-label';

const queryClient = new QueryClient();

function ThemedApp({ children }: { children: React.ReactNode }) {
  const { whiteLabel } = useWhiteLabel();
  const dynamicTheme = useMemo(
    () =>
      createDynamicTheme(whiteLabel.primaryColor, whiteLabel.secondaryColor),
    [whiteLabel.primaryColor, whiteLabel.secondaryColor],
  );

  return (
    <ThemeProvider theme={dynamicTheme}>
      <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
        <AuthProvider>{children}</AuthProvider>
      </LocalizationProvider>
    </ThemeProvider>
  );
}

export const AppProviders = ({
  children,
  initialWhiteLabel,
}: {
  children: React.ReactNode;
  initialWhiteLabel?: CompanyWhiteLabel | null;
}) => {
  return (
    <QueryClientProvider client={queryClient}>
      <AppRouterCacheProvider>
        <ToastContainer />
        <CssBaseline />
        <WhiteLabelProvider initialWhiteLabel={initialWhiteLabel}>
          <ThemedApp>{children}</ThemedApp>
        </WhiteLabelProvider>
      </AppRouterCacheProvider>
    </QueryClientProvider>
  );
};

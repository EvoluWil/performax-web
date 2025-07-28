import { AppProviders } from '@/providers';
import { Box } from '@mui/material';
import type { Metadata } from 'next';
import { Poppins } from 'next/font/google';

const poppins = Poppins({
  weight: ['300', '400', '500', '700'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-poppins',
});

export const metadata: Metadata = {
  title: 'Performax',
  description:
    'A melhor plataforma de gestão e controle financeiro e operacional para o seu negócio',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={`${poppins.variable}`}>
        <AppProviders>
          <Box display="flex" flexDirection="column" minHeight="100vh">
            {children}
          </Box>
        </AppProviders>
      </body>
    </html>
  );
}

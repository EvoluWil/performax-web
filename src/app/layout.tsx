import { AppProviders } from '@/providers';
import { CompanyWhiteLabel } from '@/types/company';
import { Box } from '@mui/material';
import type { Metadata } from 'next';
import { Poppins } from 'next/font/google';
import { cookies } from 'next/headers';

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

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const companyRaw = cookieStore.get('@performax:default-company')?.value;
  const initialWhiteLabel: CompanyWhiteLabel | null = companyRaw
    ? ((JSON.parse(companyRaw) as { whiteLabel?: CompanyWhiteLabel })
        .whiteLabel ?? null)
    : null;

  return (
    <html lang="pt-BR">
      <body className={`${poppins.variable}`}>
        <AppProviders initialWhiteLabel={initialWhiteLabel}>
          <Box display="flex" flexDirection="column" minHeight="100vh">
            {children}
          </Box>
        </AppProviders>
      </body>
    </html>
  );
}

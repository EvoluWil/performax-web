import { Header } from '@/components/display';
import { getUserSession } from '@/utils/session';
import { Box } from '@mui/material';
import { redirect } from 'next/navigation';
import { PropsWithChildren } from 'react';

export default async function PanelLayout({ children }: PropsWithChildren) {
  const user = await getUserSession();

  if (!user) {
    return redirect('/sign-in');
  }

  return (
    <>
      <Header />
      <Box
        component="main"
        p={2}
        pl={{ xs: 2, sm: 11 }}
        mt={{ xs: '72px', sm: '100px' }}
      >
        {children}
      </Box>
    </>
  );
}

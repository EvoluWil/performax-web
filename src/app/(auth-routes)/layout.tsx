import { Footer } from '@/components/display';
import { getUserSession } from '@/utils/session';
import { Box } from '@mui/material';
import { redirect } from 'next/navigation';
import { PropsWithChildren } from 'react';

export default async function AuthLayout({ children }: PropsWithChildren) {
  const user = await getUserSession();

  if (user) {
    return redirect('/panel');
  }

  return (
    <>
      <Box component="main">{children}</Box>
      <Footer />
    </>
  );
}

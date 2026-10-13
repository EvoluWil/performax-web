'use client';

import { IndicatorTitle } from '@/features/dashboard/components/indicator';
import { Box, Button, Paper } from '@mui/material';
import Link from 'next/link';
import { ReactNode } from 'react';

type SectionProps = {
  id: string;
  title: string;
  hint?: string;
  href?: string;
  actionLabel?: string;
  children: ReactNode;
};

export function Section({ id, title, hint, href, actionLabel, children }: SectionProps) {
  return (
    <Paper id={id} component="section" sx={{ p: 2, scrollMarginTop: 120 }}>
      <Box
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        gap={2}
        flexWrap="wrap"
        mb={2}
      >
        <IndicatorTitle title={title} hint={hint} variant="h5" />
        {href && actionLabel ? (
          <Button component={Link} href={href} variant="outlined">
            {actionLabel}
          </Button>
        ) : null}
      </Box>
      {children}
    </Paper>
  );
}

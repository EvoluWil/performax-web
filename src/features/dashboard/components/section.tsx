'use client';

import { Box, Button, Typography } from '@mui/material';
import Link from 'next/link';
import { ReactNode } from 'react';

type SectionProps = {
  id: string;
  title: string;
  href?: string;
  actionLabel?: string;
  children: ReactNode;
};

export function Section({ id, title, href, actionLabel, children }: SectionProps) {
  return (
    <Box id={id} component="section" sx={{ scrollMarginTop: 120 }}>
      <Box
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        gap={2}
        flexWrap="wrap"
        mb={2}
      >
        <Typography variant="h5" color="primary" fontWeight="bold">
          {title}
        </Typography>
        {href && actionLabel ? (
          <Button component={Link} href={href} variant="outlined">
            {actionLabel}
          </Button>
        ) : null}
      </Box>
      {children}
    </Box>
  );
}

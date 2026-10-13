'use client';

import { InfoOutlined } from '@mui/icons-material';
import { Box, IconButton, Tooltip, Typography } from '@mui/material';
import { ReactNode } from 'react';

export function IndicatorHint({ title, hint }: { title: string; hint: string }) {
  return (
    <Tooltip title={hint}>
      <IconButton size="small" aria-label={`Sobre ${title}`} sx={{ color: 'text.secondary' }}>
        <InfoOutlined fontSize="small" />
      </IconButton>
    </Tooltip>
  );
}

export function IndicatorTitle({
  title,
  hint,
  variant = 'subtitle1',
}: {
  title: string;
  hint?: string;
  variant?: 'h5' | 'h6' | 'subtitle1';
}) {
  return (
    <Box display="flex" alignItems="center" gap={0.5} minWidth={0}>
      <Typography variant={variant} color="primary" fontWeight="bold">
        {title}
      </Typography>
      {hint ? <IndicatorHint title={title} hint={hint} /> : null}
    </Box>
  );
}

export function IndicatorEmpty({
  message,
  icon,
}: {
  message: string;
  icon?: ReactNode;
}) {
  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      textAlign="center"
      gap={1}
      py={2}
      minHeight={96}
    >
      {icon}
      <Typography
        variant="body2"
        color="text.secondary"
        sx={{ overflow: 'visible', whiteSpace: 'normal' }}
      >
        {message}
      </Typography>
    </Box>
  );
}

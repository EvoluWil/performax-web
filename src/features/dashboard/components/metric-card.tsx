'use client';

import { Box, Typography } from '@mui/material';
import Link from 'next/link';

export type MetricTone = 'primary' | 'success' | 'error' | 'warning';

type MetricCardProps = {
  label: string;
  value: string;
  detail?: string;
  href?: string;
  tone?: MetricTone;
};

export function MetricCard({
  label,
  value,
  detail,
  href,
  tone = 'primary',
}: MetricCardProps) {
  const ink = tone === 'primary' ? 'primary.main' : `${tone}.dark`;
  const body = (
    <Box
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      textAlign="center"
      gap={0.5}
      p={2}
      width="100%"
      minHeight={120}
      bgcolor={tone === 'primary' ? 'background.paper' : `${tone}.light`}
      borderRadius={2}
    >
      <Typography
        variant="h6"
        color={ink}
        sx={{ overflow: 'visible', whiteSpace: 'normal' }}
      >
        {label}
      </Typography>
      <Typography
        variant="h4"
        color={ink}
        fontWeight="bold"
        sx={{ overflow: 'visible', whiteSpace: 'normal', wordBreak: 'break-word', lineHeight: 1.2 }}
      >
        {value}
      </Typography>
      {detail ? (
        <Typography
          variant="body2"
          color={ink}
          sx={{ overflow: 'visible', whiteSpace: 'normal' }}
        >
          {detail}
        </Typography>
      ) : null}
    </Box>
  );

  return (
    <Box
      component={href ? Link : 'div'}
      href={href}
      sx={{
        display: 'flex',
        flex: '1 1 200px',
        minWidth: { xs: '100%', sm: 200 },
        textDecoration: 'none',
        color: 'inherit',
      }}
    >
      {body}
    </Box>
  );
}

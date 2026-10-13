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
      textAlign="center"
      p={2}
      bgcolor={tone === 'primary' ? 'background.paper' : `${tone}.light`}
      borderRadius={2}
      minWidth={180}
      flex="1 1 180px"
      height="100%"
    >
      <Typography variant="h6" color={ink}>
        {label}
      </Typography>
      <Typography variant="h4" color={ink} fontWeight="bold">
        {value}
      </Typography>
      {detail ? (
        <Typography variant="body2" color={ink}>
          {detail}
        </Typography>
      ) : null}
    </Box>
  );

  if (!href) return body;

  return (
    <Box
      component={Link}
      href={href}
      sx={{
        display: 'flex',
        flex: '1 1 180px',
        minWidth: 180,
        textDecoration: 'none',
        color: 'inherit',
      }}
    >
      {body}
    </Box>
  );
}

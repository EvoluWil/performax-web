'use client';

import { Chip } from '@mui/material';

type StatusChipProps = {
  label: string;
  color: string;
};

export function StatusChip({ label, color }: StatusChipProps) {
  return (
    <Chip
      label={label}
      size="small"
      variant="outlined"
      sx={{ color, borderColor: color }}
    />
  );
}

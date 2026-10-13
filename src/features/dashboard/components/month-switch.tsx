'use client';

import { ChevronLeft, ChevronRight } from '@mui/icons-material';
import { Box, IconButton, Typography } from '@mui/material';

type MonthSwitchProps = {
  label: string;
  onPrevious: () => void;
  onNext: () => void;
  disableNext?: boolean;
};

export function MonthSwitch({
  label,
  onPrevious,
  onNext,
  disableNext,
}: MonthSwitchProps) {
  return (
    <Box display="flex" alignItems="center" gap={0.5}>
      <IconButton size="small" aria-label="Mês anterior" onClick={onPrevious}>
        <ChevronLeft />
      </IconButton>
      <Typography
        variant="body2"
        fontWeight="medium"
        minWidth={130}
        textAlign="center"
      >
        {label}
      </Typography>
      <IconButton
        size="small"
        aria-label="Próximo mês"
        onClick={onNext}
        disabled={disableNext}
      >
        <ChevronRight />
      </IconButton>
    </Box>
  );
}

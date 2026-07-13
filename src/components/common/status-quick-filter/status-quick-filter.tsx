'use client';

import { Box, Button } from '@mui/material';

type StatusOption = {
  value: string;
  label: string;
};

type Props = {
  options: StatusOption[];
  value: string[];
  onChange: (value: string[]) => void;
};

export function StatusQuickFilter({ options, value, onChange }: Props) {
  const toggle = (optionValue: string) => {
    if (value.includes(optionValue)) {
      onChange(value.filter((v) => v !== optionValue));
      return;
    }
    onChange([...value, optionValue]);
  };

  return (
    <Box display="flex" flexWrap="wrap" gap={1}>
      {options.map((option) => (
        <Button
          key={option.value}
          size="small"
          variant={value.includes(option.value) ? 'contained' : 'outlined'}
          onClick={() => toggle(option.value)}
        >
          {option.label}
        </Button>
      ))}
    </Box>
  );
}

'use client';

import { Box, Button } from '@mui/material';

type SectionNavProps = {
  items: { id: string; label: string }[];
  active: string;
  onSelect: (id: string) => void;
};

export function SectionNav({ items, active, onSelect }: SectionNavProps) {
  return (
    <Box display="flex" flexWrap="wrap" gap={1}>
      {items.map((item) => (
        <Button
          key={item.id}
          size="small"
          variant={active === item.id ? 'contained' : 'outlined'}
          onClick={() => onSelect(item.id)}
        >
          {item.label}
        </Button>
      ))}
    </Box>
  );
}

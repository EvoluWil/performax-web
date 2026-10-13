import { Theme } from '@mui/material/styles';

export function statusColor(color: string | undefined, theme: Theme) {
  if (!color || color === 'default') return theme.palette.primary.main;
  if (color === 'error.main') return theme.palette.error.main;
  if (color === 'gray') return theme.palette.grey[400];
  return color;
}

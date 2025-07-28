import { LinearProgress, styled, Theme } from '@mui/material';

interface PasswordStrengthProps {
  value: number;
}

export const PasswordStrengthLabel = styled('span')<PasswordStrengthProps>`
  font-weight: bold;
  color: ${({ theme, value }) => handleBarColor(theme, value)};
`;

export const PasswordStrengthBar = styled(LinearProgress)`
  margin-top: ${({ theme }) => theme.spacing()};
  &.MuiLinearProgress-root {
    background-color: ${({ theme }) => theme.palette.grey[200]};
  }
  .MuiLinearProgress-bar {
    background-color: ${({ theme, value }) => handleBarColor(theme, value)};
  }
`;

const handleBarColor = (theme: Theme, value = 0) => {
  if (value === 0) {
    return theme.palette.info.main;
  }
  if (value <= 25) {
    return theme.palette.error.main;
  }
  if (value > 25 && value <= 50) {
    return theme.palette.warning.main;
  }

  return theme.palette.success.main;
};

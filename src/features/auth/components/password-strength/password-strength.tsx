'use client';

import { Typography } from '@mui/material';
import { passwordStrength } from 'check-password-strength';
import React from 'react';
import {
  PasswordStrengthBar,
  PasswordStrengthLabel,
} from './password-strength.style';

interface PasswordStrengthProps {
  password: string;
}

export const PasswordStrength: React.FC<PasswordStrengthProps> = ({
  password,
}) => {
  const strength = password ? passwordStrength(password).id : -1;
  const strengthValue = password ? ((strength + 1) / 4) * 100 : 0;

  return (
    <div
      style={{
        gridArea: 'passwordStrength',
        width: '100%',
      }}
    >
      <Typography variant="body2" component={'span'} color={'textSecondary'}>
        Nível da senha:&nbsp;
        <PasswordStrengthLabel value={strengthValue}>
          {strength === -1 && 'FRACA'}
          {strength === 0 && 'FRACA'}
          {strength === 1 && 'MÉDIA'}
          {strength === 2 && 'FORTE'}
          {strength === 3 && 'MUITO FORTE'}
        </PasswordStrengthLabel>
      </Typography>
      <PasswordStrengthBar variant="determinate" value={strengthValue} />
    </div>
  );
};

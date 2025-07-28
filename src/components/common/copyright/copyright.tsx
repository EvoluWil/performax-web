import { Link, Typography, TypographyProps } from '@mui/material';
import React from 'react';

export const Copyright: React.FC<TypographyProps> = (props) => {
  return (
    <Typography
      variant="caption"
      color="white"
      align="center"
      component="p"
      {...props}
    >
      Copyright ©{' '}
      <Link color="inherit" href="https://wrs.tec.br" target="_blank">
        WRS Tecnologia
      </Link>
      {' · '}
      2025
    </Typography>
  );
};

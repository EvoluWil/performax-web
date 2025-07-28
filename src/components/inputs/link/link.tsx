'use client';

import {
  ButtonProps,
  Link as MuiLink,
  LinkProps as MuiLinkProps,
} from '@mui/material';
import NextLink, { LinkProps as NextLinkProps } from 'next/link';
import Router from 'next/router';
import React, { PropsWithChildren } from 'react';

type LinkProps = {
  href: string;
  mui?: MuiLinkProps | ButtonProps;
  next?: NextLinkProps;
  Component?: React.ElementType;
  onClick?: () => void;
  animate?: boolean;
};

export const Link: React.FC<PropsWithChildren<LinkProps>> = ({
  children,
  href,
  mui,
  next,
  animate = false,
  Component = MuiLink,
  ...props
}) => {
  const isNextEnv = Boolean(Router.router);

  return isNextEnv ? (
    <NextLink href={href} passHref {...next}>
      <Component
        {...mui}
        {...props}
        sx={
          animate
            ? {
                ...mui?.sx,

                position: 'relative',
                borderRadius: 30,
                '::before': {
                  content: '""',
                  position: 'absolute',
                  width: '0',
                  height: '2px',
                  bottom: 0,
                  left: 0,
                  backgroundColor: 'primary.main',
                  visibility: 'hidden',
                  transition: 'all 0.3s ease-in-out',
                },
                ':hover::before': {
                  visibility: 'visible !important',
                  width: '100% !important',
                },
              }
            : mui?.sx
        }
      >
        {children}
      </Component>
    </NextLink>
  ) : (
    <Component
      href={href}
      {...mui}
      {...props}
      sx={
        animate
          ? {
              ...mui?.sx,
              position: 'relative',
              borderRadius: 30,
              '::before': {
                content: '""',
                position: 'absolute',
                width: '0',
                height: '2px',
                bottom: 0,
                left: 0,
                backgroundColor: 'primary.main',
                visibility: 'hidden',
                transition: 'all 0.3s ease-in-out',
              },
              ':hover::before': {
                visibility: 'visible !important',
                width: '100% !important',
              },
            }
          : mui?.sx
      }
    >
      {children}
    </Component>
  );
};

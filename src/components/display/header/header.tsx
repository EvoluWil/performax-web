'use client';

import { HeaderUser } from '@/components/cards';
import { useWhiteLabel } from '@/providers/white-label';
import { Menu } from '@mui/icons-material';
import {
  AppBar,
  Box,
  Container,
  IconButton,
  Toolbar,
  Typography,
} from '@mui/material';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { Navigator } from '../navigator/navigator';

type HeaderProps = {
  simple?: boolean;
};

export const Header: React.FC<HeaderProps> = ({ simple = false }) => {
  const [open, setOpen] = useState(false);
  const { whiteLabel } = useWhiteLabel();

  const logoSrc = whiteLabel.logo;
  const companyName = whiteLabel.logo ? '' : whiteLabel.name;

  return (
    <Box bgcolor="primary.main" color="white">
      {!simple && <Navigator open={open} onClose={() => setOpen(false)} />}
      <Container>
        <AppBar
          position={simple ? 'sticky' : 'fixed'}
          sx={{
            p: '0 !important',
            zIndex: 120,
            height: { sm: 100, xs: 72 },
            boxShadow: 'none',
          }}
        >
          <Toolbar sx={{ mt: { xs: 1, sm: 2 } }}>
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              width="100%"
            >
              <Box display="flex" alignItems="center" gap={1}>
                {!simple && (
                  <IconButton
                    color="inherit"
                    onClick={() => setOpen(true)}
                    edge="start"
                    sx={{ display: { xs: 'block', sm: 'none' } }}
                  >
                    <Menu />
                  </IconButton>
                )}
                <Box
                  display="flex"
                  alignItems="center"
                  gap={0.5}
                  component={Link}
                  href="/"
                  sx={{
                    textDecoration: 'none',
                    cursor: 'pointer',
                    color: 'inherit',
                  }}
                >
                  <Box
                    width={{ xs: 36, sm: 50 }}
                    height={{ xs: 36, sm: 50 }}
                    mt={-0.5}
                    sx={{ flexShrink: 0 }}
                  >
                    <Image
                      src={logoSrc}
                      alt="Logo"
                      width={100}
                      height={100}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'contain',
                      }}
                    />
                  </Box>
                  <Typography>{companyName}</Typography>
                </Box>
              </Box>
              {!simple && <HeaderUser />}
            </Box>
          </Toolbar>
        </AppBar>
      </Container>
    </Box>
  );
};

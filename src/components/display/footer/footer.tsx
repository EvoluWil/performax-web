/* eslint-disable @next/next/no-img-element */
'use client';

import { Copyright } from '@/components/common';
import { useWhiteLabel } from '@/providers/white-label';
import { ArrowDropUp } from '@mui/icons-material';
import { Box, Container, Fab, Typography } from '@mui/material';
import Link from 'next/link';

export const Footer = () => {
  const { whiteLabel } = useWhiteLabel();
  const logoSrc = whiteLabel.logoContrast;
  const companyName = whiteLabel.name;

  const handleTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <Box
      component="footer"
      boxShadow={8}
      sx={{
        py: 3,
        bgcolor: (theme) => theme.palette.background.paper,
        mt: 'auto',
      }}
    >
      <Container>
        <Box
          alignItems="center"
          display={{ md: 'grid', xs: 'flex' }}
          flexDirection={{ md: 'row', xs: 'column' }}
          gap={2}
          justifyContent="space-between"
          gridTemplateColumns={{ md: '160px 1fr 160px', xs: '1fr' }}
        >
          <Box
            display="flex"
            alignItems="center"
            gap={1}
            component={Link}
            href="/"
            sx={{
              textDecoration: 'none',
              cursor: 'pointer',
            }}
          >
            <Box display="flex" alignItems="center" gap={0.5}>
              <Box display="flex" alignItems="center" gap={0.5}>
                <Box width={60} height={60} mt={-0.5} sx={{ flexShrink: 0 }}>
                  <img
                    src={logoSrc}
                    alt="Logo"
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'contain',
                    }}
                  />
                </Box>
              </Box>
              <Typography color="primary" fontWeight="bold" variant="h6">
                {companyName}
              </Typography>
            </Box>
          </Box>

          <Fab
            color="primary"
            size="small"
            aria-label="add"
            onClick={handleTop}
            sx={{ mb: 2, cursor: 'pointer', mx: 'auto' }}
          >
            <ArrowDropUp />
          </Fab>
          <Box alignItems="center" display="flex" flexDirection="column">
            {!whiteLabel?.id && (
              <>
                <Typography variant="body2">
                  Siga nossas redes sociais
                </Typography>
                <Box alignItems="center" display="flex" gap={1} />
              </>
            )}
          </Box>
        </Box>
      </Container>
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        color="text.secondary"
        mt={2}
      >
        <Copyright color="text.secondary" />
      </Box>
    </Box>
  );
};

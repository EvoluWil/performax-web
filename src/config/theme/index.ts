'use client';

import { ptBR as corePtBR } from '@mui/material/locale';
import { createTheme } from '@mui/material/styles';
import { ptBR } from '@mui/x-date-pickers/locales';

import type {} from '@mui/x-date-pickers/themeAugmentation';

export const theme = createTheme(
  {
    typography: {
      fontFamily: 'var(--font-poppins)',
    },
    palette: {
      primary: {
        light: '#9661ff',
        main: '#6B2AEE',
        dark: '#581ECD',
      },
      secondary: {
        light: '#2bfff2',
        main: '#02E7D9',
        dark: '#1dd6cb',
      },
      text: {
        primary: '#707070',
        secondary: '#9B9B9B',
      },
      error: {
        main: '#FF2133',
      },
      warning: {
        main: '#FCA600',
      },
      success: {
        main: '#00D34D',
      },
      grey: {
        50: '#FAFAFA',
        100: '#F0F0F0',
        200: '#D7D9DD',
        300: '#C4C4C4',
        400: '#9B9B9B',
      },
    },
    breakpoints: {
      values: {
        xs: 0,
        sm: 600,
        md: 960,
        lg: 1280,
        xl: 1536,
      },
    },
    shape: {
      borderRadius: 3,
    },
    components: {
      MuiTypography: {
        styleOverrides: {
          root: {
            textOverflow: 'ellipsis',
            overflow: 'hidden',
          },
        },
      },
      MuiOutlinedInput: {
        defaultProps: {
          autoComplete: 'on',
          inputProps: {
            style: {
              position: 'relative',
              zIndex: 99999,
              WebkitBoxShadow: '0 0 0 1000px white inset !important',
            },
          },
        },
      },
      MuiDatePicker: {
        defaultProps: {},
      },
      MuiButton: {
        defaultProps: {
          size: 'large',
        },
        styleOverrides: {
          root: {
            textTransform: 'none',
            borderWidth: '2px',
            ':hover': {
              borderWidth: '2px',
            },
          },
        },
        variants: [
          {
            props: { variant: 'contained', color: 'secondary' },
            style: {
              color: 'white',
            },
          },
        ],
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            boxShadow: '0px 0px 39px rgba(0, 0, 0, 0.05)',
          },
        },
      },
      MuiTextField: {
        defaultProps: {
          InputLabelProps: {
            required: false,
          },
          required: true,
        },
      },
      MuiSelect: {
        defaultProps: {
          required: true,
        },
      },
    },
  },
  ptBR,
  corePtBR,
);

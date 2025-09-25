import { ChevronRightOutlined } from '@mui/icons-material';
import { Box, Fab, Typography } from '@mui/material';
import { JSX } from 'react';
import { DrawerStyled } from './base-drawer.styles';

interface BaseDrawerProps {
  open: boolean;
  setOpen: () => void;
  content: JSX.Element;
  width?: number;
  height?: string;
  direction?: 'bottom' | 'left' | 'right' | 'top';
  title: string;
}

export const BaseDrawer: React.FC<BaseDrawerProps> = ({
  open,
  setOpen,
  content,
  width = 32,
  direction = 'right',
  title,
}) => {
  return (
    <Box>
      <DrawerStyled
        width={width}
        anchor={direction}
        open={open}
        onClose={setOpen}
        sx={{ position: 'relative' }}
      >
        <Box display="flex">
          <Box
            bgcolor="primary.main"
            color="white"
            width={56}
            minHeight="100vh"
          >
            <Fab
              onClick={setOpen}
              sx={{
                borderRadius: '16px 0 0 16px',
                bgcolor: 'white',
                color: 'primary.main',
                boxShadow: 'none',
                height: 64,
              }}
            >
              <ChevronRightOutlined />
            </Fab>
          </Box>
          <Box width="100%">
            <Box
              border="1px solid"
              borderColor="divider"
              boxShadow="0 2px 4px rgba(0, 0, 0, 0.1)"
            >
              <Typography
                variant="h6"
                component="h2"
                sx={{ p: 2 }}
                color="primary.main"
              >
                {title}
              </Typography>
            </Box>
            <Box
              p={2}
              display="flex"
              sx={{
                minHeight: 'calc(100vh - 66px)',
                overflowY: 'auto',
                '&::-webkit-scrollbar': {
                  display: 'none',
                },
              }}
            >
              {content}
            </Box>
          </Box>
        </Box>
      </DrawerStyled>
    </Box>
  );
};

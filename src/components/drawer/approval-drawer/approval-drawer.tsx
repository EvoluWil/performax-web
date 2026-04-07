'use client';

import { CancelOutlined, CheckCircleOutlined } from '@mui/icons-material';
import { Box, Button, CircularProgress, Typography } from '@mui/material';
import { BaseDrawer } from '../base-drawer/base-drawer';

interface ApprovalDrawerProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  onSubmit: (approved: boolean) => void;
  loading?: boolean;
}

export const ApprovalDrawer: React.FC<ApprovalDrawerProps> = ({
  open,
  onClose,
  title,
  onSubmit,
  loading = false,
}) => {
  return (
    <BaseDrawer
      open={open}
      setOpen={onClose}
      title="Aprovação"
      content={
        <Box display="flex" flexDirection="column" gap={3}>
          {title && (
            <Typography variant="body1" color="text.secondary">
              {title}
            </Typography>
          )}

          <Typography variant="body2" color="text.secondary">
            Selecione uma ação para este registro:
          </Typography>

          <Box
            display="flex"
            flexDirection="row"
            justifyContent="space-between"
            gap={2}
          >
            <Button
              variant="outlined"
              color="error"
              size="large"
              fullWidth
              startIcon={
                loading ? (
                  <CircularProgress size={18} color="inherit" />
                ) : (
                  <CancelOutlined />
                )
              }
              onClick={() => onSubmit(false)}
              disabled={loading}
            >
              Reprovar
            </Button>
            <Button
              variant="contained"
              color="success"
              size="large"
              fullWidth
              startIcon={
                loading ? (
                  <CircularProgress size={18} color="inherit" />
                ) : (
                  <CheckCircleOutlined />
                )
              }
              onClick={() => onSubmit(true)}
              disabled={loading}
            >
              Aprovar
            </Button>
          </Box>
        </Box>
      }
    />
  );
};

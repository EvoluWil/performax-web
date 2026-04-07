'use client';

import { Alert, Box, Button } from '@mui/material';

interface PendingApprovalAlertProps {
  onAction: () => void;
  message?: string;
  actionLabel?: string;
}

export const PendingApprovalAlert: React.FC<PendingApprovalAlertProps> = ({
  onAction,
  message = 'Este registro está pendente de aprovação. Nenhuma ação de andamento está disponível até ser aprovado por um administrador.',
  actionLabel = 'Aprovar / Reprovar',
}) => {
  return (
    <Alert severity="warning" sx={{ mb: 2 }}>
      <Box display="flex" flexDirection="column" gap={1}>
        <span>{message}</span>
        <Box display="flex" justifyContent="flex-end">
          <Button
            color="warning"
            size="small"
            variant="text"
            onClick={onAction}
          >
            {actionLabel}
          </Button>
        </Box>
      </Box>
    </Alert>
  );
};

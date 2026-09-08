'use client';

import { RestartAlt } from '@mui/icons-material';
import { IconButton, Tooltip } from '@mui/material';

type ResetDefaultButtonProps = {
  onClick: () => void;
  disabled?: boolean;
};

export function ResetDefaultButton({
  onClick,
  disabled = false,
}: ResetDefaultButtonProps) {
  return (
    <Tooltip
      title={
        disabled
          ? 'Já está no padrão do sistema'
          : 'Restaurar padrão do sistema'
      }
    >
      <span>
        <IconButton
          size="small"
          onClick={onClick}
          disabled={disabled}
          aria-label="Restaurar padrão do sistema"
        >
          <RestartAlt fontSize="small" />
        </IconButton>
      </span>
    </Tooltip>
  );
}

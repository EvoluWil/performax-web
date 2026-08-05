import { AutocompleteInput } from '@/components/inputs';
import {
  CloseButtonStyled,
  ModalContainer,
  ModalStyled,
} from '@/components/modal';
import { CloseOutlined } from '@mui/icons-material';
import { Box, Button, Typography } from '@mui/material';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';

export type BudgetStatusModalProps = {
  open: boolean;
  onClose: () => void;
  onSubmit: (status: string) => Promise<void>;
  defaultStatus: string;
  options: { value: string; label: string }[];
  title?: string;
};

export const BudgetStatusModal: React.FC<BudgetStatusModalProps> = ({
  open,
  onClose,
  onSubmit,
  defaultStatus,
  options,
  title = 'Alterar status do orçamento',
}) => {
  const [loading, setLoading] = useState(false);
  const { control, handleSubmit, reset } = useForm<{ status: string }>({
    defaultValues: { status: defaultStatus },
  });

  const handleSave = handleSubmit(async ({ status }) => {
    try {
      setLoading(true);
      await onSubmit(status);
      handleClose();
    } finally {
      setLoading(false);
    }
  });

  const handleClose = () => {
    onClose();
    reset({ status: defaultStatus });
  };

  return (
    <ModalStyled open={open} onClose={handleClose}>
      <ModalContainer onSubmit={handleSave}>
        <CloseButtonStyled onClick={handleClose}>
          <CloseOutlined />
        </CloseButtonStyled>

        <Typography variant="h6">{title}</Typography>

        <AutocompleteInput
          label="Novo status"
          name="status"
          control={control}
          options={options}
        />

        <Box
          sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 2 }}
        >
          <Button
            variant="outlined"
            color="error"
            onClick={handleClose}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={loading}
            loading={loading}
          >
            Confirmar
          </Button>
        </Box>
      </ModalContainer>
    </ModalStyled>
  );
};

export default BudgetStatusModal;

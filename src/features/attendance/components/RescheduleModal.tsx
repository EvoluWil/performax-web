'use client';

import {
  CloseButtonStyled,
  ModalContainer,
  ModalStyled,
} from '@/components/modal';
import { CloseOutlined } from '@mui/icons-material';
import { Box, Button, Typography } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { useState } from 'react';

type RescheduleModalProps = {
  open: boolean;
  currentDate: Date | string;
  onClose: () => void;
  onConfirm: (date: Date) => Promise<void>;
  loading?: boolean;
};

export const RescheduleModal = ({
  open,
  currentDate,
  onClose,
  onConfirm,
  loading,
}: RescheduleModalProps) => {
  const [value, setValue] = useState<Date | null>(
    currentDate ? new Date(currentDate) : null,
  );

  const handleSubmit = async () => {
    if (!value) return;
    await onConfirm(value);
  };

  return (
    <ModalStyled open={open} onClose={onClose}>
      <ModalContainer
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit();
        }}
      >
        <CloseButtonStyled onClick={onClose}>
          <CloseOutlined />
        </CloseButtonStyled>

        <Typography variant="h6">Reagendar OS</Typography>

        <Box mt={2}>
          <DatePicker
            label="Nova data"
            value={value}
            onChange={(v: Date | null) => setValue(v)}
            sx={{ width: '100%' }}
          />
        </Box>

        <Box display="flex" gap={2} justifyContent="flex-end" mt={3}>
          <Button
            variant="outlined"
            color="inherit"
            onClick={onClose}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="contained"
            loading={loading}
            disabled={!value}
          >
            Confirmar
          </Button>
        </Box>
      </ModalContainer>
    </ModalStyled>
  );
};

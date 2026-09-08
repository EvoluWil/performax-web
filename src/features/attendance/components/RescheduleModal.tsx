'use client';

import {
  CloseButtonStyled,
  ModalContainer,
  ModalStyled,
} from '@/components/modal';
import { parsePickerDateTime } from '@/utils/date';
import { CloseOutlined } from '@mui/icons-material';
import { Box, Button, Typography } from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { useEffect, useState } from 'react';

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
    parsePickerDateTime(currentDate),
  );

  useEffect(() => {
    if (open) {
      setValue(parsePickerDateTime(currentDate));
    }
  }, [open, currentDate]);

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
          <DateTimePicker
            label="Nova data e hora"
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

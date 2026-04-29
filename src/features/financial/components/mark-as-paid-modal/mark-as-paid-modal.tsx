'use client';

import { CurrencyInput, DateInput } from '@/components/inputs';
import {
  CloseButtonStyled,
  ModalContainer,
  ModalStyled,
} from '@/components/modal';
import { yupResolver } from '@hookform/resolvers/yup';
import { CloseOutlined } from '@mui/icons-material';
import { Box, Button, Typography } from '@mui/material';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import * as yup from 'yup';
import { useFinanceMutation } from '../../hooks/queries/finances.query';
import type { Finance } from '../../types/finance';

type MarkAsPaidFormDto = {
  paymentDate: string;
  tax: number;
  retention: number;
};

const schema = yup.object().shape({
  paymentDate: yup
    .string()
    .required('Data de pagamento é obrigatória')
    .transform((v) => v && new Date(v).toISOString()),
  tax: yup.number().min(0).default(0),
  retention: yup.number().min(0).default(0),
});

const initialValues: MarkAsPaidFormDto = {
  paymentDate: '',
  tax: 0,
  retention: 0,
};

export type MarkAsPaidModalProps = {
  open: boolean;
  onClose: () => void;
  finance: Finance | null;
  onSuccess?: () => void;
};

export const MarkAsPaidModal: React.FC<MarkAsPaidModalProps> = ({
  open,
  onClose,
  finance,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false);
  const mutation = useFinanceMutation(finance?.id);

  const { control, handleSubmit, reset } = useForm<MarkAsPaidFormDto>({
    defaultValues: initialValues,
    resolver: yupResolver(schema) as any,
  });

  const handleClose = () => {
    reset(initialValues);
    onClose();
  };

  const handleSave = handleSubmit(async (values) => {
    if (!finance) return;
    setLoading(true);
    try {
      await mutation.mutateAsync({
        type: 'update',
        id: finance.id,
        data: {
          status: 'PAID' as any,
          paymentDate: values.paymentDate as any,
          tax: Math.round(Number(values.tax || 0) * 100),
          retention: Math.round(Number(values.retention || 0) * 100),
        } as any,
      });
      toast.success('Lançamento marcado como pago');
      onSuccess?.();
      handleClose();
    } catch {
      toast.error('Erro ao marcar como pago');
    } finally {
      setLoading(false);
    }
  });

  return (
    <ModalStyled open={open} onClose={handleClose}>
      <ModalContainer onSubmit={handleSave}>
        <CloseButtonStyled onClick={handleClose}>
          <CloseOutlined />
        </CloseButtonStyled>

        <Typography variant="h6" mb={1}>
          Marcar como Pago
        </Typography>
        {finance && (
          <Typography variant="body2" color="text.secondary" mb={2}>
            {finance.title}
          </Typography>
        )}

        <Box display="flex" flexDirection="column" gap={2}>
          <DateInput
            label="Data de Pagamento"
            name="paymentDate"
            control={control}
          />
          <Box display="grid" gridTemplateColumns="1fr 1fr" gap={2}>
            <CurrencyInput label="Taxa" name="tax" control={control} />
            <CurrencyInput
              label="Retenção"
              name="retention"
              control={control}
            />
          </Box>
        </Box>

        <Box display="flex" gap={2} justifyContent="flex-end" mt={3}>
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
            color="success"
            loading={loading}
          >
            Confirmar Pagamento
          </Button>
        </Box>
      </ModalContainer>
    </ModalStyled>
  );
};

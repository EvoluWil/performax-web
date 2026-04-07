'use client';

import { BaseDrawer } from '@/components/drawer';
import { TextInput } from '@/components/inputs';
import { yupResolver } from '@hookform/resolvers/yup';
import { Box, Button } from '@mui/material';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { useFinancePaymentMethodMutation } from '../../hooks/queries/finance-payment-methods.query';
import {
  FinancePaymentMethodFormDto,
  financePaymentMethodFormInitialValues,
  financePaymentMethodFormSchema,
} from '../../schemas/finance-payment-method-drawer.schema';
import type { FinancePaymentMethod } from '../../types/finance-payment-method';

export type FinancePaymentMethodDrawerProps = {
  open: boolean;
  onClose: () => void;
  financePaymentMethod: FinancePaymentMethod | null;
};

export const FinancePaymentMethodDrawer: React.FC<
  FinancePaymentMethodDrawerProps
> = ({ open, onClose, financePaymentMethod }) => {
  const [loading, setLoading] = useState(false);
  const mutation = useFinancePaymentMethodMutation();

  const { control, handleSubmit, reset } = useForm<FinancePaymentMethodFormDto>(
    {
      defaultValues: financePaymentMethodFormInitialValues,
      resolver: yupResolver(financePaymentMethodFormSchema) as any,
    },
  );

  useEffect(() => {
    if (open && financePaymentMethod) {
      reset({ name: financePaymentMethod.name });
    } else if (open) {
      reset(financePaymentMethodFormInitialValues);
    }
  }, [open, financePaymentMethod, reset]);

  const handleSave = handleSubmit(async (values) => {
    setLoading(true);
    try {
      if (financePaymentMethod) {
        await mutation.mutateAsync({
          type: 'update',
          id: financePaymentMethod.id,
          data: values,
        });
        toast.success('Método de pagamento atualizado com sucesso');
      } else {
        await mutation.mutateAsync({ type: 'create', data: values });
        toast.success('Método de pagamento criado com sucesso');
      }
      onClose();
    } catch {
      toast.error('Erro ao salvar método de pagamento');
    } finally {
      setLoading(false);
    }
  });

  return (
    <BaseDrawer
      open={open}
      setOpen={onClose}
      height="auto"
      title={
        financePaymentMethod
          ? 'Editar Método de Pagamento'
          : 'Novo Método de Pagamento'
      }
      content={
        <Box display="flex" flexDirection="column" gap={2}>
          <TextInput label="Nome" name="name" control={control} />
          <Box display="flex" gap={2} mt="auto">
            <Button
              variant="outlined"
              color="error"
              onClick={onClose}
              fullWidth
            >
              Cancelar
            </Button>
            <Button
              variant="contained"
              onClick={handleSave}
              loading={loading}
              fullWidth
            >
              Salvar
            </Button>
          </Box>
        </Box>
      }
    />
  );
};

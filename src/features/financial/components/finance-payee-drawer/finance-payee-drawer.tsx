'use client';

import { BaseDrawer } from '@/components/drawer';
import { TextInput } from '@/components/inputs';
import { yupResolver } from '@hookform/resolvers/yup';
import { Box, Button } from '@mui/material';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { useFinancePayeeMutation } from '../../hooks/queries/finance-payees.query';
import {
  FinancePayeeFormDto,
  financePayeeFormInitialValues,
  financePayeeFormSchema,
} from '../../schemas/finance-payee-drawer.schema';
import type { FinancePayee } from '../../types/finance-payee';

export type FinancePayeeDrawerProps = {
  open: boolean;
  onClose: () => void;
  financePayee: FinancePayee | null;
};

export const FinancePayeeDrawer: React.FC<FinancePayeeDrawerProps> = ({
  open,
  onClose,
  financePayee,
}) => {
  const [loading, setLoading] = useState(false);
  const mutation = useFinancePayeeMutation();

  const { control, handleSubmit, reset } = useForm<FinancePayeeFormDto>({
    defaultValues: financePayeeFormInitialValues,
    resolver: yupResolver(financePayeeFormSchema) as any,
  });

  useEffect(() => {
    if (open && financePayee) {
      reset({ name: financePayee.name });
    } else if (open) {
      reset(financePayeeFormInitialValues);
    }
  }, [open, financePayee, reset]);

  const handleSave = handleSubmit(async (values) => {
    setLoading(true);
    try {
      if (financePayee) {
        await mutation.mutateAsync({
          type: 'update',
          id: financePayee.id,
          data: values,
        });
        toast.success('Favorecido atualizado com sucesso');
      } else {
        await mutation.mutateAsync({ type: 'create', data: values });
        toast.success('Favorecido criado com sucesso');
      }
      onClose();
    } catch {
      toast.error('Erro ao salvar favorecido');
    } finally {
      setLoading(false);
    }
  });

  return (
    <BaseDrawer
      open={open}
      setOpen={onClose}
      height="auto"
      title={financePayee ? 'Editar Favorecido' : 'Novo Favorecido'}
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

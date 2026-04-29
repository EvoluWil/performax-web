'use client';

import { BaseDrawer } from '@/components/drawer';
import { TextInput } from '@/components/inputs';
import { yupResolver } from '@hookform/resolvers/yup';
import { Box, Button } from '@mui/material';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { useFinanceCategoryMutation } from '../../hooks/queries/finance-categories.query';
import {
  FinanceCategoryFormDto,
  financeCategoryFormInitialValues,
  financeCategoryFormSchema,
} from '../../schemas/finance-category-drawer.schema';
import type { FinanceCategory } from '../../types/finance-category';

export type FinanceCategoryDrawerProps = {
  open: boolean;
  onClose: () => void;
  financeCategory: FinanceCategory | null;
};

export const FinanceCategoryDrawer: React.FC<FinanceCategoryDrawerProps> = ({
  open,
  onClose,
  financeCategory,
}) => {
  const [loading, setLoading] = useState(false);
  const mutation = useFinanceCategoryMutation();

  const { control, handleSubmit, reset } = useForm<FinanceCategoryFormDto>({
    defaultValues: financeCategoryFormInitialValues,
    resolver: yupResolver(financeCategoryFormSchema) as any,
  });

  useEffect(() => {
    if (open && financeCategory) {
      reset({
        name: financeCategory.name,
      });
    } else if (open) {
      reset(financeCategoryFormInitialValues);
    }
  }, [open, financeCategory, reset]);

  const handleSave = handleSubmit(async (values) => {
    setLoading(true);
    try {
      if (financeCategory) {
        await mutation.mutateAsync({
          type: 'update',
          id: financeCategory.id,
          data: values,
        });
        toast.success('Categoria atualizada com sucesso');
      } else {
        await mutation.mutateAsync({ type: 'create', data: values });
        toast.success('Categoria criada com sucesso');
      }
      onClose();
    } catch {
      toast.error('Erro ao salvar categoria');
    } finally {
      setLoading(false);
    }
  });

  return (
    <BaseDrawer
      open={open}
      setOpen={onClose}
      height="auto"
      title={financeCategory ? 'Editar Categoria' : 'Nova Categoria'}
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

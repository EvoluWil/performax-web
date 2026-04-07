'use client';

import { BaseDrawer } from '@/components/drawer';
import { Switch, TextInput } from '@/components/inputs';
import { yupResolver } from '@hookform/resolvers/yup';
import { Box, Button } from '@mui/material';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { useFinanceTypeMutation } from '../../hooks/queries/finance-types.query';
import {
  FinanceTypeFormDto,
  financeTypeFormInitialValues,
  financeTypeFormSchema,
} from '../../schemas/finance-type-drawer.schema';
import type { FinanceType } from '../../types/finance-type';

export type FinanceTypeDrawerProps = {
  open: boolean;
  onClose: () => void;
  financeType: FinanceType | null;
};

export const FinanceTypeDrawer: React.FC<FinanceTypeDrawerProps> = ({
  open,
  onClose,
  financeType,
}) => {
  const [loading, setLoading] = useState(false);
  const mutation = useFinanceTypeMutation();

  const { control, handleSubmit, reset } = useForm<FinanceTypeFormDto>({
    defaultValues: financeTypeFormInitialValues,
    resolver: yupResolver(financeTypeFormSchema) as any,
  });

  useEffect(() => {
    if (open && financeType) {
      reset({ name: financeType.name, needApprove: financeType.needApprove });
    } else if (open) {
      reset(financeTypeFormInitialValues);
    }
  }, [open, financeType, reset]);

  const handleSave = handleSubmit(async (values) => {
    setLoading(true);
    try {
      if (financeType) {
        await mutation.mutateAsync({
          type: 'update',
          id: financeType.id,
          data: values,
        });
        toast.success('Centro de custo atualizado com sucesso');
      } else {
        await mutation.mutateAsync({ type: 'create', data: values });
        toast.success('Centro de custo criado com sucesso');
      }
      onClose();
    } catch {
      toast.error('Erro ao salvar centro de custo');
    } finally {
      setLoading(false);
    }
  });

  return (
    <BaseDrawer
      open={open}
      setOpen={onClose}
      height="auto"
      title={financeType ? 'Editar Centro de Custo' : 'Novo Centro de Custo'}
      content={
        <Box display="flex" flexDirection="column" gap={2}>
          <TextInput label="Nome" name="name" control={control} />
          <Box display="flex" alignItems="center" gap={1}>
            <Switch
              name="needApprove"
              control={control}
              label="Precisa de aprovação?"
            />
          </Box>
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

'use client';

import { BaseDrawer } from '@/components/drawer';
import { TextInput } from '@/components/inputs';
import { yupResolver } from '@hookform/resolvers/yup';
import { Box, Button } from '@mui/material';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { useFinanceSegmentMutation } from '../../hooks/queries/finance-segments.query';
import {
  FinanceSegmentFormDto,
  financeSegmentFormInitialValues,
  financeSegmentFormSchema,
} from '../../schemas/finance-segment-drawer.schema';
import type { FinanceSegment } from '../../types/finance-segment';

export type FinanceSegmentDrawerProps = {
  open: boolean;
  onClose: () => void;
  financeSegment: FinanceSegment | null;
};

export const FinanceSegmentDrawer: React.FC<FinanceSegmentDrawerProps> = ({
  open,
  onClose,
  financeSegment,
}) => {
  const [loading, setLoading] = useState(false);
  const mutation = useFinanceSegmentMutation();

  const { control, handleSubmit, reset } = useForm<FinanceSegmentFormDto>({
    defaultValues: financeSegmentFormInitialValues,
    resolver: yupResolver(financeSegmentFormSchema) as any,
  });

  useEffect(() => {
    if (open && financeSegment) {
      reset({ name: financeSegment.name });
    } else if (open) {
      reset(financeSegmentFormInitialValues);
    }
  }, [open, financeSegment, reset]);

  const handleSave = handleSubmit(async (values) => {
    setLoading(true);
    try {
      if (financeSegment) {
        await mutation.mutateAsync({
          type: 'update',
          id: financeSegment.id,
          data: values,
        });
        toast.success('Segmento atualizado com sucesso');
      } else {
        await mutation.mutateAsync({ type: 'create', data: values });
        toast.success('Segmento criado com sucesso');
      }
      onClose();
    } catch {
      toast.error('Erro ao salvar segmento');
    } finally {
      setLoading(false);
    }
  });

  return (
    <BaseDrawer
      open={open}
      setOpen={onClose}
      height="auto"
      title={financeSegment ? 'Editar Segmento' : 'Novo Segmento'}
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

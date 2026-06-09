'use client';

import { SelectInput } from '@/components/inputs';
import {
  CloseButtonStyled,
  ModalContainer,
  ModalStyled,
} from '@/components/modal/modal-base.styles';
import { useFormResources } from '@/hooks/use-form-resources';
import { yupResolver } from '@hookform/resolvers/yup';
import { CloseOutlined } from '@mui/icons-material';
import { Box, Button, Divider, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import {
  ContractRecurringFormDto,
  contractRecurringFormInitialValues,
  contractRecurringFormSchema,
} from '../../schemas/contract.schema';
import { contractService } from '../../services/contract.service';
import { Contract } from '../../types/contract';

type Props = {
  open: boolean;
  onClose: () => void;
  contract: Contract;
  onSuccess?: () => void;
  onLoadingChange?: (loading: boolean) => void;
};

export const ContractRecurringModal: React.FC<Props> = ({
  open,
  onClose,
  contract,
  onSuccess,
  onLoadingChange,
}) => {
  const { options } = useFormResources([
    'financeTypes',
    'financeBanks',
    'financePaymentMethods',
    'financeCategories',
    'financeSegments',
  ]);

  const [submitting, setSubmitting] = useState(false);

  const { control, handleSubmit, reset, watch, setValue } =
    useForm<ContractRecurringFormDto>({
      defaultValues: contractRecurringFormInitialValues,
      resolver: yupResolver(contractRecurringFormSchema) as any,
    });

  const loading = submitting;

  useEffect(() => {
    onLoadingChange?.(loading);
  }, [loading, onLoadingChange]);

  const segmentId = watch('segmentId');

  useEffect(() => {
    if (!segmentId) return;
    const categories = options.financeCategories ?? [];
    const match = categories.find((c) => c.data?.segmentId === segmentId);
    if (match) setValue('categoryId', match.value);
  }, [segmentId, options.financeCategories, setValue]);

  useEffect(() => {
    if (open) {
      reset(contractRecurringFormInitialValues);
      setSubmitting(false);
    }
  }, [open, reset]);

  const onSubmit = handleSubmit(async (values) => {
    setSubmitting(true);
    try {
      await contractService.generateRecurring(contract.id, {
        typeId: values.typeId,
        bankId: values.bankId,
        methodId: values.methodId,
        categoryId: values.categoryId,
        segmentId: values.segmentId || undefined,
        flow: 'IN',
      });
      toast.success('Recorrência financeira criada com sucesso');
      onSuccess?.();
      onClose();
    } catch {
      toast.error('Erro ao criar recorrência financeira');
    } finally {
      setSubmitting(false);
    }
  });

  const handleClose = () => {
    if (loading) return;
    onClose();
  };

  const formatCurrency = (cents: number) =>
    (cents / 100).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });

  return (
    <ModalStyled open={open} onClose={handleClose}>
      <ModalContainer sx={{ minWidth: { xs: '95vw', md: 520 } }}>
        <CloseButtonStyled onClick={handleClose} disabled={loading}>
          <CloseOutlined />
        </CloseButtonStyled>
        <Typography variant="h6" component="h2" gutterBottom>
          Criar recorrência financeira
        </Typography>
        <Typography variant="body2" color="text.secondary" mb={2}>
          Confirme os cadastros financeiros para gerar os lançamentos
          recorrentes deste contrato.
        </Typography>

        <Box mb={2}>
          <Typography variant="body2">
            <strong>Cliente:</strong> {contract.client?.name}
          </Typography>
          <Typography variant="body2">
            <strong>Valor:</strong> {formatCurrency(contract.value)}
          </Typography>
          <Typography variant="body2">
            <strong>Vencimento:</strong>{' '}
            {contract.dueDate
              ? new Date(contract.dueDate).toLocaleDateString('pt-BR')
              : '-'}
          </Typography>
          <Typography variant="body2">
            <strong>Recorrência:</strong> Mensal (automática)
          </Typography>
        </Box>

        <Divider sx={{ mb: 2 }} />

        <Box display="flex" flexDirection="column" gap={2}>
          <SelectInput
            label="Centro de custo (tipo financeiro)"
            name="typeId"
            control={control}
            options={options.financeTypes ?? []}
            disabled={loading}
          />
          <SelectInput
            label="Segmento"
            name="segmentId"
            control={control}
            options={options.financeSegments ?? []}
            disabled={loading}
          />
          <SelectInput
            label="Categoria"
            name="categoryId"
            control={control}
            options={options.financeCategories ?? []}
            disabled={loading}
          />
          <SelectInput
            label="Banco"
            name="bankId"
            control={control}
            options={options.financeBanks ?? []}
            disabled={loading}
          />
          <SelectInput
            label="Método de pagamento"
            name="methodId"
            control={control}
            options={options.financePaymentMethods ?? []}
            disabled={loading}
          />

          <Box display="flex" gap={2}>
            <Button
              variant="outlined"
              color="error"
              onClick={handleClose}
              fullWidth
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              variant="contained"
              onClick={onSubmit}
              fullWidth
              loading={loading}
              disabled={loading}
            >
              Criar recorrência
            </Button>
          </Box>
        </Box>
      </ModalContainer>
    </ModalStyled>
  );
};

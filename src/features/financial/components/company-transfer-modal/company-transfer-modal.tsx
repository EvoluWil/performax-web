'use client';

import {
  CurrencyInput,
  DateInput,
  SelectInput,
  TextInput,
} from '@/components/inputs';
import {
  CloseButtonStyled,
  ModalContainer,
  ModalStyled,
} from '@/components/modal';
import { yupResolver } from '@hookform/resolvers/yup';
import { CloseOutlined } from '@mui/icons-material';
import { Box, Button, CircularProgress, Typography } from '@mui/material';
import React, { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { useCompanyGroupCompaniesQuery } from '../../hooks/queries/company-groups.query';
import { useFinanceBanksQuery } from '../../hooks/queries/finance-banks.query';
import { useFinanceCategoriesQuery } from '../../hooks/queries/finance-categories.query';
import { useFinancePaymentMethodsQuery } from '../../hooks/queries/finance-payment-methods.query';
import { useFinanceTransferMutation } from '../../hooks/queries/finances.query';
import {
  TransferFormDto,
  transferFormInitialValues,
  transferFormSchema,
} from '../../schemas/transfer.schema';

export type CompanyTransferModalProps = {
  open: boolean;
  onClose: () => void;
  groupId: string;
  currentCompanyId: string;
};

export const CompanyTransferModal: React.FC<CompanyTransferModalProps> = ({
  open,
  onClose,
  groupId,
  currentCompanyId,
}) => {
  const { data: groupCompanies } = useCompanyGroupCompaniesQuery(groupId);
  const { data: banks } = useFinanceBanksQuery();
  const { data: categories } = useFinanceCategoriesQuery();
  const { data: methods } = useFinancePaymentMethodsQuery();
  const transferMutation = useFinanceTransferMutation();

  const companyOptions = useMemo(
    () =>
      (groupCompanies ?? [])
        .filter((c) => c.id !== currentCompanyId)
        .map((c) => ({ value: c.id, label: c.name })),
    [groupCompanies, currentCompanyId],
  );

  const bankOptions = useMemo(
    () =>
      (banks ?? []).map((b) => ({
        value: b.id,
        label: `${b.name} (${b.code})`,
      })),
    [banks],
  );

  const categoryOptions = useMemo(
    () => (categories ?? []).map((c) => ({ value: c.id, label: c.name })),
    [categories],
  );

  const methodOptions = useMemo(
    () => (methods ?? []).map((m) => ({ value: m.id, label: m.name })),
    [methods],
  );

  const { control, handleSubmit, reset } = useForm<TransferFormDto>({
    defaultValues: transferFormInitialValues,
    resolver: yupResolver(transferFormSchema) as any,
  });

  useEffect(() => {
    if (!open) reset(transferFormInitialValues);
  }, [open, reset]);

  const handleSave = handleSubmit(async (values) => {
    try {
      await transferMutation.mutateAsync({
        title: values.title,
        description: values.description,
        value: Number(values.value),
        tax: values.tax ? Number(values.tax) : undefined,
        retention: values.retention ? Number(values.retention) : undefined,
        date: values.date,
        companyInId: values.companyInId,
        bankId: values.bankId || undefined,
        categoryId: values.categoryId || undefined,
        methodId: values.methodId || undefined,
      });
      toast.success('Transferência realizada com sucesso');
      handleClose();
    } catch {
      toast.error('Erro ao realizar transferência');
    }
  });

  const handleClose = () => {
    reset(transferFormInitialValues);
    onClose();
  };

  return (
    <ModalStyled open={open} onClose={handleClose}>
      <ModalContainer onSubmit={handleSave}>
        <CloseButtonStyled onClick={handleClose}>
          <CloseOutlined />
        </CloseButtonStyled>

        <Typography variant="h6" gutterBottom>
          Transferência entre empresas
        </Typography>

        <Box display="flex" flexDirection="column" gap={2}>
          <SelectInput
            label="Empresa de destino"
            name="companyInId"
            control={control}
            options={companyOptions}
          />
          <TextInput
            label="Título"
            name="title"
            placeholder="Título da transferência"
            control={control}
          />
          <Box display="grid" gridTemplateColumns="1fr 1fr" gap={2}>
            <CurrencyInput label="Valor" name="value" control={control} />
            <DateInput label="Data" name="date" control={control} />
          </Box>
          <Box display="grid" gridTemplateColumns="1fr 1fr" gap={2}>
            <CurrencyInput label="Taxa" name="tax" control={control} />
            <CurrencyInput
              label="Retenção"
              name="retention"
              control={control}
            />
          </Box>
          <SelectInput
            label="Banco"
            name="bankId"
            control={control}
            options={bankOptions}
          />
          <SelectInput
            label="Método de Pagamento"
            name="methodId"
            control={control}
            options={methodOptions}
          />
          <SelectInput
            label="Categoria"
            name="categoryId"
            control={control}
            options={categoryOptions}
          />
          <TextInput
            label="Descrição"
            name="description"
            placeholder="Descrição da transferência"
            control={control}
            multiline
            minRows={2}
          />
        </Box>

        <Box display="flex" justifyContent="flex-end" gap={1} mt={2}>
          <Button
            variant="outlined"
            onClick={handleClose}
            disabled={transferMutation.isPending}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={transferMutation.isPending}
            startIcon={
              transferMutation.isPending ? (
                <CircularProgress size={16} />
              ) : undefined
            }
          >
            Transferir
          </Button>
        </Box>
      </ModalContainer>
    </ModalStyled>
  );
};

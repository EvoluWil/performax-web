'use client';

import { useCompanyPermissions } from '@/hooks/common/permission';
import { useFormResources } from '@/hooks/use-form-resources';
import { yupResolver } from '@hookform/resolvers/yup';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { useFinanceMutation } from '../../hooks/queries/finances.query';
import {
  FinanceFormDto,
  financeFormInitialValues,
  financeFormSchema,
} from '../../schemas/finance-drawer.schema';
import type { Finance } from '../../types/finance';
import { FinanceFlowEnum, FinanceStatusEnum } from '../../types/finance';

type HookProps = {
  onClose: () => void;
  open: boolean;
  finance: Finance | null;
  onSuccess?: () => void;
};

export const useFinanceDrawer = ({
  onClose,
  open,
  finance: selectedFinance,
  onSuccess,
}: HookProps) => {
  const finance = selectedFinance || null;
  const [loading, setLoading] = useState(false);
  const [paidTo, setPaidTo] = useState<'client' | 'employee'>('client');

  const { isAdmin, subordinateIds, currentUserId } = useCompanyPermissions();
  const showResponsibleSelect = isAdmin || subordinateIds.length > 0;

  const {
    options,
    setSearch,
    isLoading: optionsLoading,
  } = useFormResources([
    'financeBanks',
    'financePaymentMethods',
    'financeTypes',
    'financeCategories',
    'financeSegments',
    'financePayees',
    'clients',
    'employees',
    'users',
  ]);

  const mutation = useFinanceMutation(finance?.id);

  const {
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FinanceFormDto>({
    defaultValues: financeFormInitialValues,
    resolver: yupResolver(financeFormSchema) as any,
  });

  const selectedFlow = watch('flow');
  const selectedTypeId = watch('typeId');

  const isOutFlow = selectedFlow === FinanceFlowEnum.OUT;

  useEffect(() => {
    if (!isOutFlow) setPaidTo('client');
  }, [isOutFlow]);
  const selectedTypeOption = (options.financeTypes ?? []).find(
    (t) => t.value === selectedTypeId,
  );
  const needApprove =
    (selectedTypeOption?.data?.needApprove as boolean) ?? false;

  useEffect(() => {
    if (open && finance) {
      reset({
        title: finance.title,
        description: finance.description ?? '',
        value: (finance.value ?? 0) / 100,
        date: finance.date ? new Date(finance.date) : null,
        observation: finance.observation ?? '',
        flow: finance.flow,
        typeId: finance.typeId ?? undefined,
        clientId: finance.clientId ?? undefined,
        methodId: finance.methodId ?? '',
        bankId: finance.bankId ?? '',
        categoryId: finance.categoryId ?? undefined,
        segmentId: finance.segmentId ?? undefined,
        payeeId: finance.payeeId ?? undefined,
        responsibleId: finance.responsibleId ?? undefined,
        employeeId: finance.employeeId ?? undefined,
        recurrence: finance.recurringMaster?.recurrence ?? '',
      });
      if (finance.flow === FinanceFlowEnum.OUT) {
        if (finance.employeeId) setPaidTo('employee');
        else setPaidTo('client');
      } else {
        setPaidTo('client');
      }
    } else if (open && !finance) {
      reset({
        ...financeFormInitialValues,
        responsibleId: showResponsibleSelect ? '' : currentUserId,
      });
      setPaidTo('client');
    }
  }, [open, finance, reset, showResponsibleSelect, currentUserId]);

  const handleFinance = handleSubmit(async (values: FinanceFormDto) => {
    setLoading(true);
    try {
      const payload = {
        ...values,
        value: Math.round(Number(values.value || 0) * 100),
      };
      if (finance) {
        await mutation.mutateAsync({
          type: 'update',
          id: finance.id,
          data: payload,
        });
        toast.success('Lançamento atualizado com sucesso');
      } else {
        await mutation.mutateAsync({
          type: 'create',
          data: { ...payload, status: FinanceStatusEnum.PENDING } as any,
        });
        toast.success('Lançamento criado com sucesso');
      }
      onSuccess?.();
      handleClose();
    } catch {
      toast.error('Erro ao salvar lançamento');
    } finally {
      setLoading(false);
    }
  });

  const handleClose = () => {
    reset(financeFormInitialValues);
    onClose();
  };

  return {
    control,
    handleFinance,
    loading,
    handleClose,
    open,
    editing: !!finance,
    hasRecurrence: !!finance?.recurrenceMasterId,
    options,
    setSearch,
    optionsLoading,
    setValue,
    errors,
    isOutFlow,
    needApprove,
    showResponsibleSelect,
    paidTo,
    setPaidTo,
  };
};

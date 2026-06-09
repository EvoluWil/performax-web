'use client';

import { Client } from '@/features/client/types';
import { Employee } from '@/features/employee/types';
import { useCompanyPermissions } from '@/hooks/common/permission';
import { useCompanyGroupQuery } from '@/hooks/queries/company-group.query';
import { useFormResources } from '@/hooks/use-form-resources';
import { companyService } from '@/services/company.service';
import { Company } from '@/types/company';
import { User } from '@/types/user';
import { yupResolver } from '@hookform/resolvers/yup';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { useFinanceReceivableMutation } from '../../hooks/queries/finance-receivables.query';
import { useFinanceMutation } from '../../hooks/queries/finances.query';
import {
  FinanceFormDto,
  financeFormInitialValues,
  financeFormSchema,
} from '../../schemas/finance-drawer.schema';
import {
  financeBankService,
  financeCategoryService,
  financePayeeService,
  financePaymentMethodService,
  financeSegmentService,
  financeTypeService,
} from '../../services';
import type { Finance } from '../../types/finance';
import { FinanceFlowEnum, FinanceStatusEnum, isFinanceCancelled } from '../../types/finance';

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
  const [isDuplicata, setIsDuplicata] = useState(false);
  const [installmentCount, setInstallmentCount] = useState(2);
  const [paidTo, setPaidTo] = useState<'client' | 'employee' | 'other'>(
    'client',
  );
  const [clientDrawerOpen, setClientDrawerOpen] = useState(false);
  const [clientInitialName, setClientInitialName] = useState('');
  const [responsibleDrawerOpen, setResponsibleDrawerOpen] = useState(false);
  const [responsibleInitialName, setResponsibleInitialName] = useState('');
  const [employeeDrawerOpen, setEmployeeDrawerOpen] = useState(false);
  const [employeeInitialName, setEmployeeInitialName] = useState('');

  const clientCreateRef = useRef<{
    resolve: (id: string) => void;
    reject: (error: Error) => void;
  } | null>(null);
  const responsibleCreateRef = useRef<{
    resolve: (id: string) => void;
    reject: (error: Error) => void;
  } | null>(null);
  const employeeCreateRef = useRef<{
    resolve: (id: string) => void;
    reject: (error: Error) => void;
  } | null>(null);

  const { isAdmin, subordinateIds, currentUserId, hasPermission } =
    useCompanyPermissions();
  const showResponsibleSelect = isAdmin || subordinateIds.length > 0;
  const canCreateFinancialField = hasPermission('financial', 'write');
  const canCreateClient = hasPermission('client', 'write');
  const canCreateEmployee =
    hasPermission('employee', 'write') || hasPermission('client', 'write');
  const canCreateUser = hasPermission('user', 'write');

  const defaultCompanyId = companyService.getDefaultCompany()?.id;
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>(
    defaultCompanyId || '',
  );
  const { data: companyGroup } = useCompanyGroupQuery(defaultCompanyId);
  const companyOptions = useMemo(
    () =>
      (companyGroup?.companies ?? []).map((c) => ({
        value: c.id,
        label: c.name,
      })),
    [companyGroup],
  );

  const {
    options,
    setSearch,
    isLoading: optionsLoading,
  } = useFormResources(
    [
      'financeBanks',
      'financePaymentMethods',
      'financeTypes',
      'financeCategories',
      'financeSegments',
      'financePayees',
      'clients',
      'employees',
      'users',
    ],
    selectedCompanyId,
  );

  const mutation = useFinanceMutation(finance?.id);
  const receivableMutation = useFinanceReceivableMutation();

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

  const runWithSelectedCompany = async <T>(
    fn: () => Promise<T>,
  ): Promise<T> => {
    const originalCompany = companyService.getDefaultCompany();

    if (
      selectedCompanyId &&
      selectedCompanyId !== originalCompany?.id &&
      companyGroup?.companies
    ) {
      const picked = companyGroup.companies.find(
        (company) => company.id === selectedCompanyId,
      );

      if (picked) {
        companyService.setDefaultCompany({ ...picked, ownerId: '' } as Company);
      }
    }

    try {
      return await fn();
    } finally {
      if (originalCompany) {
        companyService.setDefaultCompany(originalCompany);
      }
    }
  };

  const normalizeName = (label: string) => {
    const name = label.trim();
    if (!name) throw new Error('invalid-label');
    return name;
  };

  const buildBankCode = (name: string) => {
    const base = name
      .replace(/[^0-9A-Za-z]/g, '')
      .toUpperCase()
      .slice(0, 6);
    return `${base || 'BANK'}-${Date.now().toString().slice(-4)}`;
  };

  const handleCreateFinanceBank = async (label: string) => {
    const name = normalizeName(label);
    const created = await runWithSelectedCompany(() =>
      financeBankService.create({ name, code: buildBankCode(name) }),
    );
    return created.id;
  };

  const handleCreateFinancePaymentMethod = async (label: string) => {
    const name = normalizeName(label);
    const created = await runWithSelectedCompany(() =>
      financePaymentMethodService.create({ name }),
    );
    return created.id;
  };

  const handleCreateFinanceType = async (label: string) => {
    const name = normalizeName(label);
    const created = await runWithSelectedCompany(() =>
      financeTypeService.create({ name, needApprove: false }),
    );
    return created.id;
  };

  const handleCreateFinanceSegment = async (label: string) => {
    const name = normalizeName(label);
    const created = await runWithSelectedCompany(() =>
      financeSegmentService.create({ name }),
    );
    return created.id;
  };

  const handleCreateFinanceCategory = async (label: string) => {
    const name = normalizeName(label);
    const created = await runWithSelectedCompany(() =>
      financeCategoryService.create({ name }),
    );
    return created.id;
  };

  const handleCreateFinancePayee = async (label: string) => {
    const name = normalizeName(label);
    const created = await runWithSelectedCompany(() =>
      financePayeeService.create({ name }),
    );
    return created.id;
  };

  const handleOpenCreateEmployee = (label: string) => {
    setEmployeeInitialName(normalizeName(label));
    setEmployeeDrawerOpen(true);

    return new Promise<string>((resolve, reject) => {
      employeeCreateRef.current = { resolve, reject };
    });
  };

  const handleCloseEmployeeDrawer = () => {
    setEmployeeDrawerOpen(false);
    setEmployeeInitialName('');

    if (employeeCreateRef.current) {
      employeeCreateRef.current.reject(new Error('cancelled'));
      employeeCreateRef.current = null;
    }
  };

  const handleEmployeeCreated = (employee: Employee) => {
    employeeCreateRef.current?.resolve(employee.id);
    employeeCreateRef.current = null;
    setEmployeeDrawerOpen(false);
    setEmployeeInitialName('');
  };

  const handleOpenCreateClient = (label: string) => {
    setClientInitialName(label);
    setClientDrawerOpen(true);

    return new Promise<string>((resolve, reject) => {
      clientCreateRef.current = { resolve, reject };
    });
  };

  const handleCloseClientDrawer = () => {
    setClientDrawerOpen(false);
    setClientInitialName('');

    if (clientCreateRef.current) {
      clientCreateRef.current.reject(new Error('cancelled'));
      clientCreateRef.current = null;
    }
  };

  const handleClientCreated = (client: Client) => {
    clientCreateRef.current?.resolve(client.id);
    clientCreateRef.current = null;
    setClientDrawerOpen(false);
    setClientInitialName('');
  };

  const handleOpenCreateResponsible = (label: string) => {
    setResponsibleInitialName(label);
    setResponsibleDrawerOpen(true);

    return new Promise<string>((resolve, reject) => {
      responsibleCreateRef.current = { resolve, reject };
    });
  };

  const handleCloseResponsibleDrawer = () => {
    setResponsibleDrawerOpen(false);
    setResponsibleInitialName('');

    if (responsibleCreateRef.current) {
      responsibleCreateRef.current.reject(new Error('cancelled'));
      responsibleCreateRef.current = null;
    }
  };

  const handleResponsibleCreated = (user: User) => {
    responsibleCreateRef.current?.resolve(user.id);
    responsibleCreateRef.current = null;
    setResponsibleDrawerOpen(false);
    setResponsibleInitialName('');
  };

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
        else if (finance.payeeId) setPaidTo('other');
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
    if (finance && isFinanceCancelled(finance.status)) {
      toast.error('Lançamentos cancelados não podem ser editados.');
      return;
    }
    setLoading(true);
    const originalCompany = companyService.getDefaultCompany();
    if (selectedCompanyId && selectedCompanyId !== originalCompany?.id) {
      const picked = companyGroup?.companies.find(
        (c) => c.id === selectedCompanyId,
      );
      if (picked)
        companyService.setDefaultCompany({ ...picked, ownerId: '' } as Company);
    }
    try {
      const normalizedOutTargets =
        values.flow === FinanceFlowEnum.OUT
          ? {
              clientId: paidTo === 'client' ? values.clientId : undefined,
              employeeId: paidTo === 'employee' ? values.employeeId : undefined,
              payeeId: paidTo === 'other' ? values.payeeId : undefined,
            }
          : {};

      const payload = {
        ...values,
        ...normalizedOutTargets,
        value: Math.round(Number(values.value || 0) * 100),
      };
      if (finance) {
        await mutation.mutateAsync({
          type: 'update',
          id: finance.id,
          data: payload,
        });
        toast.success('Lançamento atualizado com sucesso');
      } else if (isDuplicata) {
        await receivableMutation.mutateAsync({
          type: 'create',
          data: {
            title: values.title,
            description: values.description,
            observation: values.observation,
            totalValue: Math.round(Number(values.value || 0) * 100),
            installmentCount,
            firstDueDate: values.date
              ? new Date(values.date).toISOString()
              : new Date().toISOString(),
            flow: values.flow as FinanceFlowEnum,
            bankId: values.bankId,
            methodId: values.methodId,
            typeId: values.typeId || undefined,
            categoryId: values.categoryId || undefined,
            segmentId: values.segmentId || undefined,
            payeeId:
              paidTo === 'other' ? values.payeeId || undefined : undefined,
            clientId:
              paidTo === 'client' ? values.clientId || undefined : undefined,
            employeeId:
              paidTo === 'employee' ? values.employeeId || undefined : undefined,
            responsibleId: values.responsibleId || undefined,
          },
        });
        toast.success(
          `Duplicata criada com ${installmentCount} parcelas`,
        );
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
      if (originalCompany) companyService.setDefaultCompany(originalCompany);
      setLoading(false);
    }
  });

  const handleClose = () => {
    reset(financeFormInitialValues);
    setIsDuplicata(false);
    setInstallmentCount(2);
    setSelectedCompanyId(companyService.getDefaultCompany()?.id || '');
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
    canCreateFinancialField,
    canCreateClient,
    canCreateEmployee,
    canCreateUser,
    handleCreateFinanceBank,
    handleCreateFinancePaymentMethod,
    handleCreateFinanceType,
    handleCreateFinanceSegment,
    handleCreateFinanceCategory,
    handleCreateFinancePayee,
    handleOpenCreateEmployee,
    handleOpenCreateClient,
    clientDrawerOpen,
    clientInitialName,
    handleCloseClientDrawer,
    handleClientCreated,
    handleOpenCreateResponsible,
    responsibleDrawerOpen,
    responsibleInitialName,
    handleCloseResponsibleDrawer,
    handleResponsibleCreated,
    employeeDrawerOpen,
    employeeInitialName,
    handleCloseEmployeeDrawer,
    handleEmployeeCreated,
    paidTo,
    setPaidTo,
    companyOptions,
    selectedCompanyId,
    setSelectedCompanyId,
    isDuplicata,
    setIsDuplicata,
    installmentCount,
    setInstallmentCount,
  };
};

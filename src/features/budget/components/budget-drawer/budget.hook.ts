import { Client } from '@/features/client/types';
import { useCompanyPermissions } from '@/hooks/common/permission';
import { useCompanyGroupQuery } from '@/hooks/queries/company-group.query';
import { useFormResources } from '@/hooks/use-form-resources';
import { companyService } from '@/services/company.service';
import { Company } from '@/types/company';
import { User } from '@/types/user';
import { formatterSelectOptions } from '@/utils/select';
import { yupResolver } from '@hookform/resolvers/yup';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { useBudgetTypesQuery } from '../../hooks/queries/budget-types.query';
import { useBudgetMutation } from '../../hooks/queries/budgets.query';
import {
  BudgetFormDto,
  budgetFormInitialValues,
  budgetFormSchema,
} from '../../schemas/budget-drawer.schema';
import { budgetTypeService } from '../../services/budget-type.service';
import { budgetService } from '../../services/budget.service';
import type { Budget } from '../../types/budget';
import { budgetFromCents, budgetToCents } from '../../util/currency';
type HookProps = {
  onClose: () => void;
  open: boolean;
  budget: Budget | null;
  onSuccess?: () => void;
};

export const useBudgetDrawer = ({
  onClose,
  open,
  budget: selectedBudget,
  onSuccess,
}: HookProps) => {
  const { hasPermission } = useCompanyPermissions();
  const budget = selectedBudget || null;
  const [loading, setLoading] = useState(false);

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

  const { options: resourceOptions, setSearch } = useFormResources(
    ['clients', 'users'],
    selectedCompanyId,
  );

  const canCreateClient = hasPermission('client', 'write');
  const canCreateBudgetType = hasPermission('budget', 'write');
  const canCreateUser = hasPermission('user', 'write');
  const [clientDrawerOpen, setClientDrawerOpen] = useState(false);
  const [clientInitialName, setClientInitialName] = useState('');
  const [responsibleDrawerOpen, setResponsibleDrawerOpen] = useState(false);
  const [responsibleInitialName, setResponsibleInitialName] = useState('');

  const clientCreateRef = useRef<{
    resolve: (id: string) => void;
    reject: (error: Error) => void;
  } | null>(null);
  const responsibleCreateRef = useRef<{
    resolve: (id: string) => void;
    reject: (error: Error) => void;
  } | null>(null);

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

  const handleCreateBudgetType = async (label: string) => {
    const name = label.trim();
    if (!name) throw new Error('invalid-label');

    const created = await runWithSelectedCompany(() =>
      budgetTypeService.create({ name, needApprove: false }),
    );

    return created.id;
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

  const { data: budgetTypes } = useBudgetTypesQuery(selectedCompanyId);

  const options = useMemo(() => {
    return {
      clients: resourceOptions.clients ?? [],
      types: formatterSelectOptions(budgetTypes, 'id', 'name'),
      users: resourceOptions.users ?? [],
    };
  }, [resourceOptions, budgetTypes]);

  const { control, handleSubmit, reset, setValue } = useForm<BudgetFormDto>({
    defaultValues: budgetFormInitialValues,
    resolver: yupResolver(budgetFormSchema) as any,
  });
  const mutation = useBudgetMutation(budget?.id);

  const handleBudget = handleSubmit(async (data: BudgetFormDto) => {
    const normalizedItems = (data.items || []).map((item: any) => ({
      ...item,
      quantity:
        item?.quantity === undefined ||
        item?.quantity === null ||
        item?.quantity === ''
          ? undefined
          : Number(item.quantity),
      value: budgetToCents(item?.value),
    }));

    const total = normalizedItems.reduce((sum, it: any) => {
      const qty = Number(it?.quantity ?? 1) || 0;
      const val = Number(it?.value ?? 0) || 0;
      return sum + qty * val;
    }, 0);

    const payload = { ...data, items: normalizedItems, value: total } as any;

    try {
      setLoading(true);
      const originalCompany = companyService.getDefaultCompany();
      if (selectedCompanyId && selectedCompanyId !== originalCompany?.id) {
        const picked = companyGroup?.companies.find(
          (c) => c.id === selectedCompanyId,
        );
        if (picked)
          companyService.setDefaultCompany({
            ...picked,
            ownerId: '',
          } as Company);
      }
      const result = await mutation.mutateAsync({
        type: budget ? 'update' : 'create',
        id: budget?.id,
        data: payload,
      });
      if (originalCompany) companyService.setDefaultCompany(originalCompany);

      if (result) {
        toast.success(
          budget
            ? 'Orçamento atualizado com sucesso'
            : 'Orçamento criado com sucesso',
        );
        handleClose();
        onClose();
        if (onSuccess) onSuccess();
      }
    } catch (e) {
      console.error(e);
      toast.error('Erro ao salvar orçamento');
    } finally {
      setLoading(false);
    }
  });

  const handleClose = () => {
    onClose();
    reset();
  };

  useEffect(() => {
    const fill = (b: Budget) => {
      reset({
        title: b.title || '',
        description: b.description || '',
        observation: b.observation || '',
        value: budgetFromCents(b.value as number) ?? '',
        clientId: (b.client as any)?.id || b.clientId || '',
        typeId: b.typeId || '',
        responsibleId: (b.responsible as any)?.id || b.responsibleId || '',
        items: (b.items || []).map((it: any) => ({
          label: it?.label ?? '',
          type: it?.type ?? 'PRODUCT',
          quantity: it?.quantity ?? 1,
          value: budgetFromCents(it?.value ?? 0),
        })),
      });
    };

    (async () => {
      if (budget) {
        if (!Array.isArray((budget as any).items)) {
          try {
            const full = await budgetService.getById(
              budget.id,
              budget.companyId,
            );
            fill(full);
            return;
          } catch {
            // fallback to basic fill without items
          }
        }
        fill(budget);
      } else {
        reset(budgetFormInitialValues);
      }
    })();
  }, [budget, reset]);

  return {
    control,
    setValue,
    handleBudget,
    loading,
    handleClose,
    open,
    options,
    editing: !!budget,
    setSearch,
    canCreateClient,
    canCreateBudgetType,
    canCreateUser,
    handleCreateBudgetType,
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
    companyOptions,
    selectedCompanyId,
    setSelectedCompanyId,
  };
};

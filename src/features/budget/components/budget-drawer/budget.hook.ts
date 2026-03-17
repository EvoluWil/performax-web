import { useClientsQuery } from '@/features/client/hooks';
import { useUsersQuery } from '@/features/user/hooks';
import { formatterSelectOptions } from '@/utils/select';
import { yupResolver } from '@hookform/resolvers/yup';
import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { useBudgetTypesQuery } from '../../hooks/queries/budget-types.query';
import { useBudgetMutation } from '../../hooks/queries/budgets.query';
import {
  BudgetFormDto,
  budgetFormInitialValues,
  budgetFormSchema,
} from '../../schemas/budget-drawer.schema';
import { budgetService } from '../../services/budget.service';
import type { Budget } from '../../types/budget';
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
  const budget = selectedBudget || null;
  const [loading, setLoading] = useState(false);

  const { data: clientsQueryData } = useClientsQuery({
    scopeModule: 'client',
    pageSize: 1000,
  });

  const { data: budgetTypes } = useBudgetTypesQuery();

  const { data: usersResponse } = useUsersQuery({
    scopeModule: 'budget',
    pageSize: 1000,
  });

  const clients = useMemo(() => {
    return clientsQueryData?.clients ?? [];
  }, [clientsQueryData]);

  const users = useMemo(() => {
    return usersResponse?.users || [];
  }, [usersResponse]);

  const options = useMemo(() => {
    return {
      clients: formatterSelectOptions(clients, 'id', 'name'),
      types: formatterSelectOptions(budgetTypes, 'id', 'name'),
      users: formatterSelectOptions(users, 'id', 'name'),
    };
  }, [clients, budgetTypes, users]);

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
    }));

    const total = (data.items || []).reduce((sum, it: any) => {
      const qty = Number(it?.quantity ?? 1) || 0;
      const val = Number(it?.value ?? 0) || 0;
      return sum + qty * val;
    }, 0);

    const payload = { ...data, items: normalizedItems, value: total } as any;

    try {
      setLoading(true);
      const result = await mutation.mutateAsync({
        type: budget ? 'update' : 'create',
        id: budget?.id,
        data: payload,
      });

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
        value: (b.value as any) ?? '',
        clientId: (b.client as any)?.id || b.clientId || '',
        typeId: b.typeId || '',
        responsibleId: (b.responsible as any)?.id || b.responsibleId || '',
        items: (b.items || []).map((it: any) => ({
          label: it?.label ?? '',
          type: it?.type ?? 'PRODUCT',
          quantity: it?.quantity ?? 1,
          value: it?.value ?? 0,
        })),
      });
    };

    (async () => {
      if (budget) {
        if (!Array.isArray((budget as any).items)) {
          try {
            const full = await budgetService.getById(budget.id);
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
  };
};

import { Option } from '@/components/inputs/select-input/select-input';
import { useClientsQuery } from '@/features/client/hooks';
import { useUsersQuery } from '@/features/user/hooks';
import { formatterSelectOptions } from '@/utils/select';
import { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { useBudgetTypesQuery } from '../../hooks/queries/budget-types.query';
import {
  BUDGET_STATUS_FILTER_MAP,
  BudgetFilterDto,
  budgetFilterInitialValues,
} from '../../schemas/budget-filter.schema';
import { budgetStatusLabels } from '../../types/budget';

type Options = {
  types: Option[];
  clients: Option[];
  users: Option[];
};

const statusOptions = BUDGET_STATUS_FILTER_MAP.map(({ status }) => ({
  value: status,
  label:
    budgetStatusLabels[status as keyof typeof budgetStatusLabels]?.label ??
    status,
}));

export function useBudgetFilter(onFilter: (data: BudgetFilterDto) => void) {
  const { data: budgetTypesData } = useBudgetTypesQuery();
  const { data: clientsQueryData } = useClientsQuery({
    scopeModule: 'client',
    pageSize: 1000,
  });
  const clientsList = clientsQueryData?.clients ?? [];
  const { data: usersData } = useUsersQuery({ scopeModule: 'budget' });
  const { control, handleSubmit, setValue, watch } = useForm<BudgetFilterDto>({
    defaultValues: budgetFilterInitialValues,
  });

  const watchedStatuses = watch(
    BUDGET_STATUS_FILTER_MAP.map(
      ({ field }) => field,
    ) as (keyof BudgetFilterDto)[],
  );

  const statusFilters = useMemo(() => {
    return BUDGET_STATUS_FILTER_MAP.filter(({ field }, index) =>
      Boolean(watchedStatuses[index]),
    ).map(({ status }) => status);
  }, [watchedStatuses]);

  const options: Options = useMemo(() => {
    const types = formatterSelectOptions(budgetTypesData || [], 'id', 'name');
    const clients = formatterSelectOptions(clientsList || [], 'id', 'name');
    const users = formatterSelectOptions(usersData?.users || [], 'id', 'name');
    return { types, clients, users };
  }, [budgetTypesData, clientsList, usersData]);

  const hasUserFilter = true;

  const handleUpdateStatuses = (selectedStatuses: string[]) => {
    for (const { status, field } of BUDGET_STATUS_FILTER_MAP) {
      setValue(field, selectedStatuses.includes(status));
    }
    handleFilter();
  };

  const handleFilter = handleSubmit(onFilter);

  return {
    control,
    options,
    hasUserFilter,
    handleFilter,
    handleUpdateStatuses,
    statusFilters,
    statusOptions,
  };
}

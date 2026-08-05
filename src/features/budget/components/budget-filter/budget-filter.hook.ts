import { BUDGET_FILTER_FIELDS } from '@/constants/filter-permissions';
import { useFilterFieldAccess } from '@/hooks/common/use-filter-field-access';
import { useFormResources } from '@/hooks/use-form-resources';
import { ResourceKey } from '@/services/form-resources.service';
import { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import {
  BUDGET_STATUS_FILTER_MAP,
  BudgetFilterDto,
  budgetFilterInitialValues,
} from '../../schemas/budget-filter.schema';
import { budgetStatusLabels } from '../../types/budget';

const statusOptions = BUDGET_STATUS_FILTER_MAP.map(({ status }) => ({
  value: status,
  label:
    budgetStatusLabels[status as keyof typeof budgetStatusLabels]?.label ??
    status,
}));

export function useBudgetFilter(onFilter: (data: BudgetFilterDto) => void) {
  const fieldAccess = useFilterFieldAccess(BUDGET_FILTER_FIELDS);

  const resources = useMemo(() => {
    const keys: ResourceKey[] = [];
    if (fieldAccess.clientIds) keys.push('clients');
    if (fieldAccess.userIds) keys.push('users');
    if (fieldAccess.typeIds) keys.push('budgetTypes');
    return keys;
  }, [fieldAccess]);

  const { options, setSearch, isLoading } = useFormResources(resources);

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
    setSearch,
    isLoading,
    fieldAccess,
    handleFilter,
    handleUpdateStatuses,
    statusFilters,
    statusOptions,
  };
}

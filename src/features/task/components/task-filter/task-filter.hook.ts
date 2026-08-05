import { TASK_FILTER_FIELDS } from '@/constants/filter-permissions';
import {
  TASK_STATUS_FILTER_MAP,
  TaskFilterDto,
  taskFilterInitialValues,
} from '@/features/task/schemas';
import { taskStatusLabels } from '@/features/task/types';
import { useFilterFieldAccess } from '@/hooks/common/use-filter-field-access';
import { useFormResources } from '@/hooks/use-form-resources';
import { ResourceKey } from '@/services/form-resources.service';
import { useMemo } from 'react';
import { useForm } from 'react-hook-form';

const statusOptions = TASK_STATUS_FILTER_MAP.map(({ status }) => ({
  value: status,
  label: taskStatusLabels[status as keyof typeof taskStatusLabels]?.label ?? status,
}));

export function useTaskFilter(onFilter: (data: TaskFilterDto) => void) {
  const fieldAccess = useFilterFieldAccess(TASK_FILTER_FIELDS);

  const resources = useMemo(() => {
    const keys: ResourceKey[] = [];
    if (fieldAccess.clientIds) keys.push('clients');
    if (fieldAccess.userIds) keys.push('users');
    if (fieldAccess.typeIds) keys.push('taskTypes');
    return keys;
  }, [fieldAccess]);

  const { options, setSearch, isLoading } = useFormResources(resources);

  const { control, handleSubmit, setValue, watch } = useForm<TaskFilterDto>({
    defaultValues: taskFilterInitialValues,
  });

  const watchedStatuses = watch(
    TASK_STATUS_FILTER_MAP.map(({ field }) => field) as (keyof TaskFilterDto)[],
  );

  const statusFilters = useMemo(() => {
    return TASK_STATUS_FILTER_MAP.filter(({ field }, index) =>
      Boolean(watchedStatuses[index]),
    ).map(({ status }) => status);
  }, [watchedStatuses]);

  const handleUpdateStatuses = (selectedStatuses: string[]) => {
    for (const { status, field } of TASK_STATUS_FILTER_MAP) {
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

import { TASK_FILTER_FIELDS } from '@/constants/filter-permissions';
import {
  TASK_STATUS_FILTER_MAP,
  TaskFilterDto,
  taskFilterInitialValues,
} from '@/features/task/schemas';
import { taskStatusLabels } from '@/features/task/types';
import { useClosedTaskFilterAccess } from '@/hooks/common/use-closed-task-filter-access';
import { useFilterFieldAccess } from '@/hooks/common/use-filter-field-access';
import { useFormResources } from '@/hooks/use-form-resources';
import { ResourceKey } from '@/services/form-resources.service';
import { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';

export function useTaskFilter(
  onFilter: (data: TaskFilterDto) => void,
  values?: TaskFilterDto,
) {
  const canSeeClosedFilter = useClosedTaskFilterAccess();
  const fieldAccess = useFilterFieldAccess(TASK_FILTER_FIELDS);

  const resources = useMemo(() => {
    const keys: ResourceKey[] = [];
    if (fieldAccess.clientIds) keys.push('clients');
    if (fieldAccess.userIds) keys.push('users');
    if (fieldAccess.typeIds) keys.push('taskTypes');
    return keys;
  }, [fieldAccess]);

  const { options, setSearch, isLoading } = useFormResources(resources);

  const visibleStatusFilterMap = useMemo(
    () =>
      canSeeClosedFilter
        ? TASK_STATUS_FILTER_MAP
        : TASK_STATUS_FILTER_MAP.filter(({ status }) => status !== 'CLOSED'),
    [canSeeClosedFilter],
  );

  const statusOptions = useMemo(
    () =>
      visibleStatusFilterMap.map(({ status }) => ({
        value: status,
        label:
          taskStatusLabels[status as keyof typeof taskStatusLabels]?.label ??
          status,
      })),
    [visibleStatusFilterMap],
  );

  const { control, handleSubmit, setValue, watch, reset } = useForm<TaskFilterDto>({
    defaultValues: values ?? taskFilterInitialValues,
  });

  useEffect(() => {
    if (values) {
      reset(values);
    }
  }, [values, reset]);

  const watchedStatuses = watch(
    visibleStatusFilterMap.map(
      ({ field }) => field,
    ) as (keyof TaskFilterDto)[],
  );

  const statusFilters = useMemo(() => {
    return visibleStatusFilterMap
      .filter(({ field }, index) => Boolean(watchedStatuses[index]))
      .map(({ status }) => status);
  }, [visibleStatusFilterMap, watchedStatuses]);

  const handleUpdateStatuses = (selectedStatuses: string[]) => {
    for (const { status, field } of TASK_STATUS_FILTER_MAP) {
      setValue(
        field,
        status === 'CLOSED' && !canSeeClosedFilter
          ? false
          : selectedStatuses.includes(status),
      );
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

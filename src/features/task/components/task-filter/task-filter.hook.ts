import { Option } from '@/components/inputs/select-input/select-input';
import { TASK_FILTER_FIELDS } from '@/constants/filter-permissions';
import { useClientsQuery } from '@/features/client/hooks';
import { useTaskTypesQuery } from '@/features/task/hooks';
import {
  TASK_STATUS_FILTER_MAP,
  TaskFilterDto,
  taskFilterInitialValues,
} from '@/features/task/schemas';
import { taskStatusLabels } from '@/features/task/types';
import { useUsersQuery } from '@/features/user/hooks';
import { useFilterFieldAccess } from '@/hooks/common/use-filter-field-access';
import { formatterSelectOptions } from '@/utils/select';
import { useMemo } from 'react';
import { useForm } from 'react-hook-form';

type Options = {
  types: Option[];
  clients: Option[];
  users: Option[];
};

const statusOptions = TASK_STATUS_FILTER_MAP.map(({ status }) => ({
  value: status,
  label: taskStatusLabels[status as keyof typeof taskStatusLabels]?.label ?? status,
}));

export function useTaskFilter(onFilter: (data: TaskFilterDto) => void) {
  const fieldAccess = useFilterFieldAccess(TASK_FILTER_FIELDS);
  const { data: taskTypesData } = useTaskTypesQuery();
  const { data: clientsQueryData } = useClientsQuery({
    scopeModule: 'client',
    pageSize: 1000,
    enabled: fieldAccess.clientId,
  });
  const clientsList = clientsQueryData?.clients ?? [];
  const { data: usersData } = useUsersQuery({
    scopeModule: 'user',
    enabled: fieldAccess.userId,
  });
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

  const options: Options = useMemo(() => {
    const types = formatterSelectOptions(taskTypesData || [], 'id', 'name');
    const clients = formatterSelectOptions(clientsList || [], 'id', 'name');
    const users = formatterSelectOptions(usersData?.users || [], 'id', 'name');
    return { types, clients, users };
  }, [taskTypesData, clientsList, usersData]);

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
    fieldAccess,
    handleFilter,
    handleUpdateStatuses,
    statusFilters,
    statusOptions,
  };
}

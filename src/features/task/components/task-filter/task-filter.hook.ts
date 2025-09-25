import { Option } from '@/components/inputs/select-input/select-input';
import { useClientsQuery } from '@/features/client/hooks';
import { useUsersQuery } from '@/features/user/hooks';
import { formatterSelectOptions } from '@/utils/select';
import { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { useTaskTypesQuery } from '../../hooks';
import { TaskFilterDto, taskFilterInitialValues } from '../../schemas';

type Options = {
  types: Option[];
  clients: Option[];
  users: Option[];
};

export function useTaskFilter(onFilter: (data: TaskFilterDto) => void) {
  const { data: taskTypesData } = useTaskTypesQuery();
  const { data: clientsData } = useClientsQuery();
  const { data: usersData } = useUsersQuery();
  const { control, handleSubmit, setValue, watch } = useForm<TaskFilterDto>({
    defaultValues: taskFilterInitialValues,
  });

  const [open, inProgress, closed] = watch(['open', 'in_progress', 'closed']);

  const statusFilters = useMemo(() => {
    const statuses: string[] = [];
    if (open) statuses.push('OPEN');
    if (inProgress) statuses.push('IN_PROGRESS');
    if (closed) statuses.push('COMPLETED');
    return statuses;
  }, [open, inProgress, closed]);

  const options: Options = useMemo(() => {
    const types = formatterSelectOptions(taskTypesData || [], 'id', 'name');
    const clients = formatterSelectOptions(
      clientsData?.data || [],
      'id',
      'name',
    );
    const users = formatterSelectOptions(usersData?.data || [], 'id', 'name');
    return { types, clients, users };
  }, [taskTypesData, clientsData, usersData]);

  const hasUserFilter = true;

  const handleUpdateStatuses = (selectedStatuses: string[]) => {
    if (selectedStatuses.length === 0) {
      setValue('open', false);
      setValue('in_progress', false);
      setValue('closed', false);
    }
    if (selectedStatuses.includes('OPEN')) {
      setValue('open', true);
      setValue('expired', true);
      setValue('emergency', true);
      setValue('scheduled', true);
      setValue('impeded', true);
    } else {
      setValue('open', false);
      setValue('expired', false);
      setValue('emergency', false);
      setValue('scheduled', false);
      setValue('impeded', false);
    }
    if (selectedStatuses.includes('IN_PROGRESS')) {
      setValue('in_progress', true);
    } else {
      setValue('in_progress', false);
    }

    if (selectedStatuses.includes('COMPLETED')) {
      setValue('closed', true);
    } else {
      setValue('closed', false);
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
  };
}

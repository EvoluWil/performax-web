import { Option } from '@/components/inputs/select-input/select-input';
import { useClientsQuery } from '@/features/client/hooks';
import {
  OccurrenceFilterDto,
  occurrenceFilterInitialValues,
} from '@/features/occurrence/schemas';
import { useUsersQuery } from '@/features/user/hooks';
import { formatterSelectOptions } from '@/utils/select';
import { useMemo } from 'react';
import { useForm } from 'react-hook-form';

type Options = {
  clients: Option[];
  users: Option[];
};

export function useOccurrenceFilter(
  onFilter: (data: OccurrenceFilterDto) => void,
) {
  const { data: clientsQueryData } = useClientsQuery({
    scopeModule: 'client',
    pageSize: 1000,
  });
  const { data: usersData } = useUsersQuery({ scopeModule: 'occurrence' });

  const { control, handleSubmit, setValue, watch } =
    useForm<OccurrenceFilterDto>({
      defaultValues: occurrenceFilterInitialValues,
    });

  const [open, closed] = watch(['open', 'closed']);

  const statusFilters = useMemo(() => {
    const statuses: string[] = [];
    if (open) statuses.push('OPEN');
    if (closed) statuses.push('CLOSED');
    return statuses;
  }, [open, closed]);

  const options: Options = useMemo(() => {
    const clientsList = clientsQueryData?.clients ?? [];
    const clients = formatterSelectOptions(clientsList || [], 'id', 'name');
    const users = formatterSelectOptions(usersData?.users || [], 'id', 'name');
    return { clients, users };
  }, [clientsQueryData, usersData]);

  const handleUpdateStatuses = (selectedStatuses: string[]) => {
    if (selectedStatuses.length === 0) {
      setValue('open', false);
      setValue('closed', false);
    }

    setValue('open', selectedStatuses.includes('OPEN'));
    setValue('closed', selectedStatuses.includes('CLOSED'));

    handleFilter();
  };

  const handleFilter = handleSubmit(onFilter);

  return {
    control,
    options,
    handleFilter,
    handleUpdateStatuses,
    statusFilters,
  };
}

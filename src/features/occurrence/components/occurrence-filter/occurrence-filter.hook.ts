import { Option } from '@/components/inputs/select-input/select-input';
import { useClientsQuery } from '@/features/client/hooks';
import {
  OCCURRENCE_STATUS_FILTER_MAP,
  OccurrenceFilterDto,
  occurrenceFilterInitialValues,
} from '@/features/occurrence/schemas';
import { occurrenceStatusLabels } from '@/features/occurrence/types/occurrence';
import { useUsersQuery } from '@/features/user/hooks';
import { formatterSelectOptions } from '@/utils/select';
import { useMemo } from 'react';
import { useForm } from 'react-hook-form';

type Options = {
  clients: Option[];
  users: Option[];
};

const statusOptions = OCCURRENCE_STATUS_FILTER_MAP.map(({ status }) => ({
  value: status,
  label:
    occurrenceStatusLabels[status as keyof typeof occurrenceStatusLabels]
      ?.label ?? status,
}));

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

  const watchedStatuses = watch(
    OCCURRENCE_STATUS_FILTER_MAP.map(
      ({ field }) => field,
    ) as (keyof OccurrenceFilterDto)[],
  );

  const statusFilters = useMemo(() => {
    return OCCURRENCE_STATUS_FILTER_MAP.filter(({ field }, index) =>
      Boolean(watchedStatuses[index]),
    ).map(({ status }) => status);
  }, [watchedStatuses]);

  const options: Options = useMemo(() => {
    const clientsList = clientsQueryData?.clients ?? [];
    const clients = formatterSelectOptions(clientsList || [], 'id', 'name');
    const users = formatterSelectOptions(usersData?.users || [], 'id', 'name');
    return { clients, users };
  }, [clientsQueryData, usersData]);

  const handleUpdateStatuses = (selectedStatuses: string[]) => {
    for (const { status, field } of OCCURRENCE_STATUS_FILTER_MAP) {
      setValue(field, selectedStatuses.includes(status));
    }
    handleFilter();
  };

  const handleFilter = handleSubmit(onFilter);

  return {
    control,
    options,
    handleFilter,
    handleUpdateStatuses,
    statusFilters,
    statusOptions,
  };
}

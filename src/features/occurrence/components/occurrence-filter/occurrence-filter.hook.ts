import { OCCURRENCE_FILTER_FIELDS } from '@/constants/filter-permissions';
import {
  OCCURRENCE_STATUS_FILTER_MAP,
  OccurrenceFilterDto,
  occurrenceFilterInitialValues,
} from '@/features/occurrence/schemas';
import { occurrenceStatusLabels } from '@/features/occurrence/types/occurrence';
import { useFilterFieldAccess } from '@/hooks/common/use-filter-field-access';
import { useFormResources } from '@/hooks/use-form-resources';
import { ResourceKey } from '@/services/form-resources.service';
import { useMemo } from 'react';
import { useForm } from 'react-hook-form';

const statusOptions = OCCURRENCE_STATUS_FILTER_MAP.map(({ status }) => ({
  value: status,
  label:
    occurrenceStatusLabels[status as keyof typeof occurrenceStatusLabels]
      ?.label ?? status,
}));

export function useOccurrenceFilter(
  onFilter: (data: OccurrenceFilterDto) => void,
) {
  const fieldAccess = useFilterFieldAccess(OCCURRENCE_FILTER_FIELDS);

  const resources = useMemo(() => {
    const keys: ResourceKey[] = [];
    if (fieldAccess.clientIds) keys.push('clients');
    if (fieldAccess.userIds) keys.push('users');
    return keys;
  }, [fieldAccess]);

  const { options, setSearch, isLoading } = useFormResources(resources);

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
    setSearch,
    isLoading,
    fieldAccess,
    handleFilter,
    handleUpdateStatuses,
    statusFilters,
    statusOptions,
  };
}

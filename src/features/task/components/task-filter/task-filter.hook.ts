import { Option } from '@/components/inputs/select-input/select-input';
import { useForm } from 'react-hook-form';

type Options = {
  types: Option[];
  clients: Option[];
  users: Option[];
};

export function useTaskFilter(onFilter: (data: any) => void) {
  const { control, handleSubmit } = useForm({
    defaultValues: {
      open: true,
      expired: true,
      emergency: true,
      scheduled: true,
      impeded: true,
      in_progress: true,
      closed: false,
      title: '',
      protocol: '',
      typeId: '',
      startDate: '',
      endDate: '',
      clientId: '',
      userId: '',
    },
  });

  // TODO: wire real options; placeholders to avoid crash
  const options: Options = { types: [], clients: [], users: [] };

  const hasUserFilter = true;

  const handleFilter = handleSubmit(onFilter);

  return { control, options, hasUserFilter, handleFilter };
}

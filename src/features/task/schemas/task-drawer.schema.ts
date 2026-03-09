import { ChecklistDtoSchema } from '@/features/task/components';
import { ChecklistDto } from '@/features/task/types';
import { File } from '@/types/file';
import { subHours } from 'date-fns';
import * as yup from 'yup';

export type TaskFormDto = {
  title: string;
  description: string;
  date: string;
  value?: number;
  files?: File[];
  responsibleId?: string;
  clientId: string;
  typeId: string;
  status: string;
  internalNote?: string;
  impedimentNote?: string;
  checklist?: ChecklistDto | null;
  recurrence?: string;
};

export const taskFormInitialValues: TaskFormDto = {
  title: '',
  description: '',
  date: '',
  value: 0,
  files: [],
  responsibleId: '',
  clientId: '',
  typeId: '',
  status: '',
  internalNote: '',
  impedimentNote: '',
  checklist: { modules: [] },
  recurrence: '',
};

export const taskFormSchema = yup.object().shape({
  title: yup.string().required('Titulo é obrigatório'),
  description: yup.string().required('Detalhe da OS é obrigatório'),
  date: yup
    .string()
    .required('Data de previsão é obrigatória')
    .test(
      'is-after',
      'Data de prevista deve ser pelo menos 1 hora maior do que a data atual',
      (value) => {
        return !value || new Date(value) > subHours(new Date(), 2);
      },
    )
    .required('Data de previsão é obrigatória')
    .transform((value) => value && subHours(new Date(value), 3).toISOString()),
  clientId: yup.string().required('Cliente é obrigatório'),
  typeId: yup.string().required('Tipo de OS é obrigatório'),
  status: yup.string().required(),
  checklist: ChecklistDtoSchema.notRequired(),
  recurrence: yup.string().optional(),
});

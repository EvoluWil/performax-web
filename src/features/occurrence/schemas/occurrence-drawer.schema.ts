import { File } from '@/types/file';
import * as yup from 'yup';

export type OccurrenceFormDto = {
  title: string;
  description: string;
  observation: string;
  date: string;
  clientId?: string;
  typeId: string;
  responsibleId?: string;
  documents?: File[];
};

export const occurrenceFormInitialValues: OccurrenceFormDto = {
  title: '',
  description: '',
  observation: '',
  date: '',
  clientId: '',
  typeId: '',
  responsibleId: '',
  documents: [],
};

export const occurrenceFormSchema = yup.object().shape({
  title: yup.string().required('Título é obrigatório'),
  description: yup.string().optional(),
  observation: yup.string().optional(),
  date: yup
    .string()
    .required('Data é obrigatória')
    .transform((value) => (value ? new Date(value).toISOString() : value)),
  clientId: yup.string().required('Cliente é obrigatório'),
  typeId: yup.string().required('Tipo de ocorrência é obrigatório'),
  responsibleId: yup.string().required('Responsável é obrigatório'),
  documents: yup.array().optional(),
});

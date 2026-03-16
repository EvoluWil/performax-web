import * as yup from 'yup';

export type OccurrenceTypeFormDto = {
  name: string;
  needApprove: boolean;
};

export const occurrenceTypeFormInitialValues: OccurrenceTypeFormDto = {
  name: '',
  needApprove: false,
};

export const occurrenceTypeFormSchema = yup.object().shape({
  name: yup.string().required('Nome é obrigatório'),
  needApprove: yup.boolean().required('Aprovação é obrigatória').default(false),
});

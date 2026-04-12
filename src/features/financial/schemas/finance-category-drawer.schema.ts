import * as yup from 'yup';

export type FinanceCategoryFormDto = {
  name: string;
  segmentId: string;
};

export const financeCategoryFormInitialValues: FinanceCategoryFormDto = {
  name: '',
  segmentId: '',
};

export const financeCategoryFormSchema = yup.object().shape({
  name: yup.string().required('Nome é obrigatório'),
  segmentId: yup.string().required('Segmento é obrigatório'),
});

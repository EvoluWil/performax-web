import * as yup from 'yup';

export type FinanceCategoryFormDto = {
  name: string;
};

export const financeCategoryFormInitialValues: FinanceCategoryFormDto = {
  name: '',
};

export const financeCategoryFormSchema = yup.object().shape({
  name: yup.string().required('Nome é obrigatório'),
});

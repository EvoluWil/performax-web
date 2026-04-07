import * as yup from 'yup';

export type FinanceSegmentFormDto = {
  name: string;
};

export const financeSegmentFormInitialValues: FinanceSegmentFormDto = {
  name: '',
};

export const financeSegmentFormSchema = yup.object().shape({
  name: yup.string().required('Nome é obrigatório'),
});

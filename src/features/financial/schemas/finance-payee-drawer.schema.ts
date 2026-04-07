import * as yup from 'yup';

export type FinancePayeeFormDto = {
  name: string;
};

export const financePayeeFormInitialValues: FinancePayeeFormDto = {
  name: '',
};

export const financePayeeFormSchema = yup.object().shape({
  name: yup.string().required('Nome é obrigatório'),
});

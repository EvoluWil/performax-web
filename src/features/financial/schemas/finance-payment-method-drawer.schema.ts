import * as yup from 'yup';

export type FinancePaymentMethodFormDto = {
  name: string;
};

export const financePaymentMethodFormInitialValues: FinancePaymentMethodFormDto =
  {
    name: '',
  };

export const financePaymentMethodFormSchema = yup.object().shape({
  name: yup.string().required('Nome é obrigatório'),
});

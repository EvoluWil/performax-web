import * as yup from 'yup';

export type FinanceBankFormDto = {
  name: string;
  code: string;
};

export const financeBankFormInitialValues: FinanceBankFormDto = {
  name: '',
  code: '',
};

export const financeBankFormSchema = yup.object().shape({
  name: yup.string().required('Nome é obrigatório'),
  code: yup.string().required('Código é obrigatório'),
});

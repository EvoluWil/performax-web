import * as yup from 'yup';

export type FinanceTypeFormDto = {
  name: string;
  needApprove: boolean;
};

export const financeTypeFormInitialValues: FinanceTypeFormDto = {
  name: '',
  needApprove: false,
};

export const financeTypeFormSchema = yup.object().shape({
  name: yup.string().required('Nome é obrigatório'),
  needApprove: yup.boolean().default(false),
});

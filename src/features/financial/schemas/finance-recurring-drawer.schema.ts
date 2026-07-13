import * as yup from 'yup';
import { FinanceFlowEnum } from '../types/finance';

export type FinanceRecurringFormDto = {
  title: string;
  description?: string;
  value?: number | string;
  date: string;
  flow: FinanceFlowEnum | '';
  recurrence?: string;
  endDate?: string;
  typeId?: string;
  bankId?: string;
  methodId?: string;
  categoryId?: string;
  segmentId?: string;
  payeeId?: string;
  clientId?: string;
};

export const financeRecurringFormInitialValues: FinanceRecurringFormDto = {
  title: '',
  description: '',
  value: '' as any,
  date: '',
  flow: '' as any,
  recurrence: '',
  endDate: '',
  typeId: '',
  bankId: '',
  methodId: '',
  categoryId: '',
  segmentId: '',
  payeeId: '',
  clientId: '',
};

export const financeRecurringFormSchema = yup.object().shape({
  title: yup.string().required('Título é obrigatório'),
  description: yup.string().nullable(),
  value: yup
    .mixed<number | string>()
    .test(
      'is-number',
      'Valor inválido',
      (v) => v === undefined || v === null || v === '' || !isNaN(Number(v)),
    )
    .nullable(),
  date: yup.string().required('Data é obrigatória'),
  flow: yup
    .mixed<FinanceFlowEnum>()
    .oneOf(Object.values(FinanceFlowEnum))
    .required('Fluxo é obrigatório'),
  recurrence: yup.string().nullable(),
  endDate: yup.string().nullable(),
  typeId: yup.string().nullable(),
  bankId: yup.string().nullable(),
  methodId: yup.string().nullable(),
  categoryId: yup.string().nullable(),
  segmentId: yup.string().nullable(),
  payeeId: yup.string().nullable(),
  clientId: yup.string().nullable(),
});

import * as yup from 'yup';
import { FinanceFlowEnum } from '../types/finance';

export type FinanceFormDto = {
  title: string;
  description?: string;
  value?: number | string;
  date: Date | string | null;
  observation?: string;
  flow: FinanceFlowEnum | '';
  typeId?: string;
  clientId?: string;
  methodId: string;
  bankId: string;
  categoryId?: string;
  segmentId?: string;
  payeeId?: string;
  responsibleId?: string;
  employeeId?: string;
  recurrence?: string;
};

export const financeFormInitialValues: FinanceFormDto = {
  title: '',
  description: '',
  value: 0,
  date: null,
  observation: '',
  flow: '',
  typeId: '',
  clientId: '',
  methodId: '',
  bankId: '',
  categoryId: '',
  segmentId: '',
  payeeId: '',
  responsibleId: '',
  employeeId: '',
  recurrence: '',
};

export const financeFormSchema = yup.object().shape({
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
  date: yup
    .mixed<Date | string>()
    .required('Data é obrigatória')
    .transform((value) => {
      if (!value) return value;
      if (value instanceof Date) return value.toISOString();
      return new Date(value).toISOString();
    }),
  observation: yup.string().nullable(),
  flow: yup
    .mixed<FinanceFlowEnum>()
    .oneOf(Object.values(FinanceFlowEnum))
    .required('Fluxo é obrigatório'),
  typeId: yup
    .string()
    .nullable()
    .transform((v) => v || undefined),
  clientId: yup
    .string()
    .nullable()
    .transform((v) => v || undefined),
  methodId: yup.string().required('Método de pagamento é obrigatório'),
  bankId: yup.string().required('Banco é obrigatório'),
  categoryId: yup
    .string()
    .nullable()
    .transform((v) => v || undefined),
  segmentId: yup
    .string()
    .nullable()
    .transform((v) => v || undefined),
  payeeId: yup
    .string()
    .nullable()
    .transform((v) => v || undefined),
  responsibleId: yup
    .string()
    .nullable()
    .transform((v) => v || undefined),
  employeeId: yup
    .string()
    .nullable()
    .transform((v) => v || undefined),
  recurrence: yup.string().optional().nullable(),
});

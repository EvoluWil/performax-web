import * as yup from 'yup';
import { FinanceFlowEnum } from '../types/finance';

export type FinancePaidToKind = 'employee' | 'payee' | '';

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
  paidToKind?: FinancePaidToKind;
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
  paidToKind: '',
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
  typeId: yup.string().required('Marcador é obrigatório'),
  clientId: yup.string().when('flow', {
    is: FinanceFlowEnum.OUT,
    then: (schema) => schema.required('Centro de custo é obrigatório'),
    otherwise: (schema) =>
      schema.nullable().transform((v) => v || undefined),
  }),
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
  payeeId: yup.string().when(['flow', 'paidToKind'], {
    is: (flow: FinanceFlowEnum, paidToKind: FinancePaidToKind) =>
      flow === FinanceFlowEnum.OUT && paidToKind === 'payee',
    then: (schema) => schema.required('Favorecido é obrigatório'),
    otherwise: (schema) =>
      schema.nullable().transform((v) => v || undefined),
  }),
  responsibleId: yup
    .string()
    .nullable()
    .transform((v) => v || undefined),
  employeeId: yup.string().when(['flow', 'paidToKind'], {
    is: (flow: FinanceFlowEnum, paidToKind: FinancePaidToKind) =>
      flow === FinanceFlowEnum.OUT && paidToKind === 'employee',
    then: (schema) => schema.required('Funcionário é obrigatório'),
    otherwise: (schema) =>
      schema.nullable().transform((v) => v || undefined),
  }),
  paidToKind: yup.string().when('flow', {
    is: FinanceFlowEnum.OUT,
    then: (schema) =>
      schema
        .oneOf(['employee', 'payee'], 'Selecione funcionário ou favorecido')
        .required('Pago a é obrigatório'),
    otherwise: (schema) => schema.nullable(),
  }),
  recurrence: yup.string().optional().nullable(),
});

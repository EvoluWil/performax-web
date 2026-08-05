import { endOfMonth, startOfMonth } from 'date-fns';
import * as yup from 'yup';
import { FinanceFlowEnum, FinanceStatusEnum } from '../types/finance';

export type FinanceFilterDto = {
  flow?: FinanceFlowEnum;
  flows?: FinanceFlowEnum[];
  status?: FinanceStatusEnum;
  typeIds?: string[];
  bankIds?: string[];
  categoryIds?: string[];
  segmentIds?: string[];
  payeeIds?: string[];
  dateFrom: string;
  dateTo: string;
};

export const makeFinanceFilterInitialValues = (): FinanceFilterDto => ({
  flow: undefined,
  flows: undefined,
  status: undefined,
  typeIds: [],
  bankIds: [],
  categoryIds: [],
  segmentIds: [],
  payeeIds: [],
  dateFrom: startOfMonth(new Date()).toISOString(),
  dateTo: endOfMonth(new Date()).toISOString(),
});

export const financeFilterInitialValues = makeFinanceFilterInitialValues();

export const financeFilterSchema = yup.object().shape({
  flow: yup
    .mixed<FinanceFlowEnum>()
    .oneOf([...Object.values(FinanceFlowEnum), undefined])
    .nullable(),
  status: yup
    .mixed<FinanceStatusEnum>()
    .oneOf([...Object.values(FinanceStatusEnum), undefined])
    .nullable(),
  typeIds: yup.array().of(yup.string()).optional(),
  bankIds: yup.array().of(yup.string()).optional(),
  categoryIds: yup.array().of(yup.string()).optional(),
  segmentIds: yup.array().of(yup.string()).optional(),
  payeeIds: yup.array().of(yup.string()).optional(),
  dateFrom: yup.string().required('Data inicial é obrigatória'),
  dateTo: yup.string().required('Data final é obrigatória'),
});

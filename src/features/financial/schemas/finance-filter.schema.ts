import { endOfMonth, startOfMonth } from 'date-fns';
import * as yup from 'yup';
import { FinanceFlowEnum, FinanceStatusEnum } from '../types/finance';

export type FinanceFilterDto = {
  flow?: FinanceFlowEnum;
  flows?: FinanceFlowEnum[];
  status?: FinanceStatusEnum;
  typeId?: string;
  bankId?: string;
  categoryId?: string;
  segmentId?: string;
  payeeId?: string;
  dateFrom: string;
  dateTo: string;
};

export const makeFinanceFilterInitialValues = (): FinanceFilterDto => ({
  flow: undefined,
  flows: undefined,
  status: undefined,
  typeId: '',
  bankId: '',
  categoryId: '',
  segmentId: '',
  payeeId: '',
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
  typeId: yup.string().nullable(),
  bankId: yup.string().nullable(),
  categoryId: yup.string().nullable(),
  segmentId: yup.string().nullable(),
  payeeId: yup.string().nullable(),
  dateFrom: yup.string().required('Data inicial é obrigatória'),
  dateTo: yup.string().required('Data final é obrigatória'),
});

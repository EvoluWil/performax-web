import * as yup from 'yup';

const toIsoDate = (value: unknown) => {
  if (!value) return undefined;
  if (value instanceof Date) return value.toISOString();
  const parsed = new Date(String(value));
  return Number.isNaN(parsed.getTime()) ? undefined : parsed.toISOString();
};

export type ContractFormDto = {
  clientId: string;
  typeId: string;
  value: number;
  startDate?: string;
  endDate?: string;
  dueDate?: string;
  scope?: string;
};

export const contractFormInitialValues: ContractFormDto = {
  clientId: '',
  typeId: '',
  value: 0,
  startDate: '',
  endDate: '',
  dueDate: '',
  scope: '',
};

export const contractFormSchema = yup.object().shape({
  clientId: yup.string().required('Cliente é obrigatório'),
  typeId: yup.string().required('Tipo de contrato é obrigatório'),
  value: yup.number().min(0, 'Valor inválido').default(0),
  startDate: yup.string().nullable(),
  endDate: yup.string().nullable(),
  dueDate: yup.string().nullable(),
  scope: yup.string().nullable(),
});

export const contractFormToPayload = (data: ContractFormDto) => ({
  clientId: data.clientId,
  typeId: data.typeId,
  value: Math.round(Number(data.value || 0) * 100),
  startDate: toIsoDate(data.startDate),
  endDate: toIsoDate(data.endDate),
  dueDate: toIsoDate(data.dueDate),
  scope: data.scope || undefined,
});

export type ContractFilterDto = {
  clientId?: string;
  typeId?: string;
};

export const contractFilterInitialValues: ContractFilterDto = {
  clientId: '',
  typeId: '',
};

export const contractFilterSchema = yup.object().shape({
  clientId: yup.string().optional(),
  typeId: yup.string().optional(),
});

export type ContractRecurringFormDto = {
  typeId: string;
  bankId: string;
  methodId: string;
  categoryId: string;
  segmentId: string;
};

export const contractRecurringFormInitialValues: ContractRecurringFormDto = {
  typeId: '',
  bankId: '',
  methodId: '',
  categoryId: '',
  segmentId: '',
};

export const contractRecurringFormSchema = yup.object().shape({
  typeId: yup.string().required('Tipo financeiro é obrigatório'),
  bankId: yup.string().required('Banco é obrigatório'),
  methodId: yup.string().required('Método de pagamento é obrigatório'),
  categoryId: yup.string().required('Categoria é obrigatória'),
  segmentId: yup.string().optional(),
});

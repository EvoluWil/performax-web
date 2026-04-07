import * as yup from 'yup';

export type RecurrenceFreq =
  | 'HOURLY'
  | 'DAILY'
  | 'WEEKLY'
  | 'MONTHLY'
  | 'YEARLY';

export type RecurrenceForm = {
  freq: RecurrenceFreq;
  interval: number;
  count?: number;
  until?: string; // ISO string (datetime-local)
  byweekday?: string[]; // ["MO","TU",...]
  bymonthday?: number; // 1..31
  bysetpos?: number; // 1..4 or -1
  bymonth?: number; // 1..12
};

export const recurrenceInitialValues: RecurrenceForm = {
  freq: 'WEEKLY',
  interval: 1,
  byweekday: ['ALL'],
};

export const recurrenceSchema = yup.object({
  freq: yup
    .mixed<RecurrenceFreq>()
    .oneOf(['HOURLY', 'DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY']) as any,
  interval: yup
    .number()
    .typeError('Intervalo inválido')
    .integer('Intervalo deve ser inteiro')
    .min(1, 'Intervalo mínimo é 1')
    .required('Intervalo é obrigatório'),
  count: yup
    .number()
    .typeError('Qtd. de ocorrências inválida')
    .integer('Qtd. deve ser inteiro')
    .min(1, 'Qtd. mínima é 1')
    .optional()
    .nullable() as any,
  until: yup.string().optional().nullable() as any,
  byweekday: yup
    .array()
    .of(
      yup.string().oneOf(['ALL', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA', 'SU']),
    ) as any,
  bymonthday: yup
    .number()
    .typeError('Dia do mês inválido')
    .integer('Dia do mês deve ser inteiro')
    .min(1, 'Mínimo 1')
    .max(31, 'Máximo 31')
    .optional()
    .nullable() as any,
  bysetpos: yup
    .number()
    .typeError('Posição inválida')
    .integer('Posição deve ser inteira')
    .min(-1, 'Mínimo -1')
    .max(4, 'Máximo 4')
    .optional()
    .nullable() as any,
  bymonth: yup
    .number()
    .typeError('Mês inválido')
    .integer('Mês deve ser inteiro')
    .min(1, 'Mínimo 1')
    .max(12, 'Máximo 12')
    .optional()
    .nullable() as any,
}) as yup.ObjectSchema<any>;

export const RECURRENCE_FREQ_OPTIONS = [
  { value: 'HOURLY', label: 'Hora' },
  { value: 'DAILY', label: 'Diária' },
  { value: 'WEEKLY', label: 'Semanal' },
  { value: 'MONTHLY', label: 'Mensal' },
  { value: 'YEARLY', label: 'Anual' },
];

export const RECURRENCE_WEEKDAYS = [
  { value: 'ALL', label: 'Todos' },
  { value: 'MO', label: 'Seg' },
  { value: 'TU', label: 'Ter' },
  { value: 'WE', label: 'Qua' },
  { value: 'TH', label: 'Qui' },
  { value: 'FR', label: 'Sex' },
  { value: 'SA', label: 'Sáb' },
  { value: 'SU', label: 'Dom' },
];

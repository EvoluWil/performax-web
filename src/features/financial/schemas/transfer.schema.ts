import * as yup from 'yup';

export type TransferFormDto = {
  title: string;
  description?: string;
  value: number | string;
  tax?: number | string;
  retention?: number | string;
  date: string;
  companyInId: string;
  bankId?: string;
  categoryId?: string;
  methodId?: string;
};

export const transferFormInitialValues: TransferFormDto = {
  title: '',
  description: '',
  value: '' as any,
  tax: '' as any,
  retention: '' as any,
  date: '',
  companyInId: '',
  bankId: '',
  categoryId: '',
  methodId: '',
};

export const transferFormSchema = yup.object().shape({
  title: yup.string().required('Título é obrigatório'),
  description: yup.string().nullable(),
  value: yup
    .mixed<number | string>()
    .test(
      'is-number',
      'Valor inválido',
      (v) => v !== undefined && v !== null && v !== '' && !isNaN(Number(v)),
    )
    .required('Valor é obrigatório'),
  tax: yup
    .mixed<number | string>()
    .test(
      'is-number',
      'Taxa inválida',
      (v) => v === undefined || v === null || v === '' || !isNaN(Number(v)),
    )
    .nullable(),
  retention: yup
    .mixed<number | string>()
    .test(
      'is-number',
      'Retenção inválida',
      (v) => v === undefined || v === null || v === '' || !isNaN(Number(v)),
    )
    .nullable(),
  date: yup.string().required('Data é obrigatória'),
  companyInId: yup.string().required('Empresa de destino é obrigatória'),
  bankId: yup.string().nullable(),
  categoryId: yup.string().nullable(),
  methodId: yup.string().nullable(),
});

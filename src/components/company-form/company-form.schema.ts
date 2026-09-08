import { isValidCNPJ } from '@/utils/cnpj';
import * as yup from 'yup';

export const companyActivitySchema = yup.object({
  code: yup.string().trim().required('Informe o CNAE'),
  isMain: yup.mixed<boolean | string>().required(),
});

export const companyFormFieldsSchema = {
  legalName: yup.string().trim().required('Informe a razão social'),
  tradeName: yup.string().optional(),
  federalTaxNumber: yup
    .string()
    .required('Informe o CNPJ')
    .test('valid-cnpj', 'CNPJ inválido', (value) => isValidCNPJ(value ?? '')),
  stateTaxNumber: yup.string().optional(),
  cityTaxNumber: yup.string().optional(),
  email: yup.string().trim().required('Informe o e-mail').email('E-mail inválido'),
  phone: yup
    .string()
    .required('Informe o telefone')
    .test(
      'phone',
      'Telefone inválido',
      (value) => (value ?? '').replace(/\D/g, '').length >= 10,
    ),
  economicActivities: yup
    .array()
    .of(companyActivitySchema)
    .min(1, 'Informe ao menos um CNAE')
    .required(),
};

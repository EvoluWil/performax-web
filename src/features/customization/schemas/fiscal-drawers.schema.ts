import { addressFieldsSchema } from '@/components/address-form/address-form.schema';
import { companyFormFieldsSchema } from '@/components/company-form/company-form.schema';
import * as yup from 'yup';

export const companyCadastroSchema = yup.object({
  ...companyFormFieldsSchema,
  taxRegime: yup.string().required('Informe o regime tributário'),
  address: addressFieldsSchema,
});

export type NfseFormDto = {
  federalServiceCode: string;
  nationalTaxationCode: string;
  cityServiceCode: string;
  nbsCode: string;
  cnaeCode: string;
  taxationType: string;
  issRate: number;
  issWithheld: 'true' | 'false';
  rpsSeries: string;
  rpsNumber: number;
};

export const nfseFormSchema = yup.object({
  federalServiceCode: yup
    .string()
    .trim()
    .required('Informe o código federal do serviço'),
  nationalTaxationCode: yup.string().optional(),
  cityServiceCode: yup.string().optional(),
  nbsCode: yup.string().optional(),
  cnaeCode: yup.string().optional(),
  taxationType: yup.string().required('Informe o tipo de tributação'),
  issRate: yup
    .number()
    .transform((value, original) =>
      original === '' || original === null || original === undefined
        ? undefined
        : Number(original),
    )
    .typeError('Informe a alíquota ISS')
    .min(0, 'Alíquota inválida')
    .max(1, 'Use um valor entre 0 e 1')
    .required('Informe a alíquota ISS'),
  issWithheld: yup.string().oneOf(['true', 'false']).required(),
  rpsSeries: yup.string().trim().required('Informe a série RPS'),
  rpsNumber: yup
    .number()
    .transform((value, original) =>
      original === '' || original === null || original === undefined
        ? undefined
        : Number(original),
    )
    .typeError('Informe o número RPS')
    .min(1, 'Informe o número RPS')
    .required('Informe o número RPS'),
});

export const certificateFormSchema = yup.object({
  certificateFileName: yup
    .string()
    .required('Selecione o certificado')
    .test(
      'ext',
      'Use um arquivo .pfx ou .p12',
      (value) => !value || /\.(pfx|p12)$/i.test(value),
    ),
  certificatePassword: yup.string().required('Informe a senha do certificado'),
});

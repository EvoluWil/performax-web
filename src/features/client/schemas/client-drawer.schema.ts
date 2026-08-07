import { isValidCNPJ } from '@/utils/cnpj';
import { isValidCPF } from '@/utils/cpf';
import * as yup from 'yup';
import { FiscalAddress, PersonType } from '../types/client';

const fiscalAddressSchema: yup.ObjectSchema<FiscalAddress> = yup.object({
  street: yup.string().optional(),
  number: yup.string().optional(),
  complement: yup.string().optional(),
  neighborhood: yup.string().optional(),
  city: yup.string().optional(),
  state: yup.string().optional(),
  postalCode: yup.string().optional(),
  cityCode: yup.string().optional(),
});

export type ClientFormDto = {
  name: string;
  personType?: PersonType;
  cpf?: string;
  cnpj?: string;
  email?: string;
  phone?: string;
  address?: string;
  fiscalAddress?: FiscalAddress;
};

export const clientFormInitialValues: ClientFormDto = {
  name: '',
  personType: 'PJ',
  cpf: '',
  cnpj: '',
  email: '',
  phone: '',
  address: '',
  fiscalAddress: {
    street: '',
    number: '',
    complement: '',
    neighborhood: '',
    city: '',
    state: '',
    postalCode: '',
    cityCode: '',
  },
};

export const clientFormSchema = yup.object().shape({
  name: yup.string().required('Nome é obrigatório'),
  personType: yup.mixed<PersonType>().oneOf(['PF', 'PJ']).optional(),
  cpf: yup
    .string()
    .optional()
    .when('personType', {
      is: 'PF',
      then: (schema) =>
        schema.test('isValidCpf', 'CPF inválido', (cpf) => {
          if (!cpf?.trim()) return true;
          return isValidCPF(cpf);
        }),
    })
    .transform((value) => value?.replace(/\D/g, '') || undefined),
  cnpj: yup
    .string()
    .optional()
    .when('personType', {
      is: 'PJ',
      then: (schema) =>
        schema.test('isValidCnpj', 'CNPJ inválido', (cnpj) => {
          if (!cnpj?.trim()) return true;
          return isValidCNPJ(cnpj);
        }),
    })
    .transform((value) => value?.replace(/\D/g, '') || undefined),
  email: yup.string().email('E-mail inválido').optional(),
  phone: yup.string().optional(),
  address: yup.string().optional(),
  fiscalAddress: fiscalAddressSchema.optional(),
});

import { isValidCNPJ } from '@/utils/cnpj';
import * as yup from 'yup';

export type ClientFormDto = {
  name: string;
  cnpj: string;
  address?: string;
};

export const clientFormInitialValues: ClientFormDto = {
  name: '',
  cnpj: '',
  address: '',
};

export const clientFormSchema = yup.object().shape({
  name: yup.string().required('Nome é obrigatório'),
  cnpj: yup
    .string()
    .required('CNPJ é obrigatório')
    .test('isValidCnpj', 'CNPJ inválido', function (cnpj) {
      const { path, createError } = this;
      if (!cnpj) return true;
      return (
        isValidCNPJ(cnpj) || createError({ path, message: 'CNPJ inválido' })
      );
    })
    .transform((value) => value?.replace(/\D/g, '')),
});

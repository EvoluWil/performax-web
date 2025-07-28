import { isValidCPF } from '@/utils/cpf';
import * as yup from 'yup';

export type UserFormDto = {
  cpf: string;
  name: string;
  email: string;
};

export const userFormInitialValues: UserFormDto = {
  name: '',
  cpf: '',
  email: '',
};

export const userFormSchema = yup.object().shape({
  cpf: yup
    .string()
    .required('CPF obrigatório')
    .test('cpf', 'CPF inválido', function (value) {
      const { path, createError } = this;
      return (
        isValidCPF(value) || createError({ path, message: 'CPF inválido' })
      );
    })
    .transform((value) => value.replace(/\D/g, '')),
  name: yup
    .string()
    .required('Nome obrigatório')
    .test('name', 'Nome inválido', function (value) {
      const { path, createError } = this;
      return (
        value?.trim().split(' ').length >= 2 ||
        createError({ path, message: 'Nome inválido' })
      );
    }),
  email: yup.string().required('E-mail obrigatório').email('E-mail inválido'),
});

import { isValidCPF } from '@/utils/cpf';
import * as yup from 'yup';

export type EmployeeFormDto = {
  name: string;
  cpf: string;
  clientId?: string;
};

export const employeeFormInitialValues: EmployeeFormDto = {
  name: '',
  cpf: '',
  clientId: '',
};

export const employeeFormSchema = yup.object().shape({
  name: yup.string().required('Nome é obrigatório'),
  cpf: yup
    .string()
    .required('CPF é obrigatório')
    .test('isValidCpf', 'CPF inválido', function (cpf) {
      const { path, createError } = this;
      if (!cpf) return true;
      return isValidCPF(cpf) || createError({ path, message: 'CPF inválido' });
    })
    .transform((value) => value?.replace(/\D/g, '')),
});

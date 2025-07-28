import { isValidCPF } from '@/utils/cpf';
import * as yup from 'yup';

export type SignUpFormDto = {
  profile: {
    name: string;
    cpf: string;
    email: string;
  };
  credentials: {
    password: string;
    passwordConfirmation: string;
  };
  company: {
    name: string;
  };
};

export const signUpFormInitialValues: SignUpFormDto = {
  profile: {
    name: '',
    cpf: '',
    email: '',
  },
  credentials: {
    password: '',
    passwordConfirmation: '',
  },
  company: {
    name: '',
  },
};

export const signUpFormSchema = yup.object().shape({
  profile: yup.object().shape({
    name: yup
      .string()
      .required('Nome completo obrigatório')
      .test('name', 'Nome inválido', function (value) {
        const { path, createError } = this;
        return (
          value?.split(' ')?.length >= 2 ||
          createError({ path, message: 'Precisa ter nome e sobrenome' })
        );
      }),
    cpf: yup
      .string()
      .transform((value) => value.replace(/\D/g, ''))
      .test('cpf', 'CPF inválido', (value) =>
        !value ? false : isValidCPF(value),
      )
      .required('CPF obrigatório'),
    email: yup.string().email('E-mail inválido').required('E-mail obrigatório'),
  }),
  credentials: yup.object().shape({
    password: yup
      .string()
      .required('Senha é obrigatória')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*#?&])(?=.{8,})/, ''),
    passwordConfirmation: yup
      .string()
      .required('Confirmação de senha é obrigatória')
      .oneOf([yup.ref('password')], 'Senhas devem ser iguais'),
  }),
  company: yup.object().shape({
    name: yup.string().required('Nome fantasia da empresa é obrigatório'),
  }),
});

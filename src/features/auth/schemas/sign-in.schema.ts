import * as yup from 'yup';

export type SignFormDto = {
  email: string;
  password: string;
};

export const signInFormInitialValues: SignFormDto = {
  email: '',
  password: '',
};

export const signInFormSchema = yup.object().shape({
  email: yup.string().required('E-mail é obrigatório').email('E-mail invalido'),
  password: yup.string().required('Senha é obrigatória'),
});

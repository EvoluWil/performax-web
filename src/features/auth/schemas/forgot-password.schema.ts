import * as yup from 'yup';

export type ForgotPasswordFormDto = {
  email: string;
};

export const forgotPasswordFormInitialValues: ForgotPasswordFormDto = {
  email: '',
};

export const forgotPasswordFormSchema = yup.object().shape({
  email: yup.string().required('E-mail é obrigatório').email('E-mail inválido'),
});

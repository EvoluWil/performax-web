import * as yup from 'yup';

export type ResetPasswordFormDto = {
  password: string;
  passwordConfirmation: string;
};

export const resetPasswordFormInitialValues: ResetPasswordFormDto = {
  password: '',
  passwordConfirmation: '',
};

export const resetPasswordFormSchema = yup.object().shape({
  password: yup
    .string()
    .required('')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*#?&])(?=.{8,})/, ''),
  passwordConfirmation: yup
    .string()
    .required('Confirmação de senha é obrigatória')
    .oneOf([yup.ref('password')], 'Senhas devem ser iguais'),
});

import * as yup from 'yup';

export type UpdatePasswordFormDto = {
  currentPassword: string;
  password: string;
  passwordConfirmation: string;
};

export const updatePasswordFormInitialValues: UpdatePasswordFormDto = {
  currentPassword: '',
  password: '',
  passwordConfirmation: '',
};

export const updatePasswordFormSchema = yup.object().shape({
  currentPassword: yup.string().required('Senha atual é obrigatória'),
  password: yup
    .string()
    .required('Senha é obrigatória')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*#?&])(?=.{8,})/, ''),
  passwordConfirmation: yup
    .string()
    .required('Confirmação de senha é obrigatória')
    .oneOf([yup.ref('password')], 'Senhas devem ser iguais'),
});

import * as yup from 'yup';

export type CodeValidationFormDto = {
  code: string;
};

export const codeValidationFormInitialValues: CodeValidationFormDto = {
  code: '',
};

export const codeValidationFormSchema = yup.object().shape({
  code: yup
    .string()
    .required('Código é obrigatório')
    .length(6, 'O código deve ter 6 dígitos'),
});

import * as yup from 'yup';

export const addressFieldsSchema = yup.object({
  postalCode: yup
    .string()
    .required('Informe o CEP')
    .test('cep', 'CEP inválido', (value) => (value ?? '').replace(/\D/g, '').length === 8),
  street: yup.string().trim().required('Informe o logradouro'),
  number: yup.string().trim().required('Informe o número'),
  complement: yup.string().optional(),
  neighborhood: yup.string().trim().required('Informe o bairro'),
  city: yup.string().trim().required('Informe a cidade'),
  state: yup
    .string()
    .trim()
    .required('Informe a UF')
    .length(2, 'Informe a UF com 2 letras'),
  cityCode: yup.string().trim().required('Informe o código IBGE'),
});

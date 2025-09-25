import * as yup from 'yup';

export const ChecklistItemSchema = yup.object().shape({
  question: yup.string().required('Pergunta é obrigatória'),
  expectedType: yup
    .string()
    .oneOf(['BOOLEAN', 'NUMBER', 'TEXT'])
    .required('Tipo esperado é obrigatório'),
});

export const ChecklistModuleSchema = yup.object().shape({
  name: yup.string().required('Nome do módulo é obrigatório'),
  items: yup
    .array()
    .of(ChecklistItemSchema)
    .min(1, 'O módulo deve ter pelo menos um item')
    .required('Items são obrigatórios'),
});

export const ChecklistDtoSchema = yup.object().shape({
  modules: yup
    .array()
    .of(ChecklistModuleSchema)
    .min(1, 'Adicione pelo menos um módulo'),
});

export type ChecklistSchemaType = yup.InferType<typeof ChecklistDtoSchema>;

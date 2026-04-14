import * as yup from 'yup';

export type BudgetItemForm = {
  label: string;
  value?: number | string;
  quantity?: number;
  type?: 'PRODUCT' | 'SERVICE';
};

export type BudgetFormDto = {
  title: string;
  description?: string;
  observation?: string;
  value?: number | string; // será calculado via items
  typeId: string | null;
  clientId?: string | null;
  responsibleId?: string | null;
  items?: BudgetItemForm[];
};

export const budgetFormInitialValues: BudgetFormDto = {
  title: '',
  description: '',
  observation: '',
  value: '',
  typeId: null,
  clientId: null,
  responsibleId: null,
  items: [],
};

export const budgetFormSchema = yup.object().shape({
  title: yup.string().required('Título é obrigatório'),
  description: yup.string().nullable(),
  observation: yup.string().nullable(),
  // value é calculado automaticamente a partir dos itens
  value: yup.mixed<number | string>().nullable(),
  typeId: yup.string().required('Tipo é obrigatório'),
  clientId: yup.string().nullable(),
  responsibleId: yup.string().nullable(),
  items: yup
    .array()
    .of(
      yup.object().shape({
        label: yup.string().required('Descrição do item é obrigatória'),
        type: yup
          .mixed<'PRODUCT' | 'SERVICE'>()
          .oneOf(['PRODUCT', 'SERVICE']) // obrigatório
          .required('Tipo é obrigatório'),
        quantity: yup
          .number()
          .transform((current, originalValue) => {
            if (
              originalValue === undefined ||
              originalValue === null ||
              originalValue === ''
            ) {
              return undefined;
            }

            const parsed = Number(originalValue);
            return Number.isNaN(parsed) ? NaN : parsed;
          })
          .typeError('Quantidade inválida')
          .nullable(),
        value: yup
          .mixed<number | string>()
          .test(
            'is-number',
            'Valor inválido',
            (v) =>
              v === undefined || v === null || v === '' || !isNaN(Number(v)),
          )
          .nullable(),
      }),
    )
    .nullable(),
});

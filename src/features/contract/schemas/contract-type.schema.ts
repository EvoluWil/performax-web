import * as yup from 'yup';

export type ContractTypeFormDto = {
  name: string;
};

export const contractTypeFormInitialValues: ContractTypeFormDto = {
  name: '',
};

export const contractTypeFormSchema = yup.object().shape({
  name: yup.string().required('Nome é obrigatório'),
});

export type ApplyAdjustmentFormDto = {
  percentage: number;
};

export const applyAdjustmentSchema = yup.object().shape({
  percentage: yup
    .number()
    .required('Percentual é obrigatório')
    .min(-100, 'Mínimo -100%')
    .max(1000, 'Máximo 1000%'),
});

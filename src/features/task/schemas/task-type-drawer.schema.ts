import * as yup from 'yup';

export type TaskTypeFormDto = {
  name: string;
  needApprove: boolean;
};

export const taskTypeFormInitialValues: TaskTypeFormDto = {
  name: '',
  needApprove: false,
};

export const taskTypeFormSchema = yup.object().shape({
  name: yup.string().required('Nome é obrigatório'),
  needApprove: yup.boolean().required('Aprovação é obrigatória').default(false),
});

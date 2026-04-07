import * as yup from 'yup';

export type CompanyGroupFormDto = {
  name: string;
  description?: string;
};

export const companyGroupFormInitialValues: CompanyGroupFormDto = {
  name: '',
  description: '',
};

export const companyGroupFormSchema = yup.object().shape({
  name: yup.string().required('Nome é obrigatório'),
  description: yup.string().nullable(),
});

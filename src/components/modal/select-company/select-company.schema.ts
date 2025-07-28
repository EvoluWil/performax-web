import * as yup from 'yup';

export type SelectCompanyFormDto = {
  companyId: string;
};

export const selectCompanyFormInitialValues: SelectCompanyFormDto = {
  companyId: '',
};

export const selectCompanyFormSchema = yup.object().shape({
  companyId: yup.string(),
});

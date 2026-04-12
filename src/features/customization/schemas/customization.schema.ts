import * as yup from 'yup';

export type CustomizationFormDto = {
  // Company settings
  companyName: string;
  // White label
  wlName: string;
  logo: string;
  banner: string;
  favicon: string;
  primaryColor: string;
  secondaryColor: string;
};

export const customizationFormInitialValues: CustomizationFormDto = {
  companyName: '',
  wlName: '',
  logo: '',
  banner: '',
  favicon: '',
  primaryColor: '#1976d2',
  secondaryColor: '#9c27b0',
};

export const customizationFormSchema = yup.object().shape({
  companyName: yup.string().required('Nome da empresa é obrigatório'),
  wlName: yup.string().nullable(),
  logo: yup.string().nullable(),
  banner: yup.string().nullable(),
  favicon: yup.string().nullable(),
  primaryColor: yup.string().nullable(),
  secondaryColor: yup.string().nullable(),
});

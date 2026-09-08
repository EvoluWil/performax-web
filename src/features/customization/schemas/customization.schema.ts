import { DEFAULT_WHITE_LABEL } from '@/utils/white-label.utils';
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
  primaryColor: DEFAULT_WHITE_LABEL.primaryColor,
  secondaryColor: DEFAULT_WHITE_LABEL.secondaryColor,
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

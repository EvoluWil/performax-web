import { isValidCNPJ } from '@/utils/cnpj';
import * as yup from 'yup';
import {
  EconomicActivity,
  FiscalAddress,
  TaxRegime,
} from '../types/fiscal-config';

const fiscalAddressSchema: yup.ObjectSchema<FiscalAddress> = yup.object({
  street: yup.string().optional(),
  number: yup.string().optional(),
  complement: yup.string().optional(),
  neighborhood: yup.string().optional(),
  city: yup.string().optional(),
  state: yup.string().optional(),
  postalCode: yup.string().optional(),
  cityCode: yup.string().optional(),
});

const economicActivitySchema = yup.object({
  code: yup.string().required(),
  isMain: yup.mixed<boolean | string>().required(),
});

export type FiscalConfigFormDto = {
  legalName?: string;
  tradeName?: string;
  federalTaxNumber?: string;
  stateTaxNumber?: string;
  cityTaxNumber?: string;
  email?: string;
  phone?: string;
  address: FiscalAddress;
  taxRegime?: TaxRegime;
  economicActivities: EconomicActivity[];
  federalServiceCode?: string;
  nationalTaxationCode?: string;
  cityServiceCode?: string;
  nbsCode?: string;
  cnaeCode?: string;
  taxationType?: string;
  taxLocation?: string;
  issRate?: number;
  issWithheld?: boolean | string;
  rpsSeries?: string;
  rpsNumber?: number;
  certificateFileName?: string;
  certificatePassword?: string;
};

export const fiscalConfigFormInitialValues: FiscalConfigFormDto = {
  legalName: '',
  tradeName: '',
  federalTaxNumber: '',
  stateTaxNumber: '',
  cityTaxNumber: '',
  email: '',
  phone: '',
  address: {
    street: '',
    number: '',
    complement: '',
    neighborhood: '',
    city: '',
    state: '',
    postalCode: '',
    cityCode: '',
  },
  taxRegime: undefined,
  economicActivities: [{ code: '', isMain: 'true' }],
  federalServiceCode: '',
  nationalTaxationCode: '',
  cityServiceCode: '',
  nbsCode: '',
  cnaeCode: '',
  taxationType: 'immune',
  taxLocation: 'companyMunicipality',
  issRate: 0,
  issWithheld: 'false',
  rpsSeries: '',
  rpsNumber: undefined,
  certificateFileName: '',
  certificatePassword: '',
};

export const fiscalConfigFormSchema = yup.object({
  legalName: yup.string().optional(),
  tradeName: yup.string().optional(),
  federalTaxNumber: yup
    .string()
    .optional()
    .test('valid-cnpj', 'CNPJ inválido', (value) => {
      if (!value?.trim()) return true;
      return isValidCNPJ(value);
    }),
  stateTaxNumber: yup.string().optional(),
  cityTaxNumber: yup.string().optional(),
  email: yup.string().email('E-mail inválido').optional(),
  phone: yup.string().optional(),
  address: fiscalAddressSchema,
  taxRegime: yup
    .mixed<TaxRegime>()
    .oneOf([
      'SIMPLES_NACIONAL',
      'SIMPLES_NACIONAL_EXCESSO',
      'SIMPLES_NACIONAL_MEI',
      'REGIME_NORMAL',
    ])
    .optional(),
  economicActivities: yup.array().of(economicActivitySchema).default([]),
  federalServiceCode: yup.string().optional(),
  nationalTaxationCode: yup.string().optional(),
  cityServiceCode: yup.string().optional(),
  nbsCode: yup.string().optional(),
  cnaeCode: yup.string().optional(),
  taxationType: yup.string().optional(),
  taxLocation: yup.string().optional(),
  issRate: yup.number().min(0).max(1).optional(),
  issWithheld: yup.boolean().optional(),
  rpsSeries: yup.string().optional(),
  rpsNumber: yup.number().min(1).optional(),
  certificateFileName: yup.string().optional(),
  certificatePassword: yup.string().optional(),
});

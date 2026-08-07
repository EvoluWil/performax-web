export type FiscalAddress = {
  street?: string;
  number?: string;
  complement?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  cityCode?: string;
};

export type EconomicActivity = {
  code: string;
  isMain: boolean | string;
};

export type TaxRegime =
  | 'SIMPLES_NACIONAL'
  | 'SIMPLES_NACIONAL_EXCESSO'
  | 'SIMPLES_NACIONAL_MEI'
  | 'REGIME_NORMAL';

export type FiscalConfig = {
  id: string;
  legalName: string | null;
  tradeName: string | null;
  federalTaxNumber: string | null;
  stateTaxNumber: string | null;
  cityTaxNumber: string | null;
  email: string | null;
  phone: string | null;
  address: FiscalAddress | null;
  taxRegime: TaxRegime | null;
  economicActivities: EconomicActivity[];
  spedyCompanyId: string | null;
  hasSpedyApiKey: boolean;
  certificateFileName: string | null;
  hasCertificate: boolean;
  hasCertificatePassword: boolean;
  certificateExpiresAt: string | null;
  federalServiceCode: string | null;
  nationalTaxationCode: string | null;
  cityServiceCode: string | null;
  nbsCode: string | null;
  cnaeCode: string | null;
  taxationType: string | null;
  taxLocation: string | null;
  issRate: number | null;
  issWithheld: boolean | null;
  rpsSeries: string | null;
  rpsNumber: number | null;
  companyId: string;
};

export type FiscalStatus = {
  ready: boolean;
  missingFields: string[];
};

export type UpsertFiscalConfigDto = {
  legalName?: string;
  tradeName?: string;
  federalTaxNumber?: string;
  stateTaxNumber?: string;
  cityTaxNumber?: string;
  email?: string;
  phone?: string;
  address?: FiscalAddress;
  taxRegime?: TaxRegime;
  economicActivities?: EconomicActivity[];
  certificateFileName?: string;
  certificateFileBase64?: string;
  certificatePassword?: string;
  federalServiceCode?: string;
  nationalTaxationCode?: string;
  cityServiceCode?: string;
  nbsCode?: string;
  cnaeCode?: string;
  taxationType?: string;
  taxLocation?: string;
  issRate?: number;
  issWithheld?: boolean;
  rpsSeries?: string;
  rpsNumber?: number;
};

export const TAX_REGIME_OPTIONS = [
  { label: 'Simples Nacional', value: 'SIMPLES_NACIONAL' },
  {
    label: 'Simples Nacional — excesso de sublimite',
    value: 'SIMPLES_NACIONAL_EXCESSO',
  },
  { label: 'MEI', value: 'SIMPLES_NACIONAL_MEI' },
  { label: 'Regime Normal', value: 'REGIME_NORMAL' },
] as const;

export const TAXATION_TYPE_OPTIONS = [
  { label: 'Isento', value: 'immune' },
  { label: 'Isenção', value: 'exemption' },
  { label: 'Tributação no município', value: 'taxationInMunicipality' },
  {
    label: 'Tributação fora do município',
    value: 'taxationOutsideMunicipality',
  },
  { label: 'Exportação', value: 'exportation' },
  { label: 'Não incidência', value: 'nonIncidence' },
] as const;

export const TAX_LOCATION_OPTIONS = [
  { label: 'Município do prestador', value: 'companyMunicipality' },
  { label: 'Município do serviço', value: 'serviceMunicipality' },
  { label: 'Município do tomador', value: 'receiverMunicipality' },
] as const;

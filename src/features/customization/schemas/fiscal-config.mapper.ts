import { FiscalConfig, UpsertFiscalConfigDto } from '../types/fiscal-config';
import {
  FiscalConfigFormDto,
  fiscalConfigFormInitialValues,
} from './fiscal-config.schema';

export function fiscalConfigToFormValues(
  config: FiscalConfig | null | undefined,
): FiscalConfigFormDto {
  if (!config) return { ...fiscalConfigFormInitialValues };

  return {
    legalName: config.legalName ?? '',
    tradeName: config.tradeName ?? '',
    federalTaxNumber: config.federalTaxNumber ?? '',
    stateTaxNumber: config.stateTaxNumber ?? '',
    cityTaxNumber: config.cityTaxNumber ?? '',
    email: config.email ?? '',
    phone: config.phone ?? '',
    address: {
      street: config.address?.street ?? '',
      number: config.address?.number ?? '',
      complement: config.address?.complement ?? '',
      neighborhood: config.address?.neighborhood ?? '',
      city: config.address?.city ?? '',
      state: config.address?.state ?? '',
      postalCode: config.address?.postalCode ?? '',
      cityCode: config.address?.cityCode ?? '',
    },
    taxRegime: config.taxRegime ?? undefined,
    economicActivities:
      config.economicActivities?.length > 0
        ? config.economicActivities.map((a) => ({
            code: a.code,
            isMain: a.isMain ? 'true' : 'false',
          }))
        : [{ code: '', isMain: 'true' }],
    federalServiceCode: config.federalServiceCode ?? '',
    nationalTaxationCode: config.nationalTaxationCode ?? '',
    cityServiceCode: config.cityServiceCode ?? '',
    nbsCode: config.nbsCode ?? '',
    cnaeCode: config.cnaeCode ?? '',
    taxationType: config.taxationType ?? 'immune',
    taxLocation: config.taxLocation ?? 'companyMunicipality',
    issRate: config.issRate ?? 0,
    issWithheld: config.issWithheld ? 'true' : 'false',
    rpsSeries: config.rpsSeries ?? '',
    rpsNumber: config.rpsNumber ?? undefined,
    certificateFileName: config.certificateFileName ?? '',
    certificatePassword: '',
  };
}

function parseBooleanField(value: unknown): boolean | undefined {
  if (typeof value === 'boolean') return value;
  if (value === 'true') return true;
  if (value === 'false') return false;
  return undefined;
}

export function formValuesToFiscalConfigDto(
  values: FiscalConfigFormDto,
  certificateFile: File | null,
): UpsertFiscalConfigDto {
  const dto: UpsertFiscalConfigDto = {
    legalName: values.legalName || undefined,
    tradeName: values.tradeName || undefined,
    federalTaxNumber: values.federalTaxNumber?.replace(/\D/g, '') || undefined,
    stateTaxNumber: values.stateTaxNumber || undefined,
    cityTaxNumber: values.cityTaxNumber || undefined,
    email: values.email || undefined,
    phone: values.phone?.replace(/\D/g, '') || undefined,
    address: {
      street: values.address.street || undefined,
      number: values.address.number || undefined,
      complement: values.address.complement || undefined,
      neighborhood: values.address.neighborhood || undefined,
      city: values.address.city || undefined,
      state: values.address.state || undefined,
      postalCode: values.address.postalCode?.replace(/\D/g, '') || undefined,
      cityCode: values.address.cityCode || undefined,
    },
    taxRegime: values.taxRegime || undefined,
    economicActivities: values.economicActivities
      ?.filter((a) => a.code?.trim())
      .map((a) => ({
        code: a.code.trim(),
        isMain: parseBooleanField(a.isMain) ?? false,
      })),
    federalServiceCode: values.federalServiceCode || undefined,
    nationalTaxationCode: values.nationalTaxationCode || undefined,
    cityServiceCode: values.cityServiceCode || undefined,
    nbsCode: values.nbsCode || undefined,
    cnaeCode: values.cnaeCode || undefined,
    taxationType: values.taxationType || undefined,
    taxLocation: values.taxLocation || undefined,
    issRate: values.issRate != null ? Number(values.issRate) : undefined,
    issWithheld: parseBooleanField(values.issWithheld),
    rpsSeries: values.rpsSeries || undefined,
    rpsNumber: values.rpsNumber ? Number(values.rpsNumber) : undefined,
  };

  if (values.certificatePassword?.trim()) {
    dto.certificatePassword = values.certificatePassword;
  }

  if (certificateFile) {
    dto.certificateFileName = certificateFile.name;
  }

  return dto;
}

export async function formValuesToFiscalConfigDtoAsync(
  values: FiscalConfigFormDto,
  certificateFile: File | null,
): Promise<UpsertFiscalConfigDto> {
  const dto = formValuesToFiscalConfigDto(values, certificateFile);
  if (certificateFile) {
    dto.certificateFileBase64 = await readCertificateAsBase64(certificateFile);
  }
  return dto;
}

export async function readCertificateAsBase64(
  file: File,
): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.split(',')[1] ?? result;
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

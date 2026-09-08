export type CnpjLookup = {
  legalName?: string;
  tradeName?: string;
  email?: string;
  phone?: string;
  postalCode?: string;
  street?: string;
  number?: string;
  complement?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  cityCode?: string;
  activities: { code: string; isMain: 'true' | 'false' }[];
};

type BrasilApiCnae = { codigo?: number | string };

type BrasilApiCnpj = {
  razao_social?: string;
  nome_fantasia?: string;
  email?: string | null;
  ddd_telefone_1?: string;
  cep?: string;
  logradouro?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  municipio?: string;
  uf?: string;
  codigo_municipio?: number;
  codigo_municipio_ibge?: number;
  cnae_fiscal?: number;
  cnaes_secundarios?: BrasilApiCnae[];
};

function digits(value?: string | null): string {
  return (value ?? '').replace(/\D/g, '');
}

function text(value?: string | null): string | undefined {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

export async function fetchCnpj(cnpj: string): Promise<CnpjLookup | null> {
  const federalTaxNumber = digits(cnpj);
  if (federalTaxNumber.length !== 14) return null;

  try {
    const response = await fetch(
      `https://brasilapi.com.br/api/cnpj/v1/${federalTaxNumber}`,
    );
    if (!response.ok) return null;
    const data = (await response.json()) as BrasilApiCnpj;
    const mainCode = data.cnae_fiscal ? String(data.cnae_fiscal) : '';
    const secondary = (data.cnaes_secundarios ?? [])
      .map((item) => String(item.codigo ?? '').replace(/\D/g, ''))
      .filter((code) => code && code !== mainCode);

    return {
      legalName: text(data.razao_social),
      tradeName: text(data.nome_fantasia),
      email: text(data.email),
      phone: digits(data.ddd_telefone_1) || undefined,
      postalCode: digits(data.cep) || undefined,
      street: text(data.logradouro),
      number: text(data.numero),
      complement: text(data.complemento),
      neighborhood: text(data.bairro),
      city: text(data.municipio),
      state: text(data.uf)?.toUpperCase(),
      cityCode: String(
        data.codigo_municipio_ibge ?? data.codigo_municipio ?? '',
      ).replace(/\D/g, '') || undefined,
      activities: [
        ...(mainCode ? [{ code: mainCode, isMain: 'true' as const }] : []),
        ...secondary.map((code) => ({ code, isMain: 'false' as const })),
      ],
    };
  } catch {
    return null;
  }
}

export interface ViaCepResponse {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string;
  uf: string;
  ibge: string;
  erro?: boolean;
}

export async function fetchViaCep(
  postalCode: string,
): Promise<ViaCepResponse | null> {
  const cep = postalCode.replace(/\D/g, '');
  if (cep.length !== 8) return null;

  try {
    const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
    if (!response.ok) return null;
    const data: ViaCepResponse = await response.json();
    if (data?.erro) return null;
    return data;
  } catch {
    return null;
  }
}

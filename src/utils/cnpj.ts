export const formatCnpj = (cnpj: string): string => {
  if (!cnpj) {
    return '';
  }

  const cnpjParse = cnpj.replace(/\D/g, '');
  const cnpjMask = cnpjParse.replace(
    /^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/,
    '$1.$2.$3/$4-$5',
  );

  return cnpjMask;
};

export const isValidCNPJ = (cnpj: string): boolean => {
  if (typeof cnpj !== 'string') {
    return false;
  }
  cnpj = cnpj.replace(/[^\d]+/g, '');

  if (cnpj.length !== 14) {
    return false;
  }

  // Verificar se todos os dígitos são iguais (caso inválido)
  if (/^(\d)\1+$/.test(cnpj)) {
    return false;
  }

  const digits = cnpj.split('').map(Number);

  const firstSum =
    digits[0] * 5 +
    digits[1] * 4 +
    digits[2] * 3 +
    digits[3] * 2 +
    digits[4] * 9 +
    digits[5] * 8 +
    digits[6] * 7 +
    digits[7] * 6 +
    digits[8] * 5 +
    digits[9] * 4 +
    digits[10] * 3 +
    digits[11] * 2;

  const firstDigit = firstSum % 11 < 2 ? 0 : 11 - (firstSum % 11);

  const secondSum =
    digits[0] * 6 +
    digits[1] * 5 +
    digits[2] * 4 +
    digits[3] * 3 +
    digits[4] * 2 +
    digits[5] * 9 +
    digits[6] * 8 +
    digits[7] * 7 +
    digits[8] * 6 +
    digits[9] * 5 +
    digits[10] * 4 +
    digits[11] * 3 +
    firstDigit * 2;

  const secondDigit = secondSum % 11 < 2 ? 0 : 11 - (secondSum % 11);

  return digits[12] === firstDigit && digits[13] === secondDigit;
};

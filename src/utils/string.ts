export const normalizeString = (text: string): string => {
  if (!text) {
    return '';
  }
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/gi, '')
    .toLocaleLowerCase();
};

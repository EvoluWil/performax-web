export const formatDate = (date: Date | string): string => {
  if (!date) return '';

  const parsedDate = new Date(date);
  return parsedDate.toLocaleDateString('pt-BR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
};

type FormatterSelectOptionsResponse<T> = {
  value: string;
  label: string;
  object?: T;
};

export const formatterSelectOptions = <T = any>(
  data: T[],
  value: keyof T,
  label: keyof T,
  addDefaultOption = false,
): FormatterSelectOptionsResponse<T>[] => {
  const formattedArray = data?.map((item) => {
    return { value: item[value], label: item[label], object: item };
  });

  if (addDefaultOption) {
    formattedArray?.unshift({ value: '', label: 'Selecione uma opção' } as any);
  }

  return formattedArray as FormatterSelectOptionsResponse<T>[];
};

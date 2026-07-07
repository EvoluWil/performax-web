import { useMemo, useState } from 'react';
import type { CsvImportConfig } from './csv-import.types';

export function useListCsvImport<T extends Record<string, unknown>>(
  createConfig: (onCreate: (row: T) => Promise<unknown>) => CsvImportConfig<T>,
  onCreate: (row: T) => Promise<unknown>,
  deps: unknown[] = [],
) {
  const [importOpen, setImportOpen] = useState(false);

  const config = useMemo(
    () => createConfig(onCreate),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [createConfig, onCreate, ...deps],
  );

  return {
    importOpen,
    setImportOpen,
    config,
  };
}

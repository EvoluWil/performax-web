import { useMemo, useState } from 'react';
import type { CsvImportConfig } from './csv-import.types';

export function useListCsvImport<
  TImport extends Record<string, unknown>,
  TPayload = TImport,
>(
  createConfig: (
    onCreate: (row: TPayload) => Promise<unknown>,
  ) => CsvImportConfig<TImport, TPayload>,
  onCreate: (row: TPayload) => Promise<unknown>,
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

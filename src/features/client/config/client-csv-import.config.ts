import type { CsvImportConfig } from '@/components/csv-import';
import {
  ClientFormDto,
  clientFormSchema,
} from '@/features/client/schemas/client-drawer.schema';
import * as yup from 'yup';

const clientImportSchema = clientFormSchema.shape({
  address: yup.string().optional(),
}) as yup.ObjectSchema<ClientFormDto>;

export function createClientCsvImportConfig(
  onCreate: (row: ClientFormDto) => Promise<unknown>,
): CsvImportConfig<ClientFormDto> {
  return {
    entityLabel: 'clientes',
    columns: [
      {
        key: 'name',
        header: 'Nome',
        required: true,
        example: 'Empresa Exemplo Ltda',
      },
      {
        key: 'cnpj',
        header: 'CNPJ',
        required: true,
        example: '12.345.678/0001-90',
      },
      {
        key: 'address',
        header: 'Endereço',
        example: 'Rua Exemplo, 123 - Centro',
      },
    ],
    schema: clientImportSchema,
    onCreate,
  };
}

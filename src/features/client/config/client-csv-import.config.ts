import type { CsvImportConfig } from '@/components/csv-import';
import {
  ClientFormDto,
  clientFormSchema,
} from '@/features/client/schemas/client-drawer.schema';
import * as yup from 'yup';

const clientImportSchema = clientFormSchema as yup.ObjectSchema<ClientFormDto>;

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
        key: 'personType',
        header: 'Tipo (PF/PJ)',
        example: 'PJ',
      },
      {
        key: 'cnpj',
        header: 'CNPJ',
        example: '12.345.678/0001-90',
      },
      {
        key: 'cpf',
        header: 'CPF',
        example: '123.456.789-00',
      },
      {
        key: 'email',
        header: 'E-mail',
        example: 'contato@empresa.com',
      },
      {
        key: 'address',
        header: 'Endereço (legado)',
        example: 'Rua Exemplo, 123 - Centro',
      },
    ] as CsvImportConfig<ClientFormDto>['columns'],
    schema: clientImportSchema,
    onCreate,
  };
}

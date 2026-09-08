import type { CsvImportConfig } from '@/components/csv-import';
import {
  ClientFormDto,
  clientFormSchema,
} from '@/features/client/schemas/client-drawer.schema';
import * as yup from 'yup';

type CsvClientRow = ClientFormDto & {
  street?: string;
  number?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  postalCode?: string;
};

const clientImportSchema = clientFormSchema.shape({
  street: yup.string().optional(),
  number: yup.string().optional(),
  neighborhood: yup.string().optional(),
  city: yup.string().optional(),
  state: yup.string().optional(),
  postalCode: yup.string().optional(),
}) as yup.ObjectSchema<CsvClientRow>;

export function createClientCsvImportConfig(
  onCreate: (row: ClientFormDto) => Promise<unknown>,
): CsvImportConfig<CsvClientRow> {
  return {
    entityLabel: 'clientes',
    columns: [
      { key: 'name', header: 'Nome', required: true, example: 'Empresa Exemplo Ltda' },
      { key: 'personType', header: 'Tipo (PF/PJ)', example: 'PJ' },
      { key: 'cnpj', header: 'CNPJ', example: '12.345.678/0001-90' },
      { key: 'cpf', header: 'CPF', example: '123.456.789-00' },
      { key: 'email', header: 'E-mail', example: 'contato@empresa.com' },
      { key: 'postalCode', header: 'CEP', example: '01310-100' },
      { key: 'street', header: 'Logradouro', example: 'Av. Paulista' },
      { key: 'number', header: 'Número', example: '1000' },
      { key: 'neighborhood', header: 'Bairro', example: 'Bela Vista' },
      { key: 'city', header: 'Cidade', example: 'São Paulo' },
      { key: 'state', header: 'UF', example: 'SP' },
      { key: 'address', header: 'Endereço (legado)', example: 'Rua Exemplo, 123' },
    ],
    schema: clientImportSchema,
    onCreate: async (row) => {
      const { street, number, neighborhood, city, state, postalCode, ...rest } =
        row;
      return onCreate({
        ...rest,
        personType: rest.personType ?? (rest.cpf ? 'PF' : 'PJ'),
        fiscalAddress: {
          street,
          number,
          neighborhood,
          city,
          state,
          postalCode,
        },
      });
    },
  };
}

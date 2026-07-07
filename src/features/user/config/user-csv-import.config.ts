import type { CsvImportConfig } from '@/components/csv-import';
import {
  UserFormDto,
  userFormSchema,
} from '@/features/user/schemas/user-drawer.schema';

export function createUserCsvImportConfig(
  onCreate: (row: UserFormDto) => Promise<unknown>,
): CsvImportConfig<UserFormDto> {
  return {
    entityLabel: 'usuários',
    columns: [
      {
        key: 'name',
        header: 'Nome',
        required: true,
        example: 'João Silva',
      },
      {
        key: 'cpf',
        header: 'CPF',
        required: true,
        example: '123.456.789-00',
      },
      {
        key: 'email',
        header: 'E-mail',
        required: true,
        example: 'joao@empresa.com',
      },
    ],
    schema: userFormSchema,
    onCreate,
  };
}

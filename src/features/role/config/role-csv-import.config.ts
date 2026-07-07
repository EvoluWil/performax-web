import {
  csvBooleanSchema,
} from '@/components/csv-import/csv-import.schema';
import type { CsvImportConfig } from '@/components/csv-import';
import {
  RoleFormDto,
  roleFormSchema,
} from '@/features/role/schemas/role-drawer.schema';
import * as yup from 'yup';

const roleImportSchema = roleFormSchema.shape({
  isAdmin: csvBooleanSchema(),
  permissions: yup.array().optional().default([]),
}) as yup.ObjectSchema<RoleFormDto>;

export function createRoleCsvImportConfig(
  onCreate: (row: RoleFormDto) => Promise<unknown>,
): CsvImportConfig<RoleFormDto> {
  return {
    entityLabel: 'cargos',
    columns: [
      {
        key: 'name',
        header: 'Nome',
        required: true,
        example: 'Gerente',
      },
      {
        key: 'description',
        header: 'Descrição',
        required: true,
        example: 'Gerencia equipe e aprovações',
      },
      {
        key: 'isAdmin',
        header: 'Administrador',
        example: 'Não',
      },
    ],
    schema: roleImportSchema,
    onCreate: async (row) =>
      onCreate({ ...row, permissions: row.permissions ?? [] }),
  };
}

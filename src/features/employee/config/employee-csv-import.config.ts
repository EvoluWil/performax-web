import type { CsvImportConfig } from '@/components/csv-import';
import {
  EmployeeFormDto,
  employeeFormSchema,
} from '@/features/employee/schemas/employee-drawer.schema';
import * as yup from 'yup';

export type EmployeeImportRow = EmployeeFormDto & {
  cliente?: string;
};

const employeeImportSchema = employeeFormSchema.shape({
  cliente: yup.string().optional(),
  clientId: yup.string().optional(),
}) as yup.ObjectSchema<EmployeeImportRow>;

export function createEmployeeCsvImportConfig(
  onCreate: (row: EmployeeFormDto) => Promise<unknown>,
): CsvImportConfig<EmployeeImportRow, EmployeeFormDto> {
  return {
    entityLabel: 'funcionários',
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
        key: 'cliente',
        header: 'Cliente',
        example: 'Empresa Exemplo Ltda',
      },
    ],
    schema: employeeImportSchema,
    references: [
      {
        csvKey: 'cliente',
        targetKey: 'clientId',
        resourceKey: 'clients',
        label: 'Cliente',
      },
    ],
    mapRow: (row, resolvedIds) => ({
      name: row.name,
      cpf: row.cpf,
      clientId: resolvedIds.clientId,
    }),
    onCreate,
  };
}

import type { CsvImportConfig } from '@/components/csv-import';
import {
  EmployeeFormDto,
  employeeFormSchema,
} from '@/features/employee/schemas/employee-drawer.schema';
import * as yup from 'yup';

export type EmployeeImportRow = EmployeeFormDto & {
  clienteCnpj?: string;
};

const employeeImportSchema = employeeFormSchema.shape({
  clienteCnpj: yup.string().optional(),
  clientId: yup.string().optional(),
}) as yup.ObjectSchema<EmployeeImportRow>;

export function createEmployeeCsvImportConfig(
  onCreate: (row: EmployeeImportRow) => Promise<unknown>,
): CsvImportConfig<EmployeeImportRow> {
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
        key: 'clienteCnpj',
        header: 'CNPJ Cliente',
        example: '12.345.678/0001-90',
      },
    ],
    schema: employeeImportSchema,
    onCreate,
  };
}

export function resolveEmployeeClientId(
  row: EmployeeImportRow,
  clients: { id: string; cnpj?: string }[],
): EmployeeFormDto {
  const { clienteCnpj, ...rest } = row;

  if (!clienteCnpj?.trim()) {
    return { ...rest, clientId: undefined };
  }

  const digits = clienteCnpj.replace(/\D/g, '');
  const client = clients.find(
    (c) => c.cnpj?.replace(/\D/g, '') === digits,
  );

  if (!client) {
    throw new Error(`Cliente com CNPJ ${clienteCnpj} não encontrado`);
  }

  return { ...rest, clientId: client.id };
}

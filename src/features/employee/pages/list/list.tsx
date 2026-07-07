'use client';

import { Table } from '@/components/common';
import { ListHeader } from '@/components/common/list-header/list-header';
import { CsvImportModal, useListCsvImport } from '@/components/csv-import';
import { Actions } from '@/components/common/table/table';
import { useClientsQuery } from '@/features/client/hooks';
import { EmployeeDrawer } from '@/features/employee/components';
import {
  createEmployeeCsvImportConfig,
  EmployeeImportRow,
  resolveEmployeeClientId,
} from '@/features/employee/config/employee-csv-import.config';
import { useEmployeeMutation } from '@/features/employee/hooks';
import { Employee } from '@/features/employee/types';
import { useCompanyPermissions } from '@/hooks/common/permission';
import { formatCpf } from '@/utils/cpf';
import { DeleteOutlined } from '@mui/icons-material';
import { Typography } from '@mui/material';
import { MRT_ColumnDef } from 'material-react-table';
import { useCallback, useMemo } from 'react';
import { useEmployeeList } from './list.hook';

const columns: MRT_ColumnDef<Employee>[] = [
  {
    accessorKey: 'name',
    header: 'Nome',
  },
  {
    accessorKey: 'cpf',
    header: 'CPF',
    muiTableHeadCellProps: {
      align: 'center',
    },
    muiTableBodyCellProps: {
      align: 'center',
    },
    Cell({ cell }: any) {
      return formatCpf(cell.getValue());
    },
  },
];

export const EmployeeList = () => {
  const {
    employees,
    openModal,
    selectedEmployee,
    handleOpenAdd,
    handleReload,
    handleSearch,
    handleCloseAdd,
    handleDeleteEmployee,
    handleSelectEmployeeToEdit,
    handlePaginationChange,
    pagination,
    count,
  } = useEmployeeList();
  const employeeMutation = useEmployeeMutation();
  const { data: clientsData } = useClientsQuery({ scopeModule: 'client' });
  const clients = useMemo(
    () => clientsData?.clients ?? [],
    [clientsData?.clients],
  );

  const handleCreate = useCallback(
    async (row: EmployeeImportRow) => {
      const payload = resolveEmployeeClientId(row, clients);
      return employeeMutation.mutateAsync({ type: 'create', data: payload });
    },
    [clients, employeeMutation],
  );

  const { importOpen, setImportOpen, config } = useListCsvImport(
    createEmployeeCsvImportConfig,
    handleCreate,
    [handleCreate],
  );

  const { hasPermission, isReady: permissionsReady } = useCompanyPermissions();
  const canWrite = permissionsReady && hasPermission('client', 'write');
  const canAdmin = permissionsReady && hasPermission('client', 'admin');
  const canEdit = canWrite || canAdmin;

  const actions: Actions<Employee>[] = [];

  if (canAdmin) {
    actions.push({
      icon: () => <DeleteOutlined />,
      label: () => 'Excluir funcionário',
      onClick: (employee) => handleDeleteEmployee(employee.id),
    });
  }

  return (
    <>
      <Typography variant="h5" gutterBottom color="primary" fontWeight="bold">
        FUNCIONÁRIOS
      </Typography>

      <ListHeader
        onAdd={canEdit ? handleOpenAdd : undefined}
        onImport={canEdit ? () => setImportOpen(true) : undefined}
        onReload={handleReload}
        onSearch={handleSearch}
        searchTitle="Pesquise por nome ou CPF"
        addTitle="Adicionar funcionário"
      />
      <br />
      <Table
        columns={columns}
        data={employees}
        emptyMessage="Nenhum resultado encontrado"
        onReload={handleReload}
        onRowClick={canEdit ? handleSelectEmployeeToEdit : () => null}
        actions={actions}
        pagination={pagination}
        onPaginationChange={handlePaginationChange}
        rowCount={count}
      />

      {openModal && (
        <EmployeeDrawer
          employee={selectedEmployee}
          open={openModal}
          onClose={handleCloseAdd}
        />
      )}

      <CsvImportModal
        open={importOpen}
        onClose={() => setImportOpen(false)}
        config={config}
        onComplete={handleReload}
      />
    </>
  );
};

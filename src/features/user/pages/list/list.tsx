'use client';

import { Table } from '@/components/common';
import { ListHeader } from '@/components/common/list-header/list-header';
import { UserDrawer } from '@/features/user/components';
import { User } from '@/types/user';
import { formatCpf } from '@/utils/cpf';
import { DeleteOutlined } from '@mui/icons-material';
import { Typography } from '@mui/material';
import { MRT_ColumnDef } from 'material-react-table';
import { useUserList } from './list.hook';

const columns: MRT_ColumnDef<User>[] = [
  {
    accessorKey: 'name',
    header: 'Nome',
  },
  {
    accessorKey: 'email',
    header: 'E-mail',
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

export const UserList = () => {
  const {
    users,
    openModal,
    selectedUser,
    handleOpenAdd,
    handleReload,
    handleSearch,
    handleCloseAdd,
    handleDeleteUser,
    handleSelectUserToEdit,
  } = useUserList();

  return (
    <>
      <Typography variant="h5" gutterBottom color="primary" fontWeight="bold">
        USUÁRIOS
      </Typography>

      <ListHeader
        onAdd={handleOpenAdd}
        onReload={handleReload}
        onSearch={handleSearch}
        searchTitle="Pesquise por nome, CPF ou e-mail"
        addTitle="Adicionar usuário"
      />
      <br />
      <Table
        columns={columns}
        data={users}
        emptyMessage="Nenhum resultado encontrado"
        onReload={handleReload}
        onRowClick={handleSelectUserToEdit}
        actions={[
          {
            icon: () => <DeleteOutlined />,
            label: () => 'Excluir usuário',
            onClick: (user) => handleDeleteUser(user.id),
          },
        ]}
      />

      {openModal && (
        <UserDrawer
          user={selectedUser}
          open={openModal}
          onClose={handleCloseAdd}
        />
      )}
    </>
  );
};

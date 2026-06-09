'use client';

import { Table } from '@/components/common';
import { Loading } from '@/components/common/loading/loading';
import { Actions } from '@/components/common/table/table';
import { Client } from '@/features/client/types';
import { useCompanyPermissions } from '@/hooks/common/permission';
import { formatDate } from '@/utils/date';
import {
  BlockOutlined,
  CloseOutlined,
  EditOutlined,
  RepeatOutlined,
  UploadFileOutlined,
} from '@mui/icons-material';
import { Box, Button, Chip, Link, Typography } from '@mui/material';
import { MRT_ColumnDef } from 'material-react-table';
import { useCallback, useState } from 'react';
import swal from 'sweetalert2';
import { useContractsQuery } from '../../hooks/queries/contracts.query';
import { useContractMutation } from '../../hooks/queries/contracts.query';
import { Contract } from '../../types/contract';
import { ContractDrawer } from '../contract-drawer/contract';
import { ContractRecurringModal } from '../contract-recurring-modal/contract-recurring-modal';
import { SignedContractModal } from '../signed-contract-modal/signed-contract-modal';
import {
  CloseButtonStyled,
  ModalContainer,
  ModalStyled,
} from '@/components/modal/modal-base.styles';
import { toast } from 'react-toastify';

type Props = {
  open: boolean;
  onClose: () => void;
  client: Client;
  onSuccess?: () => void;
};

const columns: MRT_ColumnDef<Contract>[] = [
  {
    accessorKey: 'type',
    header: 'Tipo',
    Cell: ({ cell }) => cell.getValue<any>()?.name || '-',
  },
  {
    accessorKey: 'value',
    header: 'Valor',
    Cell: ({ cell }) =>
      (Number(cell.getValue()) / 100).toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      }),
  },
  {
    accessorKey: 'dueDate',
    header: 'Vencimento',
    Cell: ({ cell }) =>
      cell.getValue() ? formatDate(cell.getValue() as string) : '-',
  },
  {
    accessorKey: 'active',
    header: 'Status',
    Cell: ({ cell }) => {
      const active = cell.getValue<boolean>();
      return (
        <Chip
          label={active ? 'Ativo' : 'Inativo'}
          size="small"
          color={active ? 'success' : 'default'}
          variant="outlined"
        />
      );
    },
  },
  {
    accessorKey: 'recurringId',
    header: 'Recorrência',
    Cell: ({ cell }) => {
      const id = cell.getValue<string | null>();
      return (
        <Chip
          label={id ? 'Sim' : 'Não'}
          size="small"
          color={id ? 'primary' : 'default'}
          variant="outlined"
        />
      );
    },
  },
  {
    accessorKey: 'startDate',
    header: 'Início',
    Cell: ({ cell }) =>
      cell.getValue() ? formatDate(cell.getValue() as string) : '-',
  },
  {
    accessorKey: 'endDate',
    header: 'Término',
    Cell: ({ cell }) =>
      cell.getValue() ? formatDate(cell.getValue() as string) : '-',
  },
  {
    accessorKey: 'generatedPdf',
    header: 'PDF gerado',
    Cell: ({ cell }) => {
      const file = cell.getValue<any>();
      if (!file?.url) return '-';
      return (
        <Link href={file.url} target="_blank" rel="noopener noreferrer">
          PDF
        </Link>
      );
    },
  },
  {
    accessorKey: 'attachment',
    header: 'Assinado',
    Cell: ({ cell }) => {
      const file = cell.getValue<any>();
      if (!file?.url) return '-';
      return (
        <Link href={file.url} target="_blank" rel="noopener noreferrer">
          PDF
        </Link>
      );
    },
  },
];

export const ClientContractsModal: React.FC<Props> = ({
  open,
  onClose,
  client,
  onSuccess,
}) => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedContract, setSelectedContract] = useState<Contract | null>(
    null,
  );
  const [signedTarget, setSignedTarget] = useState<Contract | null>(null);
  const [recurringTarget, setRecurringTarget] = useState<Contract | null>(null);
  const [recurringLoading, setRecurringLoading] = useState(false);

  const { data, refetch } = useContractsQuery({
    clientId: client.id,
    pageSize: 100,
  });
  const contractMutation = useContractMutation();
  const contracts = data?.contracts ?? client.contracts ?? [];

  const { hasPermission, isReady } = useCompanyPermissions();
  const canEdit = isReady && hasPermission('client', 'write');

  const handleOpenAdd = () => {
    setSelectedContract(null);
    setDrawerOpen(true);
  };

  const handleEdit = (contract: Contract) => {
    setSelectedContract(contract);
    setDrawerOpen(true);
  };

  const handleDrawerClose = () => {
    setDrawerOpen(false);
    setSelectedContract(null);
  };

  const handleSuccess = async () => {
    await refetch();
    onSuccess?.();
  };

  const promptCreateRecurring = useCallback(async (contract: Contract) => {
    if (!contract.active || contract.recurringId || !contract.dueDate) return;

    const result = await swal.fire({
      title: 'Deseja criar uma recorrência financeira para este contrato?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sim',
      cancelButtonText: 'Não',
    });

    if (result.isConfirmed) {
      setRecurringTarget(contract);
    }
  }, []);

  const handleInactivate = (contractId: string) => {
    swal.fire({
      title: 'Inativar contrato?',
      text: 'As próximas recorrências serão canceladas.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sim, inativar',
      cancelButtonText: 'Cancelar',
      preConfirm: async () => {
        await contractMutation.mutateAsync({ type: 'inactivate', id: contractId });
        toast.success('Contrato inativado com sucesso');
        await handleSuccess();
      },
    });
  };

  const tableActions: Actions<Contract>[] = [];

  if (canEdit) {
    tableActions.push({
      icon: () => <UploadFileOutlined />,
      label: (row) =>
        row.attachment?.url
          ? 'Editar contrato assinado'
          : 'Adicionar contrato assinado',
      onClick: (row) => setSignedTarget(row),
    });

    tableActions.push({
      icon: () => <RepeatOutlined />,
      label: () => 'Gerar recorrência',
      onClick: (row) => setRecurringTarget(row),
      condition: (row) => row.active && !row.recurringId && !!row.dueDate,
    });

    tableActions.push({
      icon: () => <EditOutlined />,
      label: () => 'Editar contrato',
      onClick: handleEdit,
    });

    tableActions.push({
      icon: () => <BlockOutlined />,
      label: () => 'Inativar contrato',
      onClick: (row) => handleInactivate(row.id),
      condition: (row) => row.active,
    });
  }

  return (
    <>
      {recurringLoading && (
        <Loading fullScreen message="Criando recorrência financeira..." />
      )}

      <ModalStyled open={open} onClose={onClose}>
        <ModalContainer sx={{ minWidth: { xs: '95vw', md: 900 } }}>
          <CloseButtonStyled onClick={onClose}>
            <CloseOutlined />
          </CloseButtonStyled>
          <Typography variant="h6" component="h2">
            Contratos — {client.name}
          </Typography>
          <Box display="flex" justifyContent="flex-end" mb={2}>
            {canEdit && (
              <Button variant="contained" onClick={handleOpenAdd}>
                Adicionar contrato
              </Button>
            )}
          </Box>
          <Table
            columns={columns}
            data={contracts}
            emptyMessage="Nenhum contrato encontrado"
            onRowClick={canEdit ? handleEdit : undefined}
            actions={tableActions}
          />
        </ModalContainer>
      </ModalStyled>

      {drawerOpen && (
        <ContractDrawer
          open={drawerOpen}
          onClose={handleDrawerClose}
          contract={selectedContract}
          defaultClientId={client.id}
          onSuccess={handleSuccess}
          onSaved={promptCreateRecurring}
        />
      )}

      {signedTarget && (
        <SignedContractModal
          open={!!signedTarget}
          onClose={() => setSignedTarget(null)}
          contract={signedTarget}
          onSuccess={handleSuccess}
        />
      )}

      {recurringTarget && (
        <ContractRecurringModal
          open={!!recurringTarget}
          onClose={() => setRecurringTarget(null)}
          contract={recurringTarget}
          onSuccess={handleSuccess}
          onLoadingChange={setRecurringLoading}
        />
      )}
    </>
  );
};

'use client';

import { PageTitle, SplitActions } from '@/components/common';
import { Loading } from '@/components/common/loading/loading';
import { ClientContractsModal } from '@/features/contract/components/client-contracts-modal/client-contracts-modal';
import { Box, Divider } from '@mui/material';
import { ClientDetailCard } from '../../components/client-detail-card/client-detail-card';
import { ClientDrawer } from '../../components/client-drawer/client';
import { useClientDetail } from './detail.hook';

export const ClientDetail = () => {
  const {
    client,
    editModalOpen,
    contractsModalOpen,
    loading,
    handleBack,
    toggleEditModal,
    toggleContractsModal,
    handleDelete,
    refetch,
  } = useClientDetail();

  if (!client) {
    return <Loading />;
  }

  return (
    <>
      {loading && <Loading fullScreen message="Atualizando cliente..." />}
      <Box>
        <PageTitle
          title="Detalhe do Cliente"
          onBack={handleBack}
          actions={[
            {
              key: 'actions-menu',
              node: (
                <SplitActions
                  primaryLabel="Ações"
                  actions={[
                    {
                      key: 'contracts',
                      label: 'Ver contratos',
                      onClick: toggleContractsModal,
                      visible: true,
                    },
                    {
                      key: 'edit',
                      label: 'Editar',
                      onClick: () => toggleEditModal(true),
                      visible: true,
                    },
                    {
                      key: 'delete',
                      label: 'Excluir',
                      onClick: handleDelete,
                      visible: true,
                    },
                  ]}
                />
              ),
            },
          ]}
        />

        <Divider sx={{ my: 2 }} />

        <ClientDetailCard client={client} />
      </Box>

      {editModalOpen && (
        <ClientDrawer
          client={client}
          open
          onClose={() => toggleEditModal(false)}
          onSuccess={refetch}
        />
      )}

      {contractsModalOpen && (
        <ClientContractsModal
          open={contractsModalOpen}
          onClose={toggleContractsModal}
          client={client}
          onSuccess={refetch}
        />
      )}
    </>
  );
};

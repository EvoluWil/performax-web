'use client';

import { PageTitle, SplitActions } from '@/components/common';
import { Loading } from '@/components/common/loading/loading';
import {
  ConclusionModal,
  ImpedimentModal,
  TaskDetailCard,
} from '@/features/task/components';
import { useCompanyPermissions } from '@/hooks/common/permission';
import { Box, Chip, Divider, Typography } from '@mui/material';
import { AttachFilesModal } from '../../components/AttachFilesModal';
import { RescheduleModal } from '../../components/RescheduleModal';
import { useAttendanceDetail } from './detail.hook';

type AttendanceDetailProps = {
  companyId: string;
  taskId: string;
  companyName?: string;
};

export const AttendanceDetail = ({
  companyId,
  taskId,
  companyName,
}: AttendanceDetailProps) => {
  const {
    task,
    loading,
    taskLoading,
    taskChecklistIncomplete,
    handleBack,
    handleStart,
    rescheduleOpen,
    setRescheduleOpen,
    handleReschedule,
    attachFilesOpen,
    setAttachFilesOpen,
    handleAddFiles,
    impedimentOpen,
    setImpedimentOpen,
    handleImpediment,
    handleResolved,
    conclusionOpen,
    setConclusionOpen,
    handleFinalize,
  } = useAttendanceDetail(companyId, taskId);

  const { hasPermission, isReady: permissionsReady } = useCompanyPermissions();
  const canWrite = permissionsReady && hasPermission('task', 'write');

  if (taskLoading || !task) return <Loading />;

  if (!permissionsReady) return <Loading />;

  if (!canWrite) {
    return (
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        py={8}
        color="text.secondary"
        gap={1}
      >
        <Typography variant="body1">
          Você não tem permissão para acessar o atendimento.
        </Typography>
      </Box>
    );
  }

  return (
    <>
      {loading && <Loading fullScreen message="Atualizando OS..." />}
      <Box>
        <PageTitle
          title={
            <Box display="flex" alignItems="center" gap={1}>
              Detalhe do Atendimento
              {companyName && (
                <Chip
                  label={companyName}
                  size="small"
                  variant="outlined"
                  color="primary"
                />
              )}
            </Box>
          }
          onBack={handleBack}
          actions={[
            {
              key: 'actions-menu',
              node: (
                <SplitActions
                  primaryLabel="Ações"
                  actions={[
                    {
                      key: 'start',
                      label: 'Iniciar',
                      onClick: handleStart,
                      visible:
                        canWrite &&
                        task.approved !== false &&
                        [
                          'PENDING',
                          'OPEN',
                          'SCHEDULED',
                          'EMERGENCY',
                          'APPROVED',
                          'EXPIRED',
                        ].includes(task.status),
                    },
                    {
                      key: 'reschedule',
                      label: 'Reagendar',
                      onClick: () => setRescheduleOpen(true),
                      visible:
                        canWrite && !['CLOSED', 'REJECTED'].includes(task.status),
                    },
                    {
                      key: 'attach',
                      label: 'Adicionar Anexos',
                      onClick: () => setAttachFilesOpen(true),
                      visible:
                        canWrite && !['CLOSED', 'REJECTED'].includes(task.status),
                    },
                    {
                      key: 'impediment',
                      label: 'Impedimento',
                      onClick: () => setImpedimentOpen(true),
                      visible:
                        canWrite &&
                        task.approved !== false &&
                        task.status === 'IN_PROGRESS',
                    },
                    {
                      key: 'resolved',
                      label: 'Resolver Impedimento',
                      onClick: handleResolved,
                      visible:
                        canWrite &&
                        task.approved !== false && task.status === 'IMPEDED',
                    },
                    {
                      key: 'finalize',
                      label: 'Finalizar',
                      onClick: () => setConclusionOpen(true),
                      visible:
                        canWrite &&
                        task.approved !== false &&
                        task.status === 'IN_PROGRESS',
                    },
                  ]}
                />
              ),
            },
          ]}
        />

        <Divider sx={{ my: 2 }} />

        <TaskDetailCard task={task} onUpdateChecklistItem={async () => {}} />
      </Box>

      <RescheduleModal
        open={rescheduleOpen}
        currentDate={task.date}
        onClose={() => setRescheduleOpen(false)}
        onConfirm={handleReschedule}
        loading={loading}
      />

      <AttachFilesModal
        open={attachFilesOpen}
        onClose={() => setAttachFilesOpen(false)}
        onSubmit={handleAddFiles}
        loading={loading}
      />

      {impedimentOpen && (
        <ImpedimentModal
          open={impedimentOpen}
          onClose={() => setImpedimentOpen(false)}
          onSubmit={handleImpediment}
        />
      )}

      {conclusionOpen && (
        <ConclusionModal
          open={conclusionOpen}
          onClose={() => setConclusionOpen(false)}
          onSubmit={handleFinalize}
          hasIncompleteChecklist={taskChecklistIncomplete}
        />
      )}
    </>
  );
};

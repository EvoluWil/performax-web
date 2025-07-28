import { BaseDrawer } from '@/components/drawer';
import { TextInput } from '@/components/inputs';
import { TaskType } from '@/features/task/types';
import { Box, Button } from '@mui/material';
import { useTaskTypeDrawer } from './task-type.hook';

export type TaskTypeDrawerProps = {
  open: boolean;
  onClose: () => void;
  taskType: TaskType | null;
};

export const TaskTypeDrawer: React.FC<TaskTypeDrawerProps> = (props) => {
  const { control, handleTaskType, loading, handleClose, open, editing } =
    useTaskTypeDrawer(props);

  return (
    <BaseDrawer
      open={open}
      setOpen={handleClose}
      height="auto"
      title={editing ? 'Editar Tipo de Tarefa' : 'Novo Tipo de Tarefa'}
      content={
        <Box
          gap={2}
          component="form"
          display="flex"
          alignItems="center"
          justifyContent="center"
          flexDirection="column"
          flex={1}
        >
          <TextInput
            label="Nome do tipo de tarefa"
            name="name"
            control={control}
          />
          <TextInput
            label="Necessita Aprovação?"
            name="needApprove"
            control={control}
          />

          <Box
            mt="auto"
            display="flex"
            gap={2}
            justifyContent="space-between"
            width="100%"
          >
            <Button
              variant="outlined"
              color="error"
              onClick={handleClose}
              loading={loading}
              fullWidth
            >
              Cancelar
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={handleTaskType}
              type="submit"
              loading={loading}
              fullWidth
            >
              Confirmar
            </Button>
          </Box>
        </Box>
      }
    />
  );
};

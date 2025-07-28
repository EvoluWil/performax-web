import { BaseDrawer } from '@/components/drawer';
import { TextInput } from '@/components/inputs';
import { Task } from '@/features/task/types';
import { Box, Button } from '@mui/material';
import { useTaskDrawer } from './task.hook';

export type TaskDrawerProps = {
  open: boolean;
  onClose: () => void;
  task: Task | null;
};

export const TaskDrawer: React.FC<TaskDrawerProps> = (props) => {
  const { control, handleTask, loading, handleClose, open, editing } =
    useTaskDrawer(props);

  return (
    <BaseDrawer
      open={open}
      setOpen={handleClose}
      height="auto"
      title={editing ? 'Editar Tarefa' : 'Nova Tarefa'}
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
          <TextInput label="Título" name="title" control={control} />

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
              onClick={handleTask}
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

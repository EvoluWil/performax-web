import { BaseDrawer } from '@/components/drawer';
import { ButtonGroup, TextInput } from '@/components/inputs';
import { TaskType } from '@/features/task/types';
import { Box, Button } from '@mui/material';
import { Controller } from 'react-hook-form';
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
      title={editing ? 'Editar Tipo de OS' : 'Novo Tipo de OS'}
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
          <TextInput label="Nome do tipo de OS" name="name" control={control} />

          <Controller
            name="needApprove"
            control={control}
            render={({ field }) => (
              <ButtonGroup
                label="Necessita aprovação?"
                value={field.value ? 'true' : 'false'}
                onChange={(value) => field.onChange(value === 'true')}
                options={[
                  { value: 'true', label: 'Sim' },
                  { value: 'false', label: 'Não' },
                ]}
                variant="outlined"
                sx={{ width: '100%' }}
              />
            )}
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

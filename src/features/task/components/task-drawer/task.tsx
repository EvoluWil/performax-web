import { BaseDrawer } from '@/components/drawer';
import {
  DateTimeInput,
  FileInput,
  SelectInput,
  TextInput,
} from '@/components/inputs';
import { Task } from '@/features/task/types';
import { Box, Button, Divider } from '@mui/material';
import { useTaskDrawer } from './task.hook';

export type TaskDrawerProps = {
  open: boolean;
  onClose: () => void;
  task: Task | null;
};

export const TaskDrawer: React.FC<TaskDrawerProps> = (props) => {
  const {
    control,
    handleTask,
    loading,
    handleClose,
    open,
    editing,
    options,
    defaultFiles,
    handleRemoveDefaultFile,
  } = useTaskDrawer(props);

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
          <TextInput
            label="Título"
            name="title"
            placeholder="Digite o título da tarefa"
            control={control}
          />
          <TextInput
            label="Descrição"
            name="description"
            placeholder="Descreva a tarefa"
            control={control}
            multiline
            minRows={3}
          />
          <DateTimeInput label="Data e Hora" name="date" control={control} />
          <SelectInput
            label="Status"
            name="status"
            control={control}
            options={[
              { value: 'OPEN', label: 'Aberta' },
              { value: 'EMERGENCY', label: 'Emergência' },
              { value: 'SCHEDULED', label: 'Agendada' },
            ]}
          />
          <SelectInput
            label="Responsável"
            name="responsibleId"
            control={control}
            options={options.users || []}
          />
          <SelectInput
            label="Cliente"
            name="clientId"
            control={control}
            options={options.clients || []}
          />
          <SelectInput
            label="Tipo de Tarefa"
            name="typeId"
            control={control}
            options={options.types || []}
          />
          <TextInput
            label="Observações"
            name="internalNote"
            placeholder="Digite suas observações"
            control={control}
            multiline
            minRows={3}
          />
          <FileInput
            label="Adicionar arquivos"
            name="files"
            control={control}
            multiple
            defaultFiles={defaultFiles}
            onRemoveDefaultFile={handleRemoveDefaultFile}
          />
          <Divider sx={{ width: '100%' }} />
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

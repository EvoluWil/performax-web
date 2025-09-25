import { BaseDrawer } from '@/components/drawer';
import {
  DateTimeInput,
  FileInput,
  SelectInput,
  TextInput,
} from '@/components/inputs';
import { ChecklistDto, Task } from '@/features/task/types';
import DeleteOutline from '@mui/icons-material/DeleteOutline';
import {
  Box,
  Button,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Typography,
} from '@mui/material';
import { useState } from 'react';
import { useWatch } from 'react-hook-form';
import { ChecklistModal } from '..';
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
    setValue,
  } = useTaskDrawer(props);
  const [openChecklist, setOpenChecklist] = useState(false);
  const checklist = useWatch({ control, name: 'checklist' }) as
    | ChecklistDto
    | null
    | undefined;
  const expectedTypeLabels: Record<string, string> = {
    BOOLEAN: 'Escolha',
    TEXT: 'Texto',
    NUMBER: 'Número',
  };
  return (
    <>
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
                { value: 'EMERGENCY', label: 'Emerência' },
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

            <Divider sx={{ width: '100%' }} />

            {Array.isArray(checklist?.modules) &&
            checklist!.modules.length > 0 ? (
              <List sx={{ width: '100%' }}>
                {checklist!.modules.map((modGroup: any, modIdx: number) => (
                  <Box
                    key={modIdx}
                    sx={{
                      border: '1px solid #eee',
                      borderRadius: 1,
                      mb: 1,
                    }}
                  >
                    <ListItem
                      secondaryAction={
                        <IconButton
                          edge="end"
                          aria-label="delete-module-group"
                          onClick={() => {
                            const existing = checklist || { modules: [] };
                            const modules = Array.isArray(existing.modules)
                              ? [...existing.modules]
                              : [];
                            modules.splice(modIdx, 1);
                            setValue('checklist' as any, {
                              ...existing,
                              modules,
                            });
                          }}
                        >
                          <DeleteOutline />
                        </IconButton>
                      }
                    >
                      <ListItemText
                        primary={modGroup.name || `Módulo ${modIdx + 1}`}
                      />
                    </ListItem>

                    {Array.isArray(modGroup.items) && (
                      <List sx={{ pl: 4 }}>
                        {modGroup.items.map((item: any, idx: number) => (
                          <ListItem
                            key={idx}
                            secondaryAction={
                              <IconButton
                                edge="end"
                                aria-label="delete-item"
                                onClick={() => {
                                  const existing = checklist || { modules: [] };
                                  const modules = Array.isArray(
                                    existing.modules,
                                  )
                                    ? [...existing.modules]
                                    : [];
                                  const target = modules[modIdx] || {
                                    items: [],
                                  };
                                  const items = Array.isArray(target.items)
                                    ? [...target.items]
                                    : [];
                                  items.splice(idx, 1);
                                  modules[modIdx] = { ...target, items };
                                  setValue('checklist' as any, {
                                    ...existing,
                                    modules,
                                  });
                                }}
                              >
                                <DeleteOutline />
                              </IconButton>
                            }
                          >
                            <ListItemText
                              primary={item.question || 'Sem pergunta'}
                              secondary={
                                expectedTypeLabels[item.expectedType] ||
                                item.expectedType ||
                                ''
                              }
                            />
                          </ListItem>
                        ))}
                      </List>
                    )}
                  </Box>
                ))}
              </List>
            ) : (
              <Typography
                variant="body2"
                color="text.secondary"
                textAlign="center"
                sx={{ width: '100%', py: 2 }}
              >
                Nenhum checklist adicionado
              </Typography>
            )}

            <Button
              variant="outlined"
              color="primary"
              onClick={() => setOpenChecklist(true)}
              fullWidth
            >
              Adicionar checklist
            </Button>

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

      <ChecklistModal
        open={openChecklist}
        onClose={() => setOpenChecklist(false)}
        startWithModule={true}
        onSuccess={(payload) => {
          const existing = checklist || { modules: [] };
          const existingModules = Array.isArray(existing.modules)
            ? [...existing.modules]
            : [];
          const payloadModules = Array.isArray(payload.modules)
            ? payload.modules
            : [];
          setValue('checklist' as any, {
            ...existing,
            modules: [...existingModules, ...payloadModules],
          });
          setOpenChecklist(false);
        }}
      />
    </>
  );
};

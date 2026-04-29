import { BaseDrawer } from '@/components/drawer';
import {
  AutocompleteInput,
  CurrencyInput,
  DateTimeInput,
  FileInput,
  SelectInput,
  TextInput,
} from '@/components/inputs';
import { RecurrenceModal } from '@/components/modal';
import { ClientDrawer } from '@/features/client/components/client-drawer/client';
import { ChecklistDto, Task } from '@/features/task/types';
import { formatRRuleToText } from '@/utils/rrule';
import { DeleteOutline } from '@mui/icons-material';
import {
  Box,
  Button,
  Divider,
  FormControl,
  IconButton,
  InputLabel,
  List,
  ListItem,
  ListItemText,
  MenuItem,
  Select,
  Typography,
} from '@mui/material';
import { useState } from 'react';
import { useWatch } from 'react-hook-form';
import { ChecklistModal } from '..';
import { TaskTypeDrawer } from '../task-type-drawer/task-type';
import { useTaskDrawer } from './task.hook';

export type TaskDrawerProps = {
  open: boolean;
  onClose: () => void;
  task: Task | null;
  onSuccess?: () => void;
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
    setSearch,
    canCreateClient,
    canCreateTaskType,
    handleOpenCreateClient,
    handleOpenCreateTaskType,
    clientDrawerOpen,
    taskTypeDrawerOpen,
    clientInitialName,
    taskTypeInitialName,
    handleCloseClientDrawer,
    handleCloseTaskTypeDrawer,
    handleClientCreated,
    handleTaskTypeCreated,
    defaultFiles,
    handleRemoveDefaultFile,
    setValue,
    hasRecurrence,
    companyOptions,
    selectedCompanyId,
    setSelectedCompanyId,
  } = useTaskDrawer(props);
  const [openChecklist, setOpenChecklist] = useState(false);
  const [openRecurrence, setOpenRecurrence] = useState(false);
  const checklist = useWatch({ control, name: 'checklist' }) as
    | ChecklistDto
    | null
    | undefined;
  const recurrence =
    (useWatch({ control, name: 'recurrence' }) as string) || '';
  const dateValue = useWatch({ control, name: 'date' });
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
        title={editing ? 'Editar OS' : 'Nova OS'}
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
            {companyOptions.length > 1 && (
              <FormControl fullWidth size="small">
                <InputLabel>Empresa</InputLabel>
                <Select
                  label="Empresa"
                  value={selectedCompanyId}
                  onChange={(e) => setSelectedCompanyId(e.target.value)}
                >
                  {companyOptions.map((opt) => (
                    <MenuItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
            <TextInput
              label="Título"
              name="title"
              placeholder="Digite o título da OS"
              control={control}
            />
            <TextInput
              label="Descrição"
              name="description"
              placeholder="Descreva a OS"
              control={control}
              multiline
              minRows={3}
            />
            <DateTimeInput label="Data e Hora" name="date" control={control} />
            <CurrencyInput label="Valor" name="value" control={control} />
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
            <AutocompleteInput
              label="Responsável"
              name="responsibleId"
              control={control}
              options={options.users ?? []}
              onInputChange={(v) => setSearch('users', v)}
            />
            <AutocompleteInput
              label="Cliente"
              name="clientId"
              control={control}
              options={options.clients ?? []}
              onInputChange={(v) => setSearch('clients', v)}
              enableCreate={canCreateClient}
              createLabel="Adicionar cliente"
              onCreate={handleOpenCreateClient}
            />
            <AutocompleteInput
              label="Tipo de OS"
              name="typeId"
              control={control}
              options={options.taskTypes ?? []}
              onInputChange={(v) => setSearch('taskTypes', v)}
              enableCreate={canCreateTaskType}
              createLabel="Adicionar tipo de OS"
              onCreate={handleOpenCreateTaskType}
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

            <Box
              p={2}
              width="100%"
              display="flex"
              flexDirection="column"
              gap={2}
              border={({ palette }) => `1px solid ${palette.primary.main}`}
              borderRadius={1}
            >
              <Typography
                variant="h6"
                textAlign="left"
                color="primary"
                width="100%"
              >
                Recorrência
              </Typography>

              {(hasRecurrence || !editing) && (
                <Box
                  sx={{
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 1,
                    alignItems: 'center',
                  }}
                >
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => setOpenRecurrence(true)}
                    fullWidth
                  >
                    {hasRecurrence ? 'Editar' : 'Definir'} recorrência
                  </Button>
                  {hasRecurrence && (
                    <Button
                      variant="outlined"
                      color="primary"
                      fullWidth
                      onClick={() => setValue('recurrence', '')}
                    >
                      Limpar recorrência
                    </Button>
                  )}
                </Box>
              )}

              {recurrence && (
                <Box
                  sx={{
                    width: '100%',
                    p: 2,
                    backgroundColor: ({ palette }) =>
                      palette.mode === 'light'
                        ? palette.grey[50]
                        : palette.grey[900],
                    borderRadius: 1,
                    border: ({ palette }) => `1px solid ${palette.grey[300]}`,
                  }}
                >
                  <Typography
                    variant="subtitle2"
                    color="primary"
                    fontWeight="bold"
                    sx={{ mb: 1 }}
                  >
                    Recorrência configurada:
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.primary"
                    sx={{ fontStyle: 'italic' }}
                  >
                    {formatRRuleToText(recurrence)}
                  </Typography>
                </Box>
              )}
            </Box>

            <Divider sx={{ width: '100%' }} />

            <Box
              p={2}
              width="100%"
              display="flex"
              flexDirection="column"
              gap={2}
              border={({ palette }) => `1px solid ${palette.primary.main}`}
              borderRadius={1}
            >
              <Typography
                variant="h6"
                textAlign="left"
                color="primary"
                width="100%"
              >
                Checklist
              </Typography>
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
                              setValue('checklist', {
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
                                    const existing = checklist || {
                                      modules: [],
                                    };
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
            </Box>

            <Divider sx={{ width: '100%' }} />

            <Box
              p={2}
              width="100%"
              display="flex"
              flexDirection="column"
              gap={2}
              border={({ palette }) => `1px solid ${palette.primary.main}`}
              borderRadius={1}
            >
              <Typography
                variant="h6"
                textAlign="left"
                color="primary"
                width="100%"
              >
                Anexos
              </Typography>

              <FileInput
                label="Adicionar arquivos"
                name="files"
                control={control}
                multiple
                defaultFiles={defaultFiles}
                onRemoveDefaultFile={handleRemoveDefaultFile}
              />
            </Box>

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
          setValue('checklist', {
            ...existing,
            modules: [...existingModules, ...payloadModules],
          });
          setOpenChecklist(false);
        }}
      />

      <RecurrenceModal
        open={openRecurrence}
        onClose={() => setOpenRecurrence(false)}
        initialRRule={recurrence || undefined}
        dtstart={dateValue ? new Date(dateValue) : undefined}
        onSubmit={(rrule) => {
          setValue('recurrence', rrule);
          setOpenRecurrence(false);
        }}
      />
      <ClientDrawer
        open={clientDrawerOpen}
        onClose={handleCloseClientDrawer}
        client={null}
        initialName={clientInitialName}
        onCreated={handleClientCreated}
      />
      <TaskTypeDrawer
        open={taskTypeDrawerOpen}
        onClose={handleCloseTaskTypeDrawer}
        taskType={null}
        initialName={taskTypeInitialName}
        onCreated={handleTaskTypeCreated}
      />
    </>
  );
};

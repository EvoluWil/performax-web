import { BaseDrawer } from '@/components/drawer';
import { SelectInput } from '@/components/inputs';
import { formatCpf } from '@/utils/cpf';
import {
  Box,
  Button,
  List,
  ListItem,
  ListItemText,
  Typography,
} from '@mui/material';
import {
  UserSubordinatesDrawerProps,
  useUserSubordinatesDrawer,
} from './user-subordinates-drawer.hook';

export type { UserSubordinatesDrawerProps };

export const UserSubordinatesDrawer: React.FC<UserSubordinatesDrawerProps> = (
  props,
) => {
  const {
    control,
    handleAssignSubordinates,
    loading,
    handleClose,
    open,
    availableUsers,
    selectedUsers,
  } = useUserSubordinatesDrawer(props);

  const selectOptions = availableUsers.map((user) => ({
    value: user.id,
    label: user.name,
  }));

  return (
    <BaseDrawer
      open={open}
      setOpen={handleClose}
      height="auto"
      title="Gerenciar Subordinados"
      content={
        <Box
          gap={2}
          component="form"
          display="flex"
          alignItems="stretch"
          justifyContent="center"
          flexDirection="column"
          flex={1}
          width="100%"
        >
          <SelectInput
            name="targetIds"
            label="Selecionar Subordinados"
            control={control}
            multiple
            options={selectOptions}
            placeholder="Selecione os usuários..."
          />

          {selectedUsers.length > 0 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Subordinados Selecionados:
              </Typography>
              <List dense>
                {selectedUsers.map((user) => (
                  <ListItem
                    key={user.id}
                    sx={{
                      border: 1,
                      borderColor: 'divider',
                      borderRadius: 1,
                      mb: 1,
                      backgroundColor: 'background.paper',
                    }}
                  >
                    <ListItemText
                      primary={user.name}
                      secondary={`CPF: ${formatCpf(user.cpf)} • Email: ${
                        user.email
                      }`}
                    />
                  </ListItem>
                ))}
              </List>
            </Box>
          )}

          {selectedUsers.length === 0 && (
            <Box
              sx={{
                textAlign: 'center',
                py: 4,
                color: 'text.secondary',
              }}
            >
              <Typography variant="body2">
                Nenhum subordinado selecionado.
              </Typography>
            </Box>
          )}

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
              disabled={loading}
              fullWidth
            >
              Cancelar
            </Button>

            <Button
              variant="contained"
              color="primary"
              onClick={handleAssignSubordinates}
              disabled={loading}
              loading={loading}
              fullWidth
            >
              Salvar
            </Button>
          </Box>
        </Box>
      }
    />
  );
};

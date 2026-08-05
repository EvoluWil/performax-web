import { BaseDrawer } from '@/components/drawer';
import { AutocompleteInput } from '@/components/inputs';
import { Box, Button } from '@mui/material';
import {
  UserRoleDrawerProps,
  useUserRoleDrawer,
} from './user-role-drawer.hook';

export type { UserRoleDrawerProps };

export const UserRoleDrawer: React.FC<UserRoleDrawerProps> = (props) => {
  const {
    control,
    handleAssignRole,
    handleRemoveRole,
    loading,
    handleClose,
    open,
    roles,
    hasRole,
    hasUpdatedRole,
  } = useUserRoleDrawer(props);

  return (
    <BaseDrawer
      open={open}
      setOpen={handleClose}
      height="auto"
      title={hasRole ? 'Alterar Cargo do Usuário' : 'Atribuir Cargo ao Usuário'}
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
          <AutocompleteInput
            name="roleId"
            label="Cargo"
            control={control}
            options={roles.map((role: any) => ({
              value: role.id,
              label: role.name,
            }))}
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
              disabled={loading}
              fullWidth
            >
              Cancelar
            </Button>

            {hasRole && hasUpdatedRole && (
              <Button
                variant="outlined"
                color="warning"
                onClick={handleRemoveRole}
                disabled={loading}
                fullWidth
                sx={{ whiteSpace: 'nowrap' }}
              >
                Remover cargo
              </Button>
            )}

            {!hasUpdatedRole && (
              <Button
                variant="contained"
                color="primary"
                onClick={handleAssignRole}
                disabled={loading}
                fullWidth
              >
                {hasRole ? 'Alterar Cargo' : 'Atribuir Cargo'}
              </Button>
            )}
          </Box>
        </Box>
      }
    />
  );
};

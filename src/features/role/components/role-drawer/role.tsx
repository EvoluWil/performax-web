import { BaseDrawer } from '@/components/drawer';
import { ButtonGroup, Switch, TextInput } from '@/components/inputs';
import { Permission, Role } from '@/features/role/types';
import {
  Alert,
  Box,
  Button,
  Collapse,
  Divider,
  Switch as MuiSwitch,
  Typography,
} from '@mui/material';
import { useRoleDrawer } from './role.hook';

export type RoleDrawerProps = {
  open: boolean;
  onClose: () => void;
  role: Role | null;
};

export const RoleDrawer: React.FC<RoleDrawerProps> = (props) => {
  const {
    control,
    handleRole,
    loading,
    handleClose,
    open,
    companyModules,
    permissions,
    handleUpdatePermissions,
    handleUpdatePermissionLevel,
    handleUpdatePermissionScope,
    isAdmin,
    editing,
  } = useRoleDrawer(props);

  return (
    <BaseDrawer
      open={open}
      setOpen={handleClose}
      height="auto"
      title={editing ? 'Editar Cargo' : 'Novo Cargo'}
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
            label="Nome do cargo"
            type="text"
            name="name"
            control={control}
          />
          <TextInput
            label="Descrição"
            type="text"
            name="description"
            control={control}
          />

          <Box width="100%">
            <Switch label="Administrador" name="isAdmin" control={control} />
            <Alert severity="info">
              Se marcar este cargo como um administrador, ele terá acesso total
              a todas as funcionalidades do sistema.
            </Alert>
          </Box>

          <Divider sx={{ width: '100%' }} />

          {!isAdmin && (
            <>
              <Box textAlign="left" width="100%">
                <Typography variant="body1" color="primary.main">
                  Permissões
                </Typography>
                <Typography variant="caption" color="textSecondary" mt={-2}>
                  Selecione as permissões que deseja atribuir a este cargo.
                </Typography>
              </Box>
              {companyModules?.map((item) => {
                const permission = permissions.find(
                  (p) => p.moduleId === item.id,
                );
                return (
                  <Box key={item.id} width="100%">
                    <Box
                      display="flex"
                      alignItems="center"
                      gap={1}
                      justifyContent="space-between"
                      width="100%"
                    >
                      <Typography variant="body2" color="textPrimary">
                        {item.module?.name}
                      </Typography>
                      <MuiSwitch
                        checked={!!permission}
                        onChange={() => handleUpdatePermissions(item.id)}
                      />
                    </Box>
                    {permission && (
                      <Collapse in>
                        <Box p={2}>
                          <Typography variant="body2" color="textSecondary">
                            Nível de acesso
                          </Typography>
                          <ButtonGroup
                            options={[
                              { label: 'Leitura', value: 'READ' },
                              { label: 'Escrita', value: 'WRITE' },
                              { label: 'Admin', value: 'ADMIN' },
                            ]}
                            value={permission.permission}
                            onChange={(value) =>
                              handleUpdatePermissionLevel(
                                item.id,
                                value as Permission['permission'],
                              )
                            }
                          />
                          <Typography variant="body2" color="textSecondary">
                            Escopo
                          </Typography>
                          <ButtonGroup
                            options={[
                              { label: 'Individual', value: 'SELF' },
                              { label: 'Equipe', value: 'TEAM' },
                              { label: 'Todos', value: 'ALL' },
                            ]}
                            value={permission.scope}
                            onChange={(value) =>
                              handleUpdatePermissionScope(
                                item.id,
                                value as Permission['scope'],
                              )
                            }
                          />
                        </Box>
                      </Collapse>
                    )}
                  </Box>
                );
              })}
            </>
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
              loading={loading}
              fullWidth
            >
              Cancelar
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={handleRole}
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

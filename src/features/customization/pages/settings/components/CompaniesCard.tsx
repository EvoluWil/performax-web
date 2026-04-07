'use client';

import {
  AddOutlined,
  BusinessOutlined,
  LinkOffOutlined,
  LinkOutlined,
} from '@mui/icons-material';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';

type OwnedCompany = {
  id: string;
  name: string;
  groupId?: string;
};

type CompaniesCardProps = {
  ownedCompanies: OwnedCompany[];
  currentCompanyId: string;
  currentCompanyGroupId: string | undefined;
  onLink: (targetId: string) => void;
  onUnlink: (targetId: string) => void;
  linkLoading: boolean;
  unlinkLoading: boolean;
  // dialog
  open: boolean;
  onOpenDialog: () => void;
  onCloseDialog: () => void;
  newCompanyName: string;
  onNewCompanyNameChange: (name: string) => void;
  onCreateCompany: () => void;
  createLoading: boolean;
};

export function CompaniesCard({
  ownedCompanies,
  currentCompanyId,
  currentCompanyGroupId,
  onLink,
  onUnlink,
  linkLoading,
  unlinkLoading,
  open,
  onOpenDialog,
  onCloseDialog,
  newCompanyName,
  onNewCompanyNameChange,
  onCreateCompany,
  createLoading,
}: CompaniesCardProps) {
  return (
    <>
      <Card variant="outlined">
        <CardContent>
          <Box
            display="flex"
            alignItems="center"
            justifyContent="space-between"
            mb={1}
          >
            <Box>
              <Typography variant="h6" color="primary">
                Empresas
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Vincule empresas de sua propriedade para compartilhar dados em
                grupo
              </Typography>
            </Box>
            <Button
              variant="contained"
              size="small"
              startIcon={<AddOutlined />}
              onClick={onOpenDialog}
            >
              Nova empresa
            </Button>
          </Box>
          <Divider sx={{ mb: 1 }} />
          {ownedCompanies.length === 0 ? (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ py: 2, textAlign: 'center' }}
            >
              Nenhuma empresa encontrada
            </Typography>
          ) : (
            <List disablePadding>
              {ownedCompanies.map((c, i) => {
                const isCurrent = c.id === currentCompanyId;
                const isLinked =
                  !isCurrent &&
                  !!currentCompanyGroupId &&
                  c.groupId === currentCompanyGroupId;

                return (
                  <ListItem
                    key={c.id}
                    divider={i < ownedCompanies.length - 1}
                    disableGutters
                    secondaryAction={
                      !isCurrent ? (
                        isLinked ? (
                          <Tooltip title="Desvincular empresa">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => onUnlink(c.id)}
                              disabled={unlinkLoading}
                            >
                              <LinkOffOutlined fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        ) : (
                          <Tooltip title="Vincular ao grupo desta empresa">
                            <IconButton
                              size="small"
                              color="primary"
                              onClick={() => onLink(c.id)}
                              disabled={linkLoading}
                            >
                              <LinkOutlined fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )
                      ) : undefined
                    }
                  >
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      <BusinessOutlined fontSize="small" color="action" />
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Box display="flex" alignItems="center" gap={1}>
                          {c.name}
                          {isCurrent && (
                            <Chip
                              label="Empresa atual"
                              size="small"
                              color="primary"
                              variant="outlined"
                            />
                          )}
                          {isLinked && (
                            <Chip
                              label="Vinculada"
                              size="small"
                              color="success"
                              variant="outlined"
                            />
                          )}
                        </Box>
                      }
                    />
                  </ListItem>
                );
              })}
            </List>
          )}
        </CardContent>
      </Card>

      <Dialog open={open} onClose={onCloseDialog} maxWidth="xs" fullWidth>
        <DialogTitle>Nova empresa</DialogTitle>
        <DialogContent>
          <Box pt={1}>
            <TextField
              label="Nome da empresa"
              value={newCompanyName}
              onChange={(e) => onNewCompanyNameChange(e.target.value)}
              fullWidth
              autoFocus
              placeholder="Digite o nome da nova empresa"
              onKeyDown={(e) => {
                if (e.key === 'Enter') onCreateCompany();
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onCloseDialog} color="inherit">
            Cancelar
          </Button>
          <Button
            onClick={onCreateCompany}
            variant="contained"
            loading={createLoading}
            disabled={!newCompanyName.trim()}
          >
            Criar
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

import { BaseDrawer } from "@/components/drawer";
import { SelectInput } from "@/components/inputs";
import { formatCnpj } from "@/utils/cnpj";
import {
  Box,
  Button,
  List,
  ListItem,
  ListItemText,
  Typography,
} from "@mui/material";
import {
  UserClientsDrawerProps,
  useUserClientsDrawer,
} from "./user-clients-drawer.hook";

export type { UserClientsDrawerProps };

export const UserClientsDrawer: React.FC<UserClientsDrawerProps> = (props) => {
  const {
    control,
    handleAssignClients,
    loading,
    handleClose,
    open,
    availableClients,
    selectedClients,
  } = useUserClientsDrawer(props);

  const selectOptions = availableClients.map((client) => ({
    value: client.id,
    label: client.name,
  }));

  return (
    <BaseDrawer
      open={open}
      setOpen={handleClose}
      height="auto"
      title="Gerenciar Clientes"
      content={
        <Box
          gap={2}
          component="form"
          display="flex"
          alignItems="stretch"
          justifyContent="center"
          flexDirection="column"
          flex={1}
          maxWidth={316}
        >
          <SelectInput
            name="clientIds"
            label="Selecionar Clientes"
            control={control}
            multiple
            options={selectOptions}
            placeholder="Selecione os clientes..."
          />

          {selectedClients.length > 0 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Clientes Selecionados:
              </Typography>
              <List dense>
                {selectedClients.map((client) => (
                  <ListItem
                    key={client.id}
                    sx={{
                      border: 1,
                      borderColor: "divider",
                      borderRadius: 1,
                      mb: 1,
                      backgroundColor: "background.paper",
                    }}
                  >
                    <ListItemText
                      primary={client.name}
                      secondary={`CNPJ: ${formatCnpj(client.cnpj)}`}
                    />
                  </ListItem>
                ))}
              </List>
            </Box>
          )}

          {selectedClients.length === 0 && (
            <Box
              sx={{
                textAlign: "center",
                py: 4,
                color: "text.secondary",
              }}
            >
              <Typography variant="body2">
                Nenhum cliente selecionado.
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
              onClick={handleAssignClients}
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

import { BaseDrawer } from "@/components/drawer";
import { Switch, TextInput } from "@/components/inputs";
import { Box, Button } from "@mui/material";
import { BudgetType } from "../../types/budget-type";
import { useBudgetTypeDrawer } from "./budget-type.hook";

export type BudgetTypeDrawerProps = {
  open: boolean;
  onClose: () => void;
  budgetType: BudgetType | null;
};

export const BudgetTypeDrawer: React.FC<BudgetTypeDrawerProps> = (props) => {
  const { control, handleBudgetType, loading, handleClose, open, editing } =
    useBudgetTypeDrawer(props);

  return (
    <BaseDrawer
      open={open}
      setOpen={handleClose}
      height="auto"
      title={editing ? "Editar Tipo de Orçamento" : "Novo Tipo de Orçamento"}
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
            label="Nome do tipo de orçamento"
            name="name"
            control={control}
          />
          <Switch
            label="Necessita aprovação?"
            name="needApprove"
            control={control}
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
              onClick={handleBudgetType}
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

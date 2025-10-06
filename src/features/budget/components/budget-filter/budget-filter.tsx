import {
  ButtonGroup,
  DateInput,
  SelectInput,
  TextInput,
} from "@/components/inputs";
import { Box, Button, Divider, Paper, Typography } from "@mui/material";
import React from "react";
import { BudgetFilterDto } from "../../schemas/budget-filter.schema";
import { useBudgetFilter } from "./budget-filter.hook";

type BudgetFilterProps = {
  open: boolean;
  onFilter: (data: BudgetFilterDto) => void;
  loading?: boolean;
};

export const BudgetFilter: React.FC<BudgetFilterProps> = ({
  open,
  onFilter,
  loading = false,
}) => {
  const {
    control,
    hasUserFilter,
    handleFilter,
    options,
    handleUpdateStatuses,
    statusFilters,
  } = useBudgetFilter(onFilter);

  return (
    <Box>
      <Box my={2} display="flex" alignItems="center" gap={2}>
        <ButtonGroup
          options={[
            { label: "Pendentes", value: "PENDING" },
            { label: "Financeiros", value: "FINANCIAL" },
            { label: "Concluídos", value: "COMPLETED" },
          ]}
          multiple
          value={statusFilters}
          onChange={(value) => handleUpdateStatuses(value as string[])}
        />
      </Box>
      {open && (
        <Paper variant="outlined" sx={{ p: 2, overflowX: "auto", my: 2 }}>
          <Typography variant="h6" fontWeight={600} gutterBottom>
            Filtros para orçamentos
          </Typography>
          <Divider sx={{ mb: 2 }} />

          <Box
            display="flex"
            flexWrap="wrap"
            gap={2}
            justifyContent="space-between"
          >
            <Box
              display="flex"
              flexDirection="column"
              gap={2}
              sx={{ minWidth: 320, flex: 1 }}
            >
              <TextInput
                name="protocol"
                control={control}
                label="Protocolo do orçamento"
                placeholder="Digite parte do protocolo do orçamento"
              />
              <SelectInput
                name="typeId"
                control={control}
                label="Tipo de orçamento"
                options={options.types}
              />
            </Box>

            <Box
              display="flex"
              flexDirection="column"
              gap={2}
              sx={{ minWidth: 320, flex: 1 }}
            >
              <DateInput
                label="Data mínima"
                control={control}
                name="startDate"
              />
              <DateInput label="Data máxima" control={control} name="endDate" />
            </Box>

            <Box
              display="flex"
              flexDirection="column"
              gap={2}
              sx={{ minWidth: 320, flex: 1 }}
            >
              <SelectInput
                name="clientId"
                control={control}
                label="Cliente"
                options={options.clients}
              />
              {hasUserFilter && (
                <SelectInput
                  name="userId"
                  control={control}
                  label="Responsável"
                  options={options.users}
                />
              )}
            </Box>
          </Box>

          <Box display="flex" justifyContent="flex-end">
            <Button
              variant="outlined"
              sx={{ width: 144, mt: 3, mb: 2 }}
              onClick={handleFilter}
              disabled={loading}
            >
              Filtrar
            </Button>
          </Box>
        </Paper>
      )}
    </Box>
  );
};

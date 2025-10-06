"use client";

import { FieldRow } from "@/components/common";
import { formatDate } from "@/utils/date";
import {
  AssignmentLateOutlined,
  CalendarTodayOutlined,
  PersonOutlined,
} from "@mui/icons-material";
import { Box, Chip, Divider, Paper, Stack, Typography } from "@mui/material";
import { Budget, budgetStatusLabels } from "../../types/budget";

type Props = {
  budget: Budget;
};

export const BudgetDetailCard: React.FC<Props> = ({ budget }) => {
  const { label, color } =
    budgetStatusLabels[budget.status] ||
    ({ label: budget.status, color: "default" } as any);

  const items = budget.items || [];

  const formatCurrency = (n?: number) =>
    (n ?? 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  return (
    <Box>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "2fr 1fr" },
          gap: 3,
        }}
      >
        {/* Left column */}
        <Box>
          <Box>
            <Typography variant="h5" component="h2">
              {budget.title}
            </Typography>
            <Typography variant="subtitle2" color="text.secondary">
              Protocolo: {budget.protocol}
            </Typography>
          </Box>

          <Divider sx={{ my: 2 }} />

          <Typography variant="subtitle1" sx={{ mb: 1 }}>
            Descrição
          </Typography>
          <Typography px={2} variant="body1" sx={{ whiteSpace: "pre-wrap" }}>
            {budget.description || "-"}
          </Typography>

          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle1" sx={{ mb: 1 }}>
              Itens
            </Typography>

            <Paper variant="outlined" sx={{ p: 2 }}>
              {items.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  Nenhum item adicionado
                </Typography>
              ) : (
                <>
                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: {
                        xs: "1fr",
                        sm: "2fr 1fr 1fr 1fr",
                      },
                      gap: 1,
                      px: 1,
                      pb: 1,
                      borderBottom: (t) => `1px solid ${t.palette.divider}`,
                      fontWeight: 500,
                      color: "text.secondary",
                    }}
                  >
                    <Box>Descrição</Box>
                    <Box>Qtde</Box>
                    <Box>Valor unit.</Box>
                    <Box>Subtotal</Box>
                  </Box>

                  <Stack spacing={1} sx={{ mt: 1 }}>
                    {items.map((it, idx) => {
                      const qty = it.quantity ?? 0;
                      const unit = it.value ?? 0;
                      const subtotal = qty * unit;
                      return (
                        <Box
                          key={`item-${idx}`}
                          sx={{
                            display: "grid",
                            gridTemplateColumns: {
                              xs: "1fr",
                              sm: "2fr 1fr 1fr 1fr",
                            },
                            gap: 1,
                            px: 1,
                          }}
                        >
                          <Box>{it.label}</Box>
                          <Box>{qty}</Box>
                          <Box>{formatCurrency(unit)}</Box>
                          <Box>{formatCurrency(subtotal)}</Box>
                        </Box>
                      );
                    })}
                  </Stack>

                  <Divider sx={{ my: 2 }} />
                  <Box
                    display="flex"
                    justifyContent={{ xs: "flex-start", sm: "flex-end" }}
                  >
                    <Box sx={{ minWidth: 240 }}>
                      <Box display="flex" justifyContent="space-between" px={1}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Total
                        </Typography>
                        <Typography variant="subtitle1" fontWeight={600}>
                          {formatCurrency(budget.value)}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                </>
              )}
            </Paper>
          </Box>

          {budget.observation && (
            <Box sx={{ mt: 3 }}>
              <Typography variant="subtitle1" sx={{ mb: 1 }}>
                Observação
              </Typography>
              <Box px={2}>
                <FieldRow
                  props={{ flexDirection: "column" }}
                  label="Observação:"
                  value={budget.observation}
                />
              </Box>
            </Box>
          )}
        </Box>

        {/* Right column */}
        <Box>
          <Paper variant="outlined" sx={{ p: 2, bgcolor: "background.paper" }}>
            <Stack spacing={1}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <AssignmentLateOutlined color="action" />
                <Typography variant="subtitle2">Detalhes</Typography>
              </Box>

              <FieldRow
                label="Status:"
                value={
                  <Chip
                    label={label}
                    size="small"
                    variant="outlined"
                    sx={{ color, borderColor: color as any }}
                  />
                }
              />
              <FieldRow label="Protocolo:" value={budget.protocol} />
              <FieldRow
                label="Tipo:"
                value={budget.type?.name ?? budget.typeId}
              />
              <FieldRow
                label="Valor total:"
                value={formatCurrency(budget.value)}
              />
              <Divider />

              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <PersonOutlined color="action" />
                <Typography variant="subtitle2">Envolvidos</Typography>
              </Box>
              <FieldRow
                label="Cliente:"
                value={budget.client?.name ?? budget.clientId}
              />
              <FieldRow
                label="Responsável:"
                value={budget.responsible?.name ?? budget.responsibleId}
              />
              <FieldRow
                label="Criado por:"
                value={budget.createdBy?.name ?? budget.createdById}
              />

              <Divider />

              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <CalendarTodayOutlined color="action" />
                <Typography variant="subtitle2">Datas</Typography>
              </Box>
              <FieldRow
                label="Criado em:"
                value={formatDate(budget.createdAt)}
              />
              <FieldRow
                label="Atualizado em:"
                value={formatDate(budget.updatedAt)}
              />
            </Stack>
          </Paper>
        </Box>
      </Box>
    </Box>
  );
};

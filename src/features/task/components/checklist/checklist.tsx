import {
  ChecklistItemDto,
  ChecklistDto as ProjectChecklistDto,
} from "@/features/task/types";
import DoneIcon from "@mui/icons-material/Done";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CircularProgress from "@mui/material/CircularProgress";
import Divider from "@mui/material/Divider";
import FormControl from "@mui/material/FormControl";
import IconButton from "@mui/material/IconButton";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import React from "react";
import { useChecklist } from "./checklist.hook";

export interface ChecklistProps {
  checklist?: ProjectChecklistDto | null;
  readOnly?: boolean;
  onSubmitItem: (item: ChecklistItemDto, checklistId: string) => Promise<void>;
}

export const Checklist: React.FC<ChecklistProps> = ({
  checklist,
  readOnly = false,
  onSubmitItem,
}) => {
  const {
    local,
    updateItem,
    isFilled,
    isItemChanged,
    isSubmittingItem,
    submitItem,
  } = useChecklist({ checklist, onSubmitItem });

  if (!local || !Array.isArray(local.modules) || local.modules.length === 0) {
    return <Typography variant="body2">Sem checklist</Typography>;
  }

  return (
    <Stack spacing={2}>
      {local.modules.map((mod: any, modIndex: number) => (
        <Card
          key={(mod as any).id ?? mod.name ?? `module-${modIndex}`}
          variant="outlined"
          sx={{ bgcolor: "background.paper" }}
        >
          <CardContent>
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
            >
              <Typography variant="subtitle1" fontWeight={600}>
                {mod.name}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {(mod.items || []).length} itens
              </Typography>
            </Box>

            <Divider sx={{ my: 1 }} />

            <Stack spacing={1}>
              {(mod.items || []).map((it: any, itemIndex: number) => {
                const filled = isFilled(it);
                return (
                  <Box
                    key={(it as any).id ?? it.question ?? `item-${itemIndex}`}
                    sx={{
                      display: "flex",
                      flexDirection: { xs: "column", md: "row" },
                      gap: 2,
                      alignItems: { xs: "flex-start", md: "center" },
                      border: filled ? "1px solid" : "1px dashed",
                      borderColor: filled ? "success.main" : "divider",
                      borderRadius: 1,
                      p: 1,
                    }}
                  >
                    <Box
                      sx={{
                        flex: 1,
                        display: "flex",
                        flexDirection: { xs: "column", md: "row" },
                        alignItems: { xs: "flex-start", md: "center" },
                        justifyContent: "space-between",
                        width: "100%",
                      }}
                    >
                      <Box sx={{ pr: { md: 2 }, minWidth: 0 }}>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {it.question}
                        </Typography>
                      </Box>

                      <Box
                        sx={{
                          mt: { xs: 1, md: 0 },
                          minWidth: { md: 160 },
                          display: "flex",
                          alignItems: "center",
                        }}
                      >
                        {(it.expectedType || "").toString().toUpperCase() ===
                          "BOOLEAN" && (
                          <FormControl size="small" sx={{ minWidth: 160 }}>
                            <InputLabel
                              id={`boolean-label-${modIndex}-${itemIndex}`}
                            >
                              Resposta
                            </InputLabel>
                            <Select
                              labelId={`boolean-label-${modIndex}-${itemIndex}`}
                              value={
                                it.valueBoolean === null ||
                                it.valueBoolean === undefined
                                  ? ""
                                  : String(it.valueBoolean)
                              }
                              label="Resposta"
                              onChange={(e) => {
                                const val =
                                  e.target.value === ""
                                    ? null
                                    : e.target.value === "true";
                                updateItem(modIndex, itemIndex, {
                                  valueBoolean: val,
                                });
                              }}
                              disabled={readOnly}
                            >
                              <MenuItem value="">Sem resposta</MenuItem>
                              <MenuItem value={"true"}>Sim</MenuItem>
                              <MenuItem value={"false"}>Não</MenuItem>
                            </Select>
                          </FormControl>
                        )}

                        {(it.expectedType || "").toString().toUpperCase() ===
                          "NUMBER" && (
                          <TextField
                            size="small"
                            type="number"
                            value={it.valueNumber ?? ""}
                            onChange={(e) =>
                              updateItem(modIndex, itemIndex, {
                                valueNumber:
                                  e.target.value === ""
                                    ? null
                                    : Number(e.target.value),
                              })
                            }
                            disabled={readOnly}
                          />
                        )}

                        {(it.expectedType || "").toString().toUpperCase() ===
                          "TEXT" && (
                          <TextField
                            size="small"
                            multiline
                            minRows={3}
                            value={it.valueText ?? ""}
                            onChange={(e) =>
                              updateItem(modIndex, itemIndex, {
                                valueText: e.target.value,
                              })
                            }
                            disabled={readOnly}
                            fullWidth
                          />
                        )}

                        {!["BOOLEAN", "NUMBER", "TEXT"].includes(
                          ((it.expectedType || "") as string).toUpperCase()
                        ) && (
                          <TextField
                            size="small"
                            value={it.valueText ?? ""}
                            onChange={(e) =>
                              updateItem(modIndex, itemIndex, {
                                valueText: e.target.value,
                              })
                            }
                            disabled={readOnly}
                            fullWidth
                          />
                        )}

                        {filled && (
                          <Tooltip title="Respondido">
                            <IconButton
                              size="small"
                              sx={{ color: "success.main", ml: 1 }}
                            >
                              <DoneIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                        {!readOnly && isItemChanged(modIndex, itemIndex) && (
                          <Box sx={{ ml: 1 }}>
                            <Button
                              size="small"
                              variant="outlined"
                              onClick={() => submitItem(modIndex, itemIndex)}
                              disabled={isSubmittingItem(modIndex, itemIndex)}
                              startIcon={
                                isSubmittingItem(modIndex, itemIndex) ? (
                                  <CircularProgress size={14} />
                                ) : undefined
                              }
                            >
                              {isSubmittingItem(modIndex, itemIndex)
                                ? "Enviando"
                                : "Salvar"}
                            </Button>
                          </Box>
                        )}
                      </Box>
                    </Box>
                  </Box>
                );
              })}
            </Stack>
          </CardContent>
        </Card>
      ))}
    </Stack>
  );
};

'use client';

import {
  CloseButtonStyled,
  ModalContainer,
  ModalStyled,
} from '@/components/modal/modal-base.styles';
import {
  CheckCircleOutline,
  CloseOutlined,
  CloudUploadOutlined,
  DownloadOutlined,
  ErrorOutline,
  RefreshOutlined,
} from '@mui/icons-material';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  FormControl,
  LinearProgress,
  MenuItem,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import { useCsvImport } from './csv-import.hook';
import type { CsvImportModalProps, CsvReferenceConfig, ImportRow } from './csv-import.types';

const CELL_ALIGN = { verticalAlign: 'top' as const, py: 1.25 };
const FIELD_MIN_WIDTH = 140;
const REF_MIN_WIDTH = 170;
const ERROR_MIN_WIDTH = 180;

function StatusChip({
  status,
}: {
  status: ImportRow<Record<string, unknown>>['status'];
}) {
  const config: Record<
    ImportRow<Record<string, unknown>>['status'],
    {
      label: string;
      color: 'default' | 'success' | 'error' | 'warning' | 'info';
    }
  > = {
    pending: { label: 'Pendente', color: 'default' },
    processing: { label: 'Processando', color: 'info' },
    success: { label: 'Sucesso', color: 'success' },
    error: { label: 'Erro', color: 'error' },
    validation_error: { label: 'Inválido', color: 'warning' },
  };

  const { label, color } = config[status];
  return <Chip size="small" label={label} color={color} variant="outlined" />;
}

function ReferenceCell({
  row,
  refConfig,
  options,
  showSelect,
  disabled,
  onSelect,
}: {
  row: ImportRow<Record<string, unknown>>;
  refConfig: CsvReferenceConfig;
  options: { value: string; label: string }[];
  showSelect: boolean;
  disabled: boolean;
  onSelect: (value: string) => void;
}) {
  const csvValue = String(row.data[refConfig.csvKey] ?? '');
  const selectedId = row.resolvedIds?.[refConfig.targetKey] ?? '';
  const isUnresolved = row.unresolvedRefs?.includes(refConfig.csvKey);

  if (showSelect) {
    return (
      <FormControl
        size="small"
        fullWidth
        error={isUnresolved}
        sx={{ minWidth: REF_MIN_WIDTH }}
      >
        <Select
          value={selectedId}
          displayEmpty
          disabled={disabled}
          onChange={(e) => onSelect(e.target.value)}
          sx={{ minWidth: REF_MIN_WIDTH }}
        >
          <MenuItem value="">
            <em>{isUnresolved ? 'Selecionar...' : 'Nenhum'}</em>
          </MenuItem>
          {options.map((opt) => (
            <MenuItem key={opt.value} value={opt.value}>
              {opt.label}
            </MenuItem>
          ))}
        </Select>
        {csvValue && (
          <Typography
            variant="caption"
            color="text.secondary"
            display="block"
            mt={0.5}
            lineHeight={1.2}
          >
            CSV: {csvValue}
          </Typography>
        )}
      </FormControl>
    );
  }

  const label =
    options.find((opt) => opt.value === selectedId)?.label || csvValue || '-';

  return (
    <Box>
      <Typography variant="body2">{label}</Typography>
      {isUnresolved && (
        <Typography variant="caption" color="error">
          Não encontrado
        </Typography>
      )}
    </Box>
  );
}

export function CsvImportModal<
  TImport extends Record<string, unknown>,
  TPayload = TImport,
>(props: CsvImportModalProps<TImport, TPayload>) {
  const { open, config } = props;
  const {
    step,
    rows,
    parseError,
    processing,
    resourcesLoading,
    resourceOptions,
    references,
    stats,
    canStartImport,
    handleClose,
    handleDownloadTemplate,
    handleFileSelect,
    updateRowData,
    updateReferenceSelection,
    handleStartImport,
    handleRetryRow,
    handleRetryAllErrors,
    setStep,
  } = useCsvImport(props);

  const isEditable = step === 'results' || step === 'preview';
  const showErrors = step === 'preview' || step === 'results';
  const showReferenceSelect = step === 'preview' || step === 'results';

  const progress =
    stats.total > 0
      ? Math.round(((stats.success + stats.error) / stats.total) * 100)
      : 0;

  const getReferenceForColumn = (key: string) =>
    references.find((ref) => ref.csvKey === key);

  const body = (
    <ModalContainer
      onSubmit={(e) => e.preventDefault()}
      sx={{ minWidth: { xs: '90vw', md: '70vw' } }}
    >
      <CloseButtonStyled onClick={handleClose} disabled={processing}>
        <CloseOutlined />
      </CloseButtonStyled>

      <Typography variant="h6" component="h2">
        Importar {config.entityLabel} via CSV
      </Typography>

      {step === 'upload' && (
        <>
          <Typography variant="body2" color="text.secondary">
            Baixe o modelo CSV, preencha os dados e faça o upload do arquivo.
            {references.length > 0 &&
              ' Use nomes para referências (ex: Cliente, Banco) — o sistema tentará encontrar o cadastro automaticamente.'}
          </Typography>

          <Box display="flex" gap={2} flexWrap="wrap" alignItems="center">
            <Button
              variant="outlined"
              startIcon={<DownloadOutlined />}
              onClick={handleDownloadTemplate}
              disabled={resourcesLoading}
            >
              Baixar modelo CSV
            </Button>
            <Button
              variant="contained"
              component="label"
              startIcon={
                resourcesLoading ? (
                  <CircularProgress size={16} color="inherit" />
                ) : (
                  <CloudUploadOutlined />
                )
              }
              disabled={resourcesLoading}
            >
              Selecionar arquivo
              <input
                type="file"
                hidden
                accept=".csv,text/csv"
                onChange={({ target }) => {
                  const file = target.files?.[0];
                  if (file) handleFileSelect(file);
                  if (target) target.value = '';
                }}
              />
            </Button>
          </Box>

          {parseError && <Alert severity="error">{parseError}</Alert>}

          <Divider />

          <Typography variant="subtitle2">Colunas esperadas</Typography>
          <Box display="flex" gap={1} flexWrap="wrap">
            {config.columns.map((col) => (
              <Chip
                key={col.key}
                label={`${col.header}${col.required ? ' *' : ''}`}
                size="small"
              />
            ))}
          </Box>
        </>
      )}

      {(step === 'preview' || step === 'processing' || step === 'results') && (
        <>
          <Box display="flex" gap={1} flexWrap="wrap" alignItems="center">
            <Chip
              icon={<CheckCircleOutline />}
              label={`${stats.success} sucesso`}
              color="success"
              variant="outlined"
              size="small"
            />
            <Chip
              icon={<ErrorOutline />}
              label={`${stats.error} erro(s)`}
              color="error"
              variant="outlined"
              size="small"
            />
            {stats.unresolvedRequired > 0 && (
              <Chip
                label={`${stats.unresolvedRequired} referência(s) pendente(s)`}
                color="warning"
                variant="outlined"
                size="small"
              />
            )}
            <Chip label={`${stats.total} total`} size="small" />
          </Box>

          {step === 'processing' && (
            <Box width="100%">
              <LinearProgress variant="determinate" value={progress} />
              <Typography variant="caption" color="text.secondary" mt={0.5}>
                Processando cadastros em fila... {progress}%
              </Typography>
            </Box>
          )}

          <TableContainer sx={{ maxHeight: 420, overflow: 'auto' }}>
            <Table size="small" stickyHeader sx={{ tableLayout: 'auto' }}>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ ...CELL_ALIGN, minWidth: 56 }}>Linha</TableCell>
                  <TableCell sx={{ ...CELL_ALIGN, minWidth: 96 }}>Status</TableCell>
                  {config.columns.map((col) => {
                    const isRef = !!getReferenceForColumn(col.key);
                    return (
                      <TableCell
                        key={col.key}
                        sx={{
                          ...CELL_ALIGN,
                          minWidth: isRef ? REF_MIN_WIDTH : FIELD_MIN_WIDTH,
                        }}
                      >
                        {col.header}
                      </TableCell>
                    );
                  })}
                  {showErrors && (
                    <TableCell sx={{ ...CELL_ALIGN, minWidth: ERROR_MIN_WIDTH }}>
                      Erro
                    </TableCell>
                  )}
                  {step === 'results' && (
                    <TableCell sx={{ ...CELL_ALIGN, minWidth: 140 }}>Ações</TableCell>
                  )}
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((row) => {
                  const hasError =
                    row.status === 'error' ||
                    row.status === 'validation_error';
                  const canEditText =
                    isEditable && hasError && row.status !== 'processing';
                  const canEditRef = showReferenceSelect && !processing;

                  return (
                    <TableRow key={row.id} hover>
                      <TableCell sx={{ ...CELL_ALIGN, minWidth: 56 }}>
                        {row.lineNumber}
                      </TableCell>
                      <TableCell sx={{ ...CELL_ALIGN, minWidth: 96 }}>
                        <StatusChip status={row.status} />
                      </TableCell>
                      {config.columns.map((col) => {
                        const refConfig = getReferenceForColumn(col.key);
                        const cellSx = {
                          ...CELL_ALIGN,
                          minWidth: refConfig ? REF_MIN_WIDTH : FIELD_MIN_WIDTH,
                        };

                        if (refConfig) {
                          return (
                            <TableCell key={col.key} sx={cellSx}>
                              <ReferenceCell
                                row={row as ImportRow<Record<string, unknown>>}
                                refConfig={refConfig}
                                options={
                                  resourceOptions[refConfig.resourceKey] ?? []
                                }
                                showSelect={canEditRef}
                                disabled={processing}
                                onSelect={(value) =>
                                  updateReferenceSelection(
                                    row.id,
                                    refConfig,
                                    value,
                                  )
                                }
                              />
                            </TableCell>
                          );
                        }

                        return (
                          <TableCell key={col.key} sx={cellSx}>
                            {canEditText ? (
                              <TextField
                                size="small"
                                fullWidth
                                value={String(row.data[col.key] ?? '')}
                                onChange={(e) =>
                                  updateRowData(row.id, col.key, e.target.value)
                                }
                                disabled={processing}
                                sx={{ minWidth: FIELD_MIN_WIDTH }}
                              />
                            ) : (
                              <Typography variant="body2" lineHeight={1.4}>
                                {String(row.data[col.key] ?? '')}
                              </Typography>
                            )}
                          </TableCell>
                        );
                      })}
                      {showErrors && (
                        <TableCell sx={{ ...CELL_ALIGN, minWidth: ERROR_MIN_WIDTH }}>
                          {row.error && (
                            <Typography variant="caption" color="error">
                              {row.error}
                            </Typography>
                          )}
                        </TableCell>
                      )}
                      {step === 'results' && (
                        <TableCell sx={{ ...CELL_ALIGN, minWidth: 140 }}>
                          {hasError && (
                            <Button
                              size="small"
                              startIcon={
                                processing ? (
                                  <CircularProgress size={14} />
                                ) : (
                                  <RefreshOutlined />
                                )
                              }
                              onClick={() => handleRetryRow(row.id)}
                              disabled={processing}
                            >
                              Tentar novamente
                            </Button>
                          )}
                        </TableCell>
                      )}
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}

      <Divider />

      <Box display="flex" gap={2} justifyContent="flex-end" flexWrap="wrap">
        {step === 'preview' && (
          <>
            <Button onClick={() => setStep('upload')} disabled={processing}>
              Voltar
            </Button>
            <Button
              variant="contained"
              onClick={handleStartImport}
              disabled={!canStartImport || processing}
            >
              Importar {Math.max(
                0,
                stats.total - stats.validationError - stats.unresolvedRequired,
              )}{' '}
              registro(s)
            </Button>
          </>
        )}

        {step === 'results' && stats.error > 0 && (
          <Button
            variant="outlined"
            startIcon={<RefreshOutlined />}
            onClick={handleRetryAllErrors}
            disabled={processing}
          >
            Tentar novamente todos com erro
          </Button>
        )}

        {(step === 'results' || step === 'processing') && (
          <Button
            variant="contained"
            onClick={handleClose}
            disabled={processing}
          >
            {stats.error === 0 ? 'Concluir' : 'Fechar'}
          </Button>
        )}
      </Box>
    </ModalContainer>
  );

  return (
    <ModalStyled open={open} onClose={processing ? undefined : handleClose}>
      {open ? body : <></>}
    </ModalStyled>
  );
}

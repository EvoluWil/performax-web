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
  LinearProgress,
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
import type { CsvImportModalProps, ImportRow } from './csv-import.types';

function StatusChip({ status }: { status: ImportRow<Record<string, unknown>>['status'] }) {
  const config: Record<
    ImportRow<Record<string, unknown>>['status'],
    { label: string; color: 'default' | 'success' | 'error' | 'warning' | 'info' }
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

export function CsvImportModal<T extends Record<string, unknown>>(
  props: CsvImportModalProps<T>,
) {
  const { open, config } = props;
  const {
    step,
    rows,
    parseError,
    processing,
    stats,
    canStartImport,
    handleClose,
    handleDownloadTemplate,
    handleFileSelect,
    updateRowData,
    handleStartImport,
    handleRetryRow,
    handleRetryAllErrors,
    setStep,
  } = useCsvImport(props);

  const isEditable = step === 'results' || step === 'preview';
  const showErrors = step === 'preview' || step === 'results';

  const progress =
    stats.total > 0
      ? Math.round(
          ((stats.success + stats.error) / stats.total) * 100,
        )
      : 0;

  const body = (
    <ModalContainer
      onSubmit={(e) => e.preventDefault()}
      sx={{ minWidth: { xs: '90vw', md: '60vw' } }}
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
          </Typography>

          <Box display="flex" gap={2} flexWrap="wrap">
            <Button
              variant="outlined"
              startIcon={<DownloadOutlined />}
              onClick={handleDownloadTemplate}
            >
              Baixar modelo CSV
            </Button>
            <Button
              variant="contained"
              component="label"
              startIcon={<CloudUploadOutlined />}
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

          <TableContainer sx={{ maxHeight: 360 }}>
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>Linha</TableCell>
                  <TableCell>Status</TableCell>
                  {config.columns.map((col) => (
                    <TableCell key={col.key}>{col.header}</TableCell>
                  ))}
                  {showErrors && <TableCell>Erro</TableCell>}
                  {step === 'results' && <TableCell>Ações</TableCell>}
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((row) => {
                  const hasError =
                    row.status === 'error' || row.status === 'validation_error';
                  const canEdit =
                    isEditable && hasError && row.status !== 'processing';

                  return (
                    <TableRow key={row.id} hover>
                      <TableCell>{row.lineNumber}</TableCell>
                      <TableCell>
                        <StatusChip status={row.status} />
                      </TableCell>
                      {config.columns.map((col) => (
                        <TableCell key={col.key}>
                          {canEdit ? (
                            <TextField
                              size="small"
                              fullWidth
                              value={String(row.data[col.key] ?? '')}
                              onChange={(e) =>
                                updateRowData(row.id, col.key, e.target.value)
                              }
                              disabled={processing}
                            />
                          ) : (
                            String(row.data[col.key] ?? '')
                          )}
                        </TableCell>
                      ))}
                      {showErrors && (
                        <TableCell>
                          {row.error && (
                            <Typography variant="caption" color="error">
                              {row.error}
                            </Typography>
                          )}
                        </TableCell>
                      )}
                      {step === 'results' && (
                        <TableCell>
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
              Importar {stats.total - stats.validationError} registro(s)
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

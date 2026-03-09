'use client';

import {
  CloseOutlined,
  ContentCopyOutlined,
  DownloadOutlined,
  WhatsApp,
} from '@mui/icons-material';
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  Tooltip,
  Typography,
} from '@mui/material';
import { useState } from 'react';

export type PdfPreviewModalProps = {
  open: boolean;
  onClose: () => void;
  pdfBlobUrl: string | null;
  pdfStorageUrl: string | null;
  pdfUploading: boolean;
  title: string;
  onDownload: () => void;
};

export const PdfPreviewModal: React.FC<PdfPreviewModalProps> = ({
  open,
  onClose,
  pdfBlobUrl,
  pdfStorageUrl,
  pdfUploading,
  title,
  onDownload,
}) => {
  const [copied, setCopied] = useState(false);

  const shareUrl = pdfStorageUrl ?? null;

  const handleCopyLink = async () => {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const el = document.createElement('textarea');
      el.value = shareUrl;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleWhatsApp = () => {
    if (!shareUrl) return;
    const message = encodeURIComponent(
      `Olá! Segue o link para visualizar ${title}:\n${shareUrl}`,
    );
    window.open(`https://wa.me/?text=${message}`, '_blank');
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          height: '90vh',
          display: 'flex',
          flexDirection: 'column',
          borderRadius: 2,
        },
      }}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          py: 1.5,
          px: 2.5,
        }}
      >
        <Typography
          variant="subtitle1"
          component="span"
          fontWeight={700}
          noWrap
          sx={{ flex: 1, mr: 1 }}
        >
          {title}
        </Typography>
        <IconButton size="small" onClick={onClose}>
          <CloseOutlined fontSize="small" />
        </IconButton>
      </DialogTitle>

      <Divider />

      <DialogContent sx={{ flex: 1, p: 0, overflow: 'hidden' }}>
        {pdfBlobUrl ? (
          <iframe
            src={pdfBlobUrl}
            style={{ width: '100%', height: '100%', border: 'none' }}
            title={title}
          />
        ) : (
          <Box
            display="flex"
            alignItems="center"
            justifyContent="center"
            height="100%"
          >
            <Typography color="text.secondary">Gerando PDF...</Typography>
          </Box>
        )}
      </DialogContent>

      <Divider />

      <Box
        display="flex"
        alignItems="center"
        justifyContent="flex-end"
        gap={1.5}
        px={2.5}
        py={1.5}
        flexWrap="wrap"
      >
        <Button
          variant="outlined"
          startIcon={<DownloadOutlined />}
          onClick={onDownload}
          size="small"
        >
          Download
        </Button>

        {pdfUploading ? (
          <Box display="flex" alignItems="center" gap={1}>
            <CircularProgress size={16} />
            <Typography variant="caption" color="text.secondary">
              Preparando link...
            </Typography>
          </Box>
        ) : (
          <>
            <Tooltip
              title={
                shareUrl
                  ? copied
                    ? 'Link copiado!'
                    : 'Copiar link do PDF'
                  : 'Aguardando upload...'
              }
            >
              <span>
                <Button
                  variant="outlined"
                  startIcon={<ContentCopyOutlined />}
                  onClick={handleCopyLink}
                  size="small"
                  disabled={!shareUrl}
                  color={copied ? 'success' : 'inherit'}
                >
                  {copied ? 'Copiado!' : 'Copiar link'}
                </Button>
              </span>
            </Tooltip>

            <Tooltip
              title={
                shareUrl ? 'Compartilhar via WhatsApp' : 'Aguardando upload...'
              }
            >
              <span>
                <Button
                  variant="contained"
                  startIcon={<WhatsApp />}
                  onClick={handleWhatsApp}
                  size="small"
                  disabled={!shareUrl}
                  sx={{
                    backgroundColor: '#25D366',
                    '&:hover': { backgroundColor: '#1ebe5d' },
                    '&.Mui-disabled': {
                      backgroundColor: '#a5d6b0',
                      color: '#fff',
                    },
                  }}
                >
                  WhatsApp
                </Button>
              </span>
            </Tooltip>
          </>
        )}
      </Box>
    </Dialog>
  );
};

'use client';

import { ImageOutlined } from '@mui/icons-material';
import { Box, Typography } from '@mui/material';

type ImageUploadProps = {
  label: string;
  previewSrc: string | null;
  aspectRatio?: string;
  width?: number | string;
  height?: number | string;
  onChange: (file: File) => void;
};

export function ImageUpload({
  label,
  previewSrc,
  aspectRatio,
  width = '100%',
  height,
  onChange,
}: ImageUploadProps) {
  return (
    <Box>
      <Typography variant="body2" color="text.secondary" mb={0.5}>
        {label}
      </Typography>
      <Box
        component="label"
        sx={{
          display: 'block',
          width,
          height,
          aspectRatio,
          border: '2px dashed',
          borderColor: previewSrc ? 'primary.main' : 'divider',
          borderRadius: 2,
          overflow: 'hidden',
          position: 'relative',
          cursor: 'pointer',
          bgcolor: 'grey.50',
          '&:hover .upload-overlay': { opacity: 1 },
        }}
      >
        {previewSrc ? (
          <Box
            component="img"
            src={previewSrc}
            alt={label}
            sx={{
              width: '100%',
              height: '100%',
              objectFit: aspectRatio ? 'cover' : 'contain',
              display: 'block',
            }}
          />
        ) : (
          <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            height="100%"
            color="text.disabled"
            gap={0.5}
          >
            <ImageOutlined sx={{ fontSize: 32 }} />
            <Typography variant="caption" textAlign="center">
              {label}
            </Typography>
          </Box>
        )}
        <Box
          className="upload-overlay"
          sx={{
            position: 'absolute',
            inset: 0,
            bgcolor: 'rgba(0,0,0,0.55)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: 0,
            transition: 'opacity 0.2s',
          }}
        >
          <Typography variant="caption" color="white" fontWeight={600}>
            Alterar
          </Typography>
        </Box>
        <input
          type="file"
          hidden
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) onChange(file);
            e.target.value = '';
          }}
        />
      </Box>
    </Box>
  );
}

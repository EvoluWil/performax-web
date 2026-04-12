'use client';

import { TextInput } from '@/components/inputs';
import { CompanyWhiteLabel } from '@/types/company';
import {
  Box,
  Card,
  CardContent,
  Chip,
  Divider,
  Grid,
  Typography,
} from '@mui/material';
import { Control, useWatch } from 'react-hook-form';
import { CustomizationFormDto } from '../../../schemas/customization.schema';
import { ColorField } from './ColorField';
import { ImageUpload } from './ImageUpload';

type WhiteLabelCardProps = {
  control: Control<CustomizationFormDto>;
  whiteLabel: CompanyWhiteLabel | null | undefined;
  logoPreviewUrl: string | null;
  bannerPreviewUrl: string | null;
  faviconPreviewUrl: string | null;
  onLogoChange: (file: File) => void;
  onBannerChange: (file: File) => void;
  onFaviconChange: (file: File) => void;
};

export function WhiteLabelCard({
  control,
  whiteLabel,
  logoPreviewUrl,
  bannerPreviewUrl,
  faviconPreviewUrl,
  onLogoChange,
  onBannerChange,
  onFaviconChange,
}: WhiteLabelCardProps) {
  const logoUrl = useWatch({ control, name: 'logo' }) as string;
  const bannerUrl = useWatch({ control, name: 'banner' }) as string;
  const faviconUrl = useWatch({ control, name: 'favicon' }) as string;

  const logoPreviewSrc = logoPreviewUrl || logoUrl || null;
  const bannerPreviewSrc = bannerPreviewUrl || bannerUrl || null;
  const faviconPreviewSrc = faviconPreviewUrl || faviconUrl || null;

  return (
    <Card variant="outlined">
      <CardContent>
        <Box display="flex" alignItems="center" gap={1} mb={1}>
          <Typography variant="h6" color="primary">
            White Label
          </Typography>
          {whiteLabel && <Chip label="Ativo" color="success" size="small" />}
        </Box>
        <Divider sx={{ mb: 2 }} />
        <Box display="flex" flexDirection="column" gap={2}>
          <TextInput
            label="Nome exibido (white label)"
            name="wlName"
            control={control}
            placeholder="Nome personalizado da plataforma"
          />

          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 'auto' }}>
              <ImageUpload
                label="Logo"
                previewSrc={logoPreviewSrc}
                aspectRatio="1 / 1"
                height={160}
                onChange={onLogoChange}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 'auto' }}>
              <ImageUpload
                label="Favicon"
                previewSrc={faviconPreviewSrc}
                aspectRatio="1 / 1"
                height={160}
                accept=".ico"
                hint="Apenas arquivos .ico"
                onChange={onFaviconChange}
              />
            </Grid>
          </Grid>

          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 'grow' }}>
              <ImageUpload
                label="Banner (PDF)"
                previewSrc={bannerPreviewSrc}
                aspectRatio="700 / 140"
                onChange={onBannerChange}
              />
            </Grid>
          </Grid>

          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <ColorField
                label="Cor primária"
                name="primaryColor"
                control={control}
                defaultColor="#1976d2"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <ColorField
                label="Cor secundária"
                name="secondaryColor"
                control={control}
                defaultColor="#9c27b0"
              />
            </Grid>
          </Grid>
        </Box>
      </CardContent>
    </Card>
  );
}

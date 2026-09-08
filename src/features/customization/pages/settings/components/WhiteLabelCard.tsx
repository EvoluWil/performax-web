'use client';

import { TextInput } from '@/components/inputs';
import { CompanyWhiteLabel } from '@/types/company';
import { DEFAULT_WHITE_LABEL } from '@/utils/white-label.utils';
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
import { ResetDefaultButton } from './ResetDefaultButton';

type WhiteLabelField =
  | 'wlName'
  | 'logo'
  | 'banner'
  | 'favicon'
  | 'primaryColor'
  | 'secondaryColor';

type WhiteLabelCardProps = {
  control: Control<CustomizationFormDto>;
  whiteLabel: CompanyWhiteLabel | null | undefined;
  logoPreviewUrl: string | null;
  bannerPreviewUrl: string | null;
  faviconPreviewUrl: string | null;
  onLogoChange: (file: File) => void;
  onBannerChange: (file: File) => void;
  onFaviconChange: (file: File) => void;
  onResetField: (field: WhiteLabelField) => void;
};

function isSystemAsset(
  value: string | null | undefined,
  defaultUrl: string,
  pendingPreview: string | null,
) {
  return !pendingPreview && (value || '') === defaultUrl;
}

export function WhiteLabelCard({
  control,
  whiteLabel,
  logoPreviewUrl,
  bannerPreviewUrl,
  faviconPreviewUrl,
  onLogoChange,
  onBannerChange,
  onFaviconChange,
  onResetField,
}: WhiteLabelCardProps) {
  const wlName = useWatch({ control, name: 'wlName' }) as string;
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
          <Box>
            <Box
              display="flex"
              alignItems="center"
              justifyContent="space-between"
              gap={1}
            >
              <Typography variant="body2" color="text.secondary">
                Nome exibido (white label)
              </Typography>
              <ResetDefaultButton
                onClick={() => onResetField('wlName')}
                disabled={(wlName || '') === DEFAULT_WHITE_LABEL.name}
              />
            </Box>
            <TextInput
              name="wlName"
              control={control}
              placeholder={DEFAULT_WHITE_LABEL.name}
            />
          </Box>

          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 'auto' }}>
              <ImageUpload
                label="Logo"
                previewSrc={logoPreviewSrc}
                aspectRatio="1 / 1"
                height={160}
                onChange={onLogoChange}
                onReset={() => onResetField('logo')}
                isDefault={isSystemAsset(
                  logoUrl,
                  DEFAULT_WHITE_LABEL.logo,
                  logoPreviewUrl,
                )}
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
                onReset={() => onResetField('favicon')}
                isDefault={isSystemAsset(
                  faviconUrl,
                  DEFAULT_WHITE_LABEL.favicon,
                  faviconPreviewUrl,
                )}
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
                onReset={() => onResetField('banner')}
                isDefault={isSystemAsset(
                  bannerUrl,
                  DEFAULT_WHITE_LABEL.banner,
                  bannerPreviewUrl,
                )}
              />
            </Grid>
          </Grid>

          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <ColorField
                label="Cor primária"
                name="primaryColor"
                control={control}
                defaultColor={DEFAULT_WHITE_LABEL.primaryColor}
                onReset={() => onResetField('primaryColor')}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <ColorField
                label="Cor secundária"
                name="secondaryColor"
                control={control}
                defaultColor={DEFAULT_WHITE_LABEL.secondaryColor}
                onReset={() => onResetField('secondaryColor')}
              />
            </Grid>
          </Grid>
        </Box>
      </CardContent>
    </Card>
  );
}

'use client';

import { PageTitle } from '@/components/common';
import { TextInput } from '@/components/inputs';
import {
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  Grid,
  Typography,
} from '@mui/material';
import { CompaniesCard } from './components/CompaniesCard';
import { ModulesCard } from './components/ModulesCard';
import { WhiteLabelCard } from './components/WhiteLabelCard';
import { useCustomizationSettings } from './settings.hook';

export const CustomizationSettings: React.FC = () => {
  const {
    control,
    handleSave,
    loading,
    setLogoFile,
    setBannerFile,
    logoPreviewUrl,
    bannerPreviewUrl,
    whiteLabel,
    ownedCompanies,
    currentCompanyId,
    currentCompanyGroupId,
    openCreateCompany,
    setOpenCreateCompany,
    newCompanyName,
    setNewCompanyName,
    createLoading,
    handleCreateCompany,
    handleLinkCompany,
    handleUnlinkCompany,
    linkLoading,
    unlinkLoading,
    allModules,
    enabledModuleIds,
    handleToggleModule,
    toggleModuleLoading,
    hasWhiteLabelModule,
  } = useCustomizationSettings();

  return (
    <Box display="flex" flexDirection="column" gap={3}>
      <PageTitle
        title="Minha Empresa"
        subtitle="Configure as informações gerais da empresa e identidade visual"
        actions={[
          {
            key: 'save',
            node: (
              <Button
                variant="contained"
                color="primary"
                onClick={handleSave}
                loading={loading}
                sx={{ minWidth: 160 }}
              >
                Salvar configurações
              </Button>
            ),
          },
        ]}
      />

      <Grid container spacing={3}>
        {/* Company Settings */}
        <Grid size={{ xs: 12 }}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="h6" gutterBottom color="primary">
                Configurações da Empresa
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Box display="flex" flexDirection="column" gap={2}>
                <TextInput
                  label="Nome da empresa"
                  name="companyName"
                  control={control}
                  placeholder="Digite o nome da empresa"
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {hasWhiteLabelModule && (
          <Grid size={{ xs: 12 }}>
            <WhiteLabelCard
              control={control}
              whiteLabel={whiteLabel}
              logoPreviewUrl={logoPreviewUrl}
              bannerPreviewUrl={bannerPreviewUrl}
              onLogoChange={setLogoFile}
              onBannerChange={setBannerFile}
            />
          </Grid>
        )}

        <Grid size={{ xs: 12 }}>
          <ModulesCard
            allModules={allModules}
            enabledModuleIds={enabledModuleIds}
            onToggle={handleToggleModule}
            toggleLoading={toggleModuleLoading}
          />
        </Grid>

        <Grid size={{ xs: 12 }}>
          <CompaniesCard
            ownedCompanies={ownedCompanies}
            currentCompanyId={currentCompanyId}
            currentCompanyGroupId={currentCompanyGroupId}
            onLink={handleLinkCompany}
            onUnlink={handleUnlinkCompany}
            linkLoading={linkLoading}
            unlinkLoading={unlinkLoading}
            open={openCreateCompany}
            onOpenDialog={() => setOpenCreateCompany(true)}
            onCloseDialog={() => setOpenCreateCompany(false)}
            newCompanyName={newCompanyName}
            onNewCompanyNameChange={setNewCompanyName}
            onCreateCompany={handleCreateCompany}
            createLoading={createLoading}
          />
        </Grid>
      </Grid>
    </Box>
  );
};

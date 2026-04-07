'use client';

import { ExtensionOutlined } from '@mui/icons-material';
import {
  Box,
  Card,
  CardContent,
  Divider,
  FormControlLabel,
  Switch,
  Typography,
} from '@mui/material';

type Module = {
  id: string;
  name: string;
  description?: string;
};

type ModulesCardProps = {
  allModules: Module[];
  enabledModuleIds: Set<string>;
  onToggle: (moduleId: string) => void;
  toggleLoading: boolean;
};

export function ModulesCard({
  allModules,
  enabledModuleIds,
  onToggle,
  toggleLoading,
}: ModulesCardProps) {
  return (
    <Card variant="outlined">
      <CardContent>
        <Typography variant="h6" color="primary" gutterBottom>
          Módulos
        </Typography>
        <Typography variant="body2" color="text.secondary" mb={2}>
          Ative ou desative funcionalidades disponíveis para esta empresa
        </Typography>
        <Divider sx={{ mb: 2 }} />
        {allModules.length === 0 ? (
          <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            gap={1}
            py={3}
            color="text.secondary"
          >
            <ExtensionOutlined sx={{ fontSize: 40, opacity: 0.3 }} />
            <Typography variant="body2">Nenhum módulo disponível</Typography>
          </Box>
        ) : (
          <Box
            display="grid"
            gridTemplateColumns={{
              xs: '1fr',
              sm: 'repeat(2, 1fr)',
              md: 'repeat(3, 1fr)',
            }}
            gap={1}
          >
            {allModules.map((mod) => (
              <Box
                key={mod.id}
                sx={{
                  border: '1px solid',
                  borderColor: enabledModuleIds.has(mod.id)
                    ? 'primary.main'
                    : 'divider',
                  borderRadius: 2,
                  p: 1.5,
                  bgcolor: enabledModuleIds.has(mod.id)
                    ? 'primary.50'
                    : 'transparent',
                  transition: 'border-color 0.2s, background-color 0.2s',
                }}
              >
                <FormControlLabel
                  label={
                    <Box>
                      <Typography
                        variant="body2"
                        fontWeight={500}
                        lineHeight={1.2}
                      >
                        {mod.name}
                      </Typography>
                      {mod.description && (
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          display="block"
                          mt={0.5}
                        >
                          {mod.description}
                        </Typography>
                      )}
                    </Box>
                  }
                  control={
                    <Switch
                      size="small"
                      checked={enabledModuleIds.has(mod.id)}
                      onChange={() => onToggle(mod.id)}
                      disabled={toggleLoading}
                    />
                  }
                  sx={{ alignItems: 'center', m: 0, width: '100%' }}
                />
              </Box>
            ))}
          </Box>
        )}
      </CardContent>
    </Card>
  );
}

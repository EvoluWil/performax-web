import { ChangelogFeed } from '@/features/changelog/components';
import { Box } from '@mui/material';

export default function PanelPage() {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        bgcolor: 'grey.50',
        pt: 2,
        pb: 6,
      }}
    >
      <ChangelogFeed />
    </Box>
  );
}

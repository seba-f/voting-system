import { Box, Container } from '@mui/material';

const AppContainer = () => {
  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        {/* Your main content will go here */}
        <h1>Voting System</h1>
      </Container>
    </Box>
  );
};

export default AppContainer;

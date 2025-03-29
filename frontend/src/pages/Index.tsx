import React from 'react';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import { Home } from '@mui/icons-material';

const HomePage = () => {
  return (
    <Box p={4}>
      <Typography variant="h3" gutterBottom>
        Welcome to the Network Management System!
      </Typography>
      <Typography variant="h6" gutterBottom>
        Manage your network switches and ports with ease.
      </Typography>
      <Grid container spacing={3} mt={4}>
        <Grid item xs={12} sm={6} md={4}>
          <Paper elevation={3} sx={{ padding: 2, textAlign: 'center' }}>
            <Typography variant="h5" gutterBottom>
              Feature 1
            </Typography>
            <Typography variant="body1">
              Description of feature 1 that helps you manage your network.
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Paper elevation={3} sx={{ padding: 2, textAlign: 'center' }}>
            <Typography variant="h5" gutterBottom>
              Feature 2
            </Typography>
            <Typography variant="body1">
              Description of feature 2 that helps you monitor your network.
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Paper elevation={3} sx={{ padding: 2, textAlign: 'center' }}>
            <Typography variant="h5" gutterBottom>
              Feature 3
            </Typography>
            <Typography variant="body1">
              Description of feature 3 that helps you troubleshoot your network.
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default HomePage;
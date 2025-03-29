import React from 'react';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';

// Import the image
import homeBackground from '../images/home-background.jpg';

const HomePage = () => {
  return (
    <Container maxWidth="md">
      <Box my={4}>
        <Paper elevation={3}>
          <Box>
            {/* Display the image as a hero image with a smaller maximum height */}
            <Box
              component="img"
              src={homeBackground}
              alt="Home Background"
              sx={{
                width: '100%',
                maxHeight: '240px', // Reduced maximum height
                objectFit: 'cover',  // Ensure the image covers the space without distortion
                borderTopLeftRadius: '4px',
                borderTopRightRadius: '4px',
              }}
            />
            <Box p={4}>
              <Typography variant="h3" gutterBottom align="center">
                Welcome to the MTU Toolbox!
              </Typography>
              <Typography variant="h6" gutterBottom>
                This is a collection of various scripts I have created. Please note the following:
              </Typography>
              <Typography variant="body1" component="div">
                <ul>
                  <li>This tool is not officially supported.</li>
                  <li>Compatibility with different switch models and software versions is not guaranteed. Support is provided on a best-effort basis.</li>
                  <li>This tool will change often as it's in early beta.</li>
                </ul>
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default HomePage;
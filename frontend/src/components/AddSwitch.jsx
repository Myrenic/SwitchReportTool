import React, { useState } from 'react';
import { TextField, Button, Box, Typography, CircularProgress, Container, Paper } from '@mui/material';
import config from '../config'; // Ensure you have your config file to get API URL

const AddSwitch = () => {
  const [switchIp, setSwitchIp] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageColor, setMessageColor] = useState('error'); // To handle message color

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const response = await fetch(`${config.CISCO_API_URL}/add_switch`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ip_address: switchIp, password }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('Switch added successfully!');
        setMessageColor('primary'); // Success message color
      } else {
        setMessage(data.error || 'Failed to add switch. Please check the IP and password.');
        setMessageColor('error'); // Error message color
      }
    } catch (error) {
      setMessage('An error occurred while adding the switch.');
      setMessageColor('error'); // Error message color
      console.error('Error:', error);
    }

    setLoading(false);
  };

  return (
    <Container maxWidth="sm">
      <Box my={4}>
        <Paper elevation={3}>
          <Box p={4}>
            <Typography variant="h4" gutterBottom align="center">
              Add a New Switch
            </Typography>
            <form onSubmit={handleSubmit}>
              <Box mb={2}>
                <TextField
                  fullWidth
                  label="Switch IP"
                  variant="outlined"
                  value={switchIp}
                  onChange={(e) => setSwitchIp(e.target.value)}
                  required
                />
              </Box>
              <Box mb={2}>
                <TextField
                  fullWidth
                  label="Password"
                  type="password"
                  variant="outlined"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </Box>
              <Box mb={2} display="flex" justifyContent="center">
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={loading}
                >
                  {loading ? <CircularProgress size={24} /> : 'Submit'}
                </Button>
              </Box>
              {message && (
                <Box mt={2}>
                  <Typography variant="body1" align="center" color={messageColor}>
                    {message}
                  </Typography>
                </Box>
              )}
            </form>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default AddSwitch;
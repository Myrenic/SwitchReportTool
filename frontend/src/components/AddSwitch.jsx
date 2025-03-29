import React, { useState } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
} from '@mui/material';
import config from '../../config';

const AddSwitch = () => {
  const [ipAddress, setIpAddress] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
    const ciscoUrl = config.CISCO_API_URL;

    fetch(`${ciscoUrl}/update_switch`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ip_address: ipAddress }),
    })
      .then(response => response.json())
      .then(data => {
        setMessage(data.message);
        setIpAddress('');
      })
      .catch(error => console.error('Error updating switch:', error));
  };

  return (
    <Paper elevation={3} className="add-switch" sx={{ padding: 2 }}>
      <Typography variant="h6" gutterBottom>
        Add New Switch
      </Typography>
      <form onSubmit={handleSubmit}>
        <Box display="flex" flexDirection="column" gap={2}>
          <TextField
            label="IP Address"
            variant="outlined"
            value={ipAddress}
            onChange={(e) => setIpAddress(e.target.value)}
            required
          />
          <Button variant="contained" color="primary" type="submit">
            Add Switch
          </Button>
        </Box>
      </form>
      {message && (
        <Typography variant="body1" color="textSecondary" sx={{ marginTop: 2 }}>
          {message}
        </Typography>
      )}
    </Paper>
  );
};

export default AddSwitch;
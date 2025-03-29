import React from 'react';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

const SwitchDetails = ({ switch: selectedSwitch }) => {
  return (
    <Box className="switch-details" p={2}>
      <Typography variant="h6" gutterBottom>
        Switch Details
      </Typography>
      <Typography variant="body1">
        <strong>Hostname:</strong> {selectedSwitch.hostname}
      </Typography>
      <Typography variant="body1">
        <strong>IP Address:</strong> {selectedSwitch.ip_address}
      </Typography>
      <Typography variant="body1">
        <strong>Hardware:</strong> {selectedSwitch.hardware.join(', ')}
      </Typography>
      <Typography variant="body1">
        <strong>MAC Address:</strong> {selectedSwitch.mac_address.join(', ')}
      </Typography>
      <Typography variant="body1">
        <strong>Serial:</strong> {selectedSwitch.serial.join(', ')}
      </Typography>
    </Box>
  );
};

export default SwitchDetails;
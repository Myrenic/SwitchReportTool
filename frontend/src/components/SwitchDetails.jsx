import React from 'react';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

const SwitchDetails = ({ switch: selectedSwitch }) => {
  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    // Format the date to "02-Apr-2025 on 12:37"
    const formattedDate = new Intl.DateTimeFormat('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    }).format(date);
    const formattedTime = new Intl.DateTimeFormat('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    }).format(date);
    return `${formattedDate} on ${formattedTime}`;
  };

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
      <Typography variant="body1">
        <strong>Latest Uptime:</strong> {selectedSwitch.latest_uptime || 'N/A'}
      </Typography>
      <Typography variant="body1">
        <strong>Uptime Timestamp:</strong> {selectedSwitch.uptime_timestamp ? formatTimestamp(selectedSwitch.uptime_timestamp) : 'N/A'}
      </Typography>
    </Box>
  );
};

export default SwitchDetails;
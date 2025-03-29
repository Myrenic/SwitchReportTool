import React, { useState, useEffect } from 'react';
import Typography from '@mui/material/Typography';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import config from '../../config';

const SwitchList = ({ selectedSwitch, onSelectSwitch, onRefresh }) => {
  const [switches, setSwitches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const dbUrl = config.DATABASE_API_URL;
    fetch(`${dbUrl}/get_all_switches`)
      .then(response => response.json())
      .then(data => {
        if (Array.isArray(data)) {
          setSwitches(data);
        } else {
          setSwitches([]);
          console.error('Invalid response format:', data);
        }
      })
      .catch(error => {
        setSwitches([]);
        console.error('Error fetching switches:', error);
      });
  }, []);

  const handleChange = (event) => {
    const selectedId = parseInt(event.target.value, 10);
    const selectedSwitch = switches.find(sw => sw.id === selectedId);
    onSelectSwitch(selectedSwitch);
  };

  const handleUpdate = () => {
    if (!selectedSwitch) {
      setMessage('Please select a switch to update.');
      return;
    }

    setLoading(true);
    setMessage('');

    fetch(`${config.CISCO_API_URL}/update_switch`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ip_address: selectedSwitch.ip_address })
    })
      .then(response => response.json())
      .then(data => {
        setLoading(false);
        setMessage(data.message || 'Switch updated successfully.');
      })
      .catch(error => {
        setLoading(false);
        setMessage('Error updating switch. Please try again.');
        console.error('Error updating switch:', error);
      });
  };

  return (
    <Box className="switch-list">
      <Typography variant="h6" gutterBottom>
        Select a Switch
      </Typography>
      <Box className="switch-list-controls" display="flex" alignItems="center">
        <FormControl variant="outlined" sx={{ minWidth: 200, marginRight: 2 }}>
          <InputLabel id="switch-select-label">Select a switch</InputLabel>
          <Select
            labelId="switch-select-label"
            value={selectedSwitch ? selectedSwitch.id : ""}
            onChange={handleChange}
            label="Select a switch"
          >
            <MenuItem value="">
              <em>None</em>
            </MenuItem>
            {switches.map((sw) => (
              <MenuItem key={sw.id} value={sw.id}>
                {sw.hostname}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Button
          variant="contained"
          color="primary"
          onClick={onRefresh}
          sx={{ marginRight: 2 }}
        >
          Refresh
        </Button>
        <Button
          variant="contained"
          color="secondary"
          onClick={handleUpdate}
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} /> : 'Update'}
        </Button>
      </Box>
      {message && (
        <Typography variant="body2" color="textSecondary" sx={{ marginTop: 2 }}>
          {message}
        </Typography>
      )}
    </Box>
  );
};

export default SwitchList;
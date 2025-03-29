import React, { useState, useEffect } from 'react';
import Typography from '@mui/material/Typography';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Box from '@mui/material/Box';
import config from '../../config';

const SwitchList = ({ selectedSwitch, onSelectSwitch, onRefresh }) => {
  const [switches, setSwitches] = useState([]);

  useEffect(() => {
    const dbUrl = config.DATABASE_API_URL;
    fetch(`${dbUrl}/get_all_switches`)
      .then(response => response.json())
      .then(data => setSwitches(data))
      .catch(error => console.error('Error fetching switches:', error));
  }, []);

  const handleChange = (event) => {
    const selectedId = parseInt(event.target.value, 10);
    const selectedSwitch = switches.find(sw => sw.id === selectedId);
    onSelectSwitch(selectedSwitch);
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
        >
          Refresh
        </Button>
      </Box>
    </Box>
  );
};

export default SwitchList;
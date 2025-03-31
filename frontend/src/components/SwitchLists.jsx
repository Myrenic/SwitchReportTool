import React, { useState, useEffect } from 'react';
import Typography from '@mui/material/Typography';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import config from '../config'; // Ensure you have your config file to get API URL

const SwitchList = ({ selectedSwitch, onSelectSwitch, onRefresh }) => {
  const [switches, setSwitches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [siteCodes, setSiteCodes] = useState([]);
  const [selectedSiteCode, setSelectedSiteCode] = useState('');
  const [filteredSwitches, setFilteredSwitches] = useState([]);

  useEffect(() => {
    const dbUrl = config.DATABASE_API_URL;
    fetch(`${dbUrl}/get_all_switches`)
      .then(response => response.json())
      .then(data => {
        if (Array.isArray(data)) {
          setSwitches(data);
          const uniqueSiteCodes = [...new Set(data.map(sw => sw.hostname.slice(0, 5)))];
          setSiteCodes(uniqueSiteCodes);
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

  useEffect(() => {
    if (selectedSiteCode) {
      const filtered = switches.filter(sw => sw.hostname.startsWith(selectedSiteCode));
      setFilteredSwitches(filtered);
    } else {
      setFilteredSwitches([]);
    }
  }, [selectedSiteCode, switches]);

  const handleSiteCodeChange = (event) => {
    setSelectedSiteCode(event.target.value);
  };

  const handleSwitchChange = (event) => {
    const selectedId = event.target.value;
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
      <Box className="filter-controls" display="flex" alignItems="center" mb={2}>
        <FormControl variant="outlined" sx={{ minWidth: 200, marginRight: 2 }}>
          <InputLabel id="site-code-select-label">Select Site Code</InputLabel>
          <Select
            labelId="site-code-select-label"
            value={selectedSiteCode}
            onChange={handleSiteCodeChange}
            label="Select Site Code"
          >
            <MenuItem value="">
              <em>None</em>
            </MenuItem>
            {siteCodes.map(siteCode => (
              <MenuItem key={siteCode} value={siteCode}>
                {siteCode}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>
      <Box className="switch-list-controls" display="flex" alignItems="center">
        <FormControl variant="outlined" sx={{ minWidth: 200, marginRight: 2 }}>
          <InputLabel id="switch-select-label">Select a switch</InputLabel>
          <Select
            labelId="switch-select-label"
            value={selectedSwitch ? selectedSwitch.id : ""}
            onChange={handleSwitchChange}
            label="Select a switch"
          >
            <MenuItem value="">
              <em>None</em>
            </MenuItem>
            {filteredSwitches.map(sw => (
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
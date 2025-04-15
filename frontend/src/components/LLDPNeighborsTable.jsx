import React, { useState, useEffect } from 'react';
import { 
  Container, Box, Typography, CircularProgress, Button, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, Paper, TextField, ButtonGroup, Menu, MenuItem 
} from '@mui/material';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import SwitchList from './SwitchLists'; // Adjust the import path as necessary
import config from '../config';

const LLDPNeighborsTable = () => {
  const [selectedSwitch, setSelectedSwitch] = useState(null);
  const [neighbors, setNeighbors] = useState([]);
  const [loadingNeighbors, setLoadingNeighbors] = useState({});
  const [message, setMessage] = useState('');
  const [password, setPassword] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedPlatform, setSelectedPlatform] = useState('cisco_ios');

  const fetchNeighbors = async (switchName) => {
    setMessage('');
    try {
      const response = await fetch(`${config.DATABASE_API_URL}/get_lldp_neighbors/${switchName}`);
      const result = await response.json();
      setNeighbors(result || []);
    } catch (error) {
      console.error('Error fetching', error);
      setMessage('Error fetching LLDP neighbors.');
    }
  };

  const handleSelectSwitch = (selectedSwitch) => {
    setSelectedSwitch(selectedSwitch);
    if (selectedSwitch) {
      fetchNeighbors(selectedSwitch.hostname);
    }
  };

  const handleAddNeighbor = async (neighbor) => {
    if (!password) {
      setMessage('Please enter a password.');
      return;
    }

    setLoadingNeighbors((prevState) => ({ ...prevState, [neighbor.lldp_neighbor_mgmt_ip]: true }));
    setMessage('');
    try {
      const response = await fetch('http://127.0.0.1:5001/api/cisco/add_switch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ip_address: neighbor.lldp_neighbor_mgmt_ip,
          password: password,
          platform: selectedPlatform,
        }),
      });

      if (response.ok) {
        setMessage('Neighbor added successfully!');
      } else {
        const errorData = await response.json();
        setMessage(`Failed to add neighbor: ${errorData.error}`);
      }
    } catch (error) {
      console.error('Error adding neighbor', error);
      setMessage('Error adding neighbor.');
    } finally {
      setLoadingNeighbors((prevState) => ({ ...prevState, [neighbor.lldp_neighbor_mgmt_ip]: false }));
    }
  };

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuItemClick = (platform) => {
    setSelectedPlatform(platform);
    setAnchorEl(null);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  return (
    <Container maxWidth="lg">
      <Box my={4}>
        <SwitchList
          selectedSwitch={selectedSwitch}
          onSelectSwitch={handleSelectSwitch}
          onRefresh={() => fetchNeighbors(selectedSwitch?.hostname)}
        />
        <Box display="flex" alignItems="center" mt={2}>
          <TextField
            label="Password"
            type="password"
            variant="outlined"
            fullWidth
            margin="normal"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <ButtonGroup variant="contained" color="primary" style={{ marginLeft: '10px' }}>
            <Button onClick={handleMenuClick}>
              {selectedPlatform === 'cisco_ios' ? 'Cisco' : 'Arista'}
              <ArrowDropDownIcon />
            </Button>
          </ButtonGroup>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
          >
            <MenuItem onClick={() => handleMenuItemClick('cisco_ios')}>Cisco</MenuItem>
            <MenuItem onClick={() => handleMenuItemClick('arista_eos')}>Arista</MenuItem>
          </Menu>
        </Box>
        {loadingNeighbors.global ? (
          <Box display="flex" justifyContent="center" mt={4}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            {neighbors.length > 0 ? (
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Neighbor Device</TableCell>
                      <TableCell>Neighbor Hostname</TableCell>
                      <TableCell>Neighbor Management IP</TableCell>
                      <TableCell>Source Port</TableCell>
                      <TableCell>Source Switch Hostname</TableCell>
                      <TableCell>Action</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {neighbors.map((neighbor, index) => (
                      <TableRow key={index}>
                        <TableCell>{neighbor.lldp_neighbor_device}</TableCell>
                        <TableCell>{neighbor.neighbor_switch_hostname}</TableCell>
                        <TableCell>{neighbor.lldp_neighbor_mgmt_ip || 'N/A'}</TableCell>
                        <TableCell>{neighbor.source_port}</TableCell>
                        <TableCell>{neighbor.source_switch_hostname}</TableCell>
                        <TableCell>
                          <Button
                            variant="contained"
                            color="primary"
                            onClick={() => handleAddNeighbor(neighbor)}
                            disabled={!neighbor.lldp_neighbor_mgmt_ip}
                          >
                            {loadingNeighbors[neighbor.lldp_neighbor_mgmt_ip] ? (
                              <CircularProgress size={24} />
                            ) : (
                              'Add'
                            )}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Typography variant="body1" align="center">
                No neighbors found.
              </Typography>
            )}
            {message && (
              <Box mt={2}>
                <Typography variant="body1" align="center" color={message.includes('successfully') ? 'primary' : 'error'}>
                  {message}
                </Typography>
              </Box>
            )}
          </>
        )}
      </Box>
    </Container>
  );
};

export default LLDPNeighborsTable;
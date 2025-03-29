import React, { useState } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material';
import config from '../../config';

const SearchMac = () => {
  const [macAddress, setMacAddress] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [message, setMessage] = useState('');

  const handleSearch = () => {
    if (macAddress) {
      const dbUrl = config.DATABASE_API_URL;
      fetch(`${dbUrl}/get_ports_by_mac/${macAddress}`)
        .then(response => response.json())
        .then(data => {
          if (data.length > 0) {
            setSearchResults(data);
            setMessage('');
          } else {
            setSearchResults([]);
            setMessage('No results found');
          }
        })
        .catch(error => {
          console.error('Error searching MAC address:', error);
          setMessage('Error searching MAC address');
        });
    }
  };

  return (
    <Box className="search-mac" p={2}>
      <Box className="search-bar" display="flex" alignItems="center" gap={2} mb={2}>
        <TextField
          label="Enter MAC Address"
          variant="outlined"
          value={macAddress}
          onChange={(e) => setMacAddress(e.target.value)}
          fullWidth
        />
        <Button variant="contained" color="primary" onClick={handleSearch}>
          Search
        </Button>
      </Box>
      {message && (
        <Typography variant="body1" color="textSecondary" gutterBottom>
          {message}
        </Typography>
      )}
      {searchResults.length > 0 && (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Switch</TableCell>
                <TableCell>Port</TableCell>
                <TableCell>MAC Address</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>VLAN ID</TableCell>
                <TableCell>Timestamp</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {searchResults.map((result, index) => (
                <TableRow key={index}>
                  <TableCell>{result.switch_name}</TableCell>
                  <TableCell>{result.port}</TableCell>
                  <TableCell>{result.mac_address}</TableCell>
                  <TableCell>{result.status}</TableCell>
                  <TableCell>{result.vlan_id}</TableCell>
                  <TableCell>{result.timestamp}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default SearchMac;
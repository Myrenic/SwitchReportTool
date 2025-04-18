import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  Paper,
  Box,
  Typography,
  TextField,
  CircularProgress,
  Button,
} from '@mui/material';

// Custom comparator for port names
const portNameComparator = (a, b) => {
  const parsePortName = (name) => {
    const match = name.match(/([a-zA-Z]+)(\d+)\/(\d+)/);
    if (!match) return [name];
    return [match[1], parseInt(match[2]), parseInt(match[3])];
  };

  const aParsed = parsePortName(a);
  const bParsed = parsePortName(b);

  // Prioritize ports starting with "Gi1/0/"
  if (a.startsWith("Gi1/0/") && !b.startsWith("Gi1/0/")) return -1;
  if (!a.startsWith("Gi1/0/") && b.startsWith("Gi1/0/")) return 1;

  for (let i = 0; i < aParsed.length; i++) {
    if (aParsed[i] < bParsed[i]) return -1;
    if (aParsed[i] > bParsed[i]) return 1;
  }
  return 0;
};

const descendingComparator = (a, b, orderBy) => {
  if (orderBy === 'port') {
    return portNameComparator(b[orderBy], a[orderBy]);
  }
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
};

const getComparator = (order, orderBy) => {
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
};

const stableSort = (array, comparator) => {
  const stabilizedThis = array.map((el, index) => [el, index]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });
  return stabilizedThis.map((el) => el[0]);
};

const Row = ({ row, deaddays }) => {
  const daysSinceLastStatusUpdate = parseInt(row.timestamp_last_status_update.split(' ')[0]);
  const isConnected = row.status.toLowerCase() === 'up';
  const isPruningCandidate = !isConnected && daysSinceLastStatusUpdate > deaddays;

  const rowStyle = isConnected
    ? { backgroundColor: '#2fba50' }
    : isPruningCandidate
    ? { backgroundColor: '#0055ff' }
    : { backgroundColor: '#ff1c31' };

  return (
    <TableRow sx={rowStyle}>
      <TableCell>{row.port || 'N/A'}</TableCell>
      <TableCell>{row.name || 'N/A'}</TableCell>
      <TableCell>{row.status || 'N/A'}</TableCell>
      <TableCell>{row.timestamp_last_status_update || 'N/A'}</TableCell>
      <TableCell>{row.vlan_id || 'N/A'}</TableCell>
      <TableCell>{row.voice_vlan || 'N/A'}</TableCell>
      <TableCell>{row.speed || 'N/A'}</TableCell>
    </TableRow>
  );
};

const isValidIP = (ip) => {
  const regex = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
  return regex.test(ip);
};

const LegacyDataTable = () => {
  const [data, setData] = useState([]);
  const [order, setOrder] = useState('asc');
  const [orderBy, setOrderBy] = useState('port');
  const [ipAddress, setIpAddress] = useState('10.115.193.47');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [systemInfo, setSystemInfo] = useState(null);
  const [deaddays, setDeaddays] = useState(14);
  const [hasSearched, setHasSearched] = useState(false);

  const fetchData = async (ip, deaddays) => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${config.DATABASE_API_URL}/api/legacy_data`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ip_address: ip,
          deaddays: deaddays,
        }),
      });
      const result = await response.json();
      setData(result.data.interface_stats);
      setSystemInfo(result.data.switch_stats);
      setHasSearched(true);
    } catch (error) {
      setError('Error fetching data. Please try again.');
      setHasSearched(false);
    }
    setLoading(false);
  };

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleSearch = () => {
    if (isValidIP(ipAddress)) {
      fetchData(ipAddress, deaddays);
    } else {
      setError('Invalid IP address.');
    }
  };

  const headCells = [
    { id: 'port', label: 'Port' },
    { id: 'name', label: 'Description' },
    { id: 'status', label: 'Status' },
    { id: 'timestamp_last_status_update', label: 'Time since port entered current status' },
    { id: 'vlan_id', label: 'VLAN' },
    { id: 'voice_vlan', label: 'Voice VLAN (Experimental)' },
    { id: 'speed', label: 'Speed' },
  ];

  return (
    <Box position="relative" minHeight="100vh">
      <Box mb={2}>
        <TextField
          label="IP Address"
          value={ipAddress}
          onChange={(e) => setIpAddress(e.target.value)}
          error={!!error}
          helperText={error}
          variant="outlined"
          size="small"
          style={{ marginRight: 8 }}
        />
        <TextField
          label="Prune Candidate Days"
          value={deaddays}
          onChange={(e) => setDeaddays(e.target.value)}
          variant="outlined"
          size="small"
          type="number"
          style={{ marginRight: 8 }}
        />
        <Button variant="contained" color="primary" onClick={handleSearch}>
          Search
        </Button>
      </Box>
      {hasSearched && !loading && !error && (
        <>
          <Box mb={2} display="flex" justifyContent="space-between">
            <Box display="flex" alignItems="center">
              <Box sx={{ width: 14, height: 14, backgroundColor: '#2fba50', marginRight: 1 }} />
              <Typography variant="body2">Active Port (Green)</Typography>
            </Box>
            <Box display="flex" alignItems="center">
              <Box sx={{ width: 14, height: 14, backgroundColor: '#0055ff', marginRight: 1 }} />
              <Typography variant="body2">Prune Candidate (Blue)</Typography>
            </Box>
            <Box display="flex" alignItems="center">
              <Box sx={{ width: 14, height: 14, backgroundColor: '#ff1c31', marginRight: 1 }} />
              <Typography variant="body2">Inactive Port (Red)</Typography>
            </Box>
          </Box>
          {systemInfo && (
            <Box mb={2}>
              <Typography variant="h5">System info: </Typography>
              <br />
              <Typography>FQDN: {systemInfo.fqdn}</Typography>
              <Typography>Hostname: {systemInfo.hostname}</Typography>
              <Typography>IP Address: {systemInfo.ip_address}</Typography>
              <Typography>Uptime: {systemInfo.uptime}</Typography>
            </Box>
          )}
        </>
      )}
      <br />
      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center">
          <CircularProgress />
          <Typography variant="body1" style={{ marginLeft: 8 }}>
            This can be slow...
          </Typography>
        </Box>
      ) : (
        hasSearched && !error && (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  {headCells.map((headCell) => (
                    <TableCell
                      key={headCell.id}
                      sortDirection={orderBy === headCell.id ? order : false}
                    >
                      <TableSortLabel
                        active={orderBy === headCell.id}
                        direction={orderBy === headCell.id ? order : 'asc'}
                        onClick={(event) => handleRequestSort(event, headCell.id)}
                      >
                        {headCell.label}
                      </TableSortLabel>
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {stableSort(data, getComparator(order, orderBy)).map((row, index) => (
                  <Row key={index} row={row} deaddays={deaddays} />
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )
      )}
      {error && (
        <Box display="flex" justifyContent="center" alignItems="center" mt={2}>
          <Typography variant="body1" color="error">
            {error}
          </Typography>
        </Box>
      )}
      {!hasSearched && !loading && (
        <Box >
          <Typography>
            Modern interface with backend from <a href='http://10.48.106.148/cgi-bin/adhocswitchselect.pl' target="_blank">10.48.106.148 (adhocswitchselect.pl)</a>
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default LegacyDataTable;
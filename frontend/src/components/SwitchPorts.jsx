import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  Paper,
  IconButton,
  Collapse,
  Box,
  Typography,
} from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';

// Custom comparator for port names
const portNameComparator = (a, b) => {
  const parsePortName = (name) => {
    const match = name.match(/([a-zA-Z]+)(\d+)\/(\d+)\/(\d+)/);
    if (!match) return [name];
    return [match[1], parseInt(match[2]), parseInt(match[3]), parseInt(match[4])];
  };

  const aParsed = parsePortName(a);
  const bParsed = parsePortName(b);

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

const Row = ({ row }) => {
  const [open, setOpen] = React.useState(false);

  return (
    <>
      <TableRow>
        <TableCell>
          <IconButton aria-label="expand row" size="small" onClick={() => setOpen(!open)}>
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
        <TableCell>
          <Box display="flex" alignItems="center">
            {row.port || 'N/A'}
            {row.lldp_neighbor && (
              <Box
                component="span"
                sx={{
                  height: 8,
                  width: 8,
                  borderRadius: '50%',
                  backgroundColor: 'red',
                  display: 'inline-block',
                  marginLeft: 1,
                }}
              />
            )}
            {row.poe_power_usage && row.poe_power_usage > 0 && (
              <Box
                component="span"
                sx={{
                  height: 8,
                  width: 8,
                  borderRadius: '50%',
                  backgroundColor: 'magenta',
                  display: 'inline-block',
                  marginLeft: 1,
                }}
              />
            )}
          </Box>
        </TableCell>
        <TableCell>{row.status || 'N/A'}</TableCell>
        <TableCell>{row.duplex || 'N/A'}</TableCell>
        <TableCell>{row.speed || 'N/A'}</TableCell>
        <TableCell>{row.mac_address || 'N/A'}</TableCell>
        <TableCell>{row.vlan_id || 'N/A'}</TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={7}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box margin={1}>
              <Table size="small" aria-label="details">
                <TableBody>
                  <TableRow>
                    <TableCell>Type</TableCell>
                    <TableCell>{row.type || 'N/A'}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>LLDP Neighbor</TableCell>
                    <TableCell>{row.lldp_neighbor || 'N/A'}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>LLDP Neighbor Device</TableCell>
                    <TableCell>{row.lldp_neighbor_device || 'N/A'}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>LLDP Neighbor Mgmt IP</TableCell>
                    <TableCell>{row.lldp_neighbor_mgmt_ip || 'N/A'}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>POE Power Usage </TableCell>
                    <TableCell>{row.poe_power_usage != null ? row.poe_power_usage+"w" : 'N/A'}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>POE Device</TableCell>
                    <TableCell>{row.poe_device || 'N/A'}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>POE Class</TableCell>
                    <TableCell>{row.poe_class || 'N/A'}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Timestamp</TableCell>
                    <TableCell>{row.timestamp || 'N/A'}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
};

const SwitchPorts = ({ ports }) => {
  const [order, setOrder] = React.useState('asc');
  const [orderBy, setOrderBy] = React.useState('port');

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const headCells = [
    { id: 'expand', label: '' },
    { id: 'port', label: 'Port' },
    { id: 'status', label: 'Status' },
    { id: 'duplex', label: 'Duplex' },
    { id: 'speed', label: 'Speed' },
    { id: 'mac_address', label: 'MAC Address' },
    { id: 'vlan_id', label: 'VLAN ID' },
  ];

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            {headCells.map((headCell) => (
              <TableCell
                key={headCell.id}
                sortDirection={orderBy === headCell.id ? order : false}
              >
                {headCell.id !== 'expand' ? (
                  <TableSortLabel
                    active={orderBy === headCell.id}
                    direction={orderBy === headCell.id ? order : 'asc'}
                    onClick={(event) => handleRequestSort(event, headCell.id)}
                  >
                    {headCell.label}
                  </TableSortLabel>
                ) : (
                  headCell.label
                )}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {stableSort(ports, getComparator(order, orderBy)).map((port) => (
            <Row key={port.id} row={port} />
          ))}
        </TableBody>
      </Table>
      <Box mt={2} p={2} display="flex" justifyContent="left" alignItems="center">
        <Box display="flex" alignItems="center" mr={2}>
          <Box
            component="span"
            sx={{
              height: 8,
              width: 8,
              borderRadius: '50%',
              backgroundColor: 'red',
              display: 'inline-block',
              marginRight: 1,
            }}
          />
          <Typography variant="body2">LLDP Neighbor</Typography>
        </Box>
        <Box display="flex" alignItems="center">
          <Box
            component="span"
            sx={{
              height: 8,
              width: 8,
              borderRadius: '50%',
              backgroundColor: 'magenta',
              display: 'inline-block',
              marginRight: 1,
            }}
          />
          <Typography variant="body2">POE Power Usage</Typography>
        </Box>
      </Box>
    </TableContainer>
  );
};

export default SwitchPorts;

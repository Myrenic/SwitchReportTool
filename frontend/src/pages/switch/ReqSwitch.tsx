import React from 'react';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import AddSwitch from '../../components/AddSwitch'; // Ensure the import path is correct
import LLDPNeighborsTable from '../../components/LLDPNeighborsTable'

const ReqSwitch = () => {
  return (
    <Box p={2}>
      <AddSwitch />
      {/* <LLDPNeighborsTable /> */}
    </Box>
  );
};

export default ReqSwitch;
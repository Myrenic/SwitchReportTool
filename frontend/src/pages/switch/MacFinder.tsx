import React from 'react';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import SearchMac from '../../components/SearchMac'; // Ensure the import path is correct

const MacFinder = () => {
  return (
    <Box p={2}>
      <SearchMac />
    </Box>
  );
};

export default MacFinder;
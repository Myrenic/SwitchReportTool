import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

const CustomNode = ({ nodeDatum }) => {
  return (
    <Box
      sx={{
        border: '1px solid #ccc',
        borderRadius: '8px',
        padding: '8px',
        backgroundColor: '#888',
        display: 'inline-block',
        textAlign: 'center',
      }}
    >
      <Typography variant="body2">{nodeDatum.name}</Typography>
    </Box>
  );
};

export default CustomNode;

import React from 'react';
import { CircularProgress, Box } from '@mui/material';

const Loader = ({ size = 40 }) => {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', padding: 2 }}>
      <CircularProgress size={size} />
    </Box>
  );
};

export default Loader;

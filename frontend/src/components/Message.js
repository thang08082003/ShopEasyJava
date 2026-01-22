import React from 'react';
import { Alert, Box } from '@mui/material';

const Message = ({ severity = 'info', children }) => {
  return (
    <Box sx={{ marginY: 2 }}>
      <Alert severity={severity}>{children}</Alert>
    </Box>
  );
};

export default Message;

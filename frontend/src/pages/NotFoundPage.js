import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Button,
  Container,
  Typography,
  Paper,
  Grid
} from '@mui/material';
import { 
  SentimentVeryDissatisfied as SadIcon, 
  Home as HomeIcon, 
  ShoppingBag as ShopIcon 
} from '@mui/icons-material';

const NotFoundPage = () => {
  return (
    <Container maxWidth="md" sx={{ py: 8 }}>
      <Paper 
        sx={{ 
          p: 4, 
          textAlign: 'center',
          backgroundImage: 'radial-gradient(circle, rgba(238,238,238,1) 0%, rgba(255,255,255,1) 100%)'
        }}
        elevation={3}
      >
        <SadIcon sx={{ fontSize: 100, color: 'text.secondary', mb: 2 }} />
        
        <Typography variant="h2" component="h1" gutterBottom>
          404
        </Typography>
        
        <Typography variant="h4" gutterBottom>
          Page Not Found
        </Typography>
        
        <Typography variant="body1" color="text.secondary" paragraph sx={{ maxWidth: '70%', mx: 'auto', mb: 4 }}>
          The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
        </Typography>
        
        <Grid container spacing={2} justifyContent="center">
          <Grid item>
            <Button 
              component={RouterLink} 
              to="/" 
              variant="contained" 
              startIcon={<HomeIcon />}
            >
              Back to Home
            </Button>
          </Grid>
          <Grid item>
            <Button 
              component={RouterLink} 
              to="/products" 
              variant="outlined" 
              startIcon={<ShopIcon />}
            >
              Continue Shopping
            </Button>
          </Grid>
        </Grid>
      </Paper>
      
      <Box sx={{ mt: 4, textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          If you believe this is an error, please contact our support team.
        </Typography>
      </Box>
    </Container>
  );
};

export default NotFoundPage;

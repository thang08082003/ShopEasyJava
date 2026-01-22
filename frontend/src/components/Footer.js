import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Container,
  Grid,
  Typography,
  Link,
  Divider,
  IconButton,
  Stack,
  useMediaQuery,
  useTheme
} from '@mui/material';
import {
  Facebook,
  Twitter,
  Instagram,
  LinkedIn,
  Email,
  Phone,
  LocationOn
} from '@mui/icons-material';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <Box sx={{ 
      bgcolor: 'primary.dark', 
      color: 'white', 
      pt: isMobile ? 3 : 6, 
      pb: isMobile ? 2 : 3, 
      mt: 'auto' 
    }}>
      <Container maxWidth="lg">
        <Grid container spacing={isMobile ? 2 : 4}>
          {/* Company Info */}
          <Grid item xs={12} md={4}>
            <Typography 
              variant={isMobile ? "h6" : "h5"} 
              gutterBottom
              sx={{ textAlign: isMobile ? 'center' : 'left' }}
            >
              ShopEasy
            </Typography>
            <Typography 
              variant="body2" 
              paragraph
              sx={{ 
                textAlign: isMobile ? 'center' : 'left',
                fontSize: isMobile ? '0.75rem' : 'inherit',
                mb: isMobile ? 1 : 2
              }}
            >
              Your one-stop shop for all your shopping needs. Quality products at affordable prices with fast delivery.
            </Typography>
            <Stack 
              direction="row" 
              spacing={1}
              justifyContent={isMobile ? 'center' : 'flex-start'}
            >
              <IconButton color="inherit" aria-label="Facebook" size={isMobile ? "small" : "medium"}>
                <Facebook fontSize={isMobile ? "small" : "medium"} />
              </IconButton>
              <IconButton color="inherit" aria-label="Twitter" size={isMobile ? "small" : "medium"}>
                <Twitter fontSize={isMobile ? "small" : "medium"} />
              </IconButton>
              <IconButton color="inherit" aria-label="Instagram" size={isMobile ? "small" : "medium"}>
                <Instagram fontSize={isMobile ? "small" : "medium"} />
              </IconButton>
              <IconButton color="inherit" aria-label="LinkedIn" size={isMobile ? "small" : "medium"}>
                <LinkedIn fontSize={isMobile ? "small" : "medium"} />
              </IconButton>
            </Stack>
          </Grid>

          {/* Quick Links */}
          <Grid item xs={6} md={4}>
            <Typography 
              variant={isMobile ? "subtitle1" : "h6"} 
              gutterBottom
              sx={{ 
                textAlign: isMobile ? 'center' : 'left',
                fontSize: isMobile ? '0.9rem' : 'inherit'
              }}
            >
              Quick Links
            </Typography>
            <Link 
              component={RouterLink} 
              to="/" 
              color="inherit" 
              sx={{ 
                display: 'block', 
                mb: isMobile ? 0.5 : 1,
                textAlign: isMobile ? 'center' : 'left',
                fontSize: isMobile ? '0.75rem' : 'inherit'
              }}
            >
              Home
            </Link>
            <Link 
              component={RouterLink} 
              to="/products" 
              color="inherit" 
              sx={{ 
                display: 'block', 
                mb: isMobile ? 0.5 : 1,
                textAlign: isMobile ? 'center' : 'left',
                fontSize: isMobile ? '0.75rem' : 'inherit'
              }}
            >
              Products
            </Link>
            <Link 
              component={RouterLink} 
              to="/cart" 
              color="inherit" 
              sx={{ 
                display: 'block', 
                mb: isMobile ? 0.5 : 1,
                textAlign: isMobile ? 'center' : 'left',
                fontSize: isMobile ? '0.75rem' : 'inherit'
              }}
            >
              Cart
            </Link>
            <Link 
              component={RouterLink} 
              to="/profile" 
              color="inherit" 
              sx={{ 
                display: 'block', 
                mb: isMobile ? 0.5 : 1,
                textAlign: isMobile ? 'center' : 'left',
                fontSize: isMobile ? '0.75rem' : 'inherit'
              }}
            >
              My Account
            </Link>
            <Link 
              component={RouterLink} 
              to="/orders" 
              color="inherit" 
              sx={{ 
                display: 'block', 
                mb: isMobile ? 0.5 : 1,
                textAlign: isMobile ? 'center' : 'left',
                fontSize: isMobile ? '0.75rem' : 'inherit'
              }}
            >
              Order Tracking
            </Link>
          </Grid>

          {/* Contact Info */}
          <Grid item xs={6} md={4}>
            <Typography 
              variant={isMobile ? "subtitle1" : "h6"} 
              gutterBottom
              sx={{ 
                textAlign: isMobile ? 'center' : 'left',
                fontSize: isMobile ? '0.9rem' : 'inherit'
              }}
            >
              Contact Us
            </Typography>
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              mb: isMobile ? 1 : 2,
              justifyContent: isMobile ? 'center' : 'flex-start'
            }}>
              <LocationOn sx={{ mr: 1, fontSize: isMobile ? '0.9rem' : 'medium' }} />
              <Typography 
                variant="body2"
                sx={{ fontSize: isMobile ? '0.75rem' : 'inherit' }}
              >
                123 Shopping Street, Retail City, Country
              </Typography>
            </Box>
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              mb: isMobile ? 1 : 2,
              justifyContent: isMobile ? 'center' : 'flex-start'
            }}>
              <Phone sx={{ mr: 1, fontSize: isMobile ? '0.9rem' : 'medium' }} />
              <Typography 
                variant="body2"
                sx={{ fontSize: isMobile ? '0.75rem' : 'inherit' }}
              >
                +1 (555) 123-4567
              </Typography>
            </Box>
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              mb: isMobile ? 1 : 2,
              justifyContent: isMobile ? 'center' : 'flex-start'
            }}>
              <Email sx={{ mr: 1, fontSize: isMobile ? '0.9rem' : 'medium' }} />
              <Typography 
                variant="body2"
                sx={{ fontSize: isMobile ? '0.75rem' : 'inherit' }}
              >
                support@shopeasy.com
              </Typography>
            </Box>
          </Grid>
        </Grid>
        
        <Divider sx={{ my: isMobile ? 2 : 3, borderColor: 'rgba(255, 255, 255, 0.2)' }} />
        
        <Typography 
          variant="body2" 
          align="center" 
          sx={{ 
            pt: isMobile ? 1 : 2,
            fontSize: isMobile ? '0.7rem' : 'inherit'
          }}
        >
          © {currentYear} ShopEasy. All rights reserved.
        </Typography>
      </Container>
    </Box>
  );
};

export default Footer;

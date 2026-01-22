import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// MUI components
import {
  Box,
  Typography,
  Button,
  Container,
  Paper,
  useMediaQuery,
  useTheme
} from '@mui/material';

// Banner images
const bannerImages = [
  {
    image: 'https://source.unsplash.com/random/1400x400/?shopping',
    title: 'Summer Sale',
    subtitle: 'Up to 50% off on selected items',
    buttonText: 'Shop Now',
    url: '/products?category=summer',
    color: 'primary'
  },
  {
    image: 'https://source.unsplash.com/random/1400x400/?electronics',
    title: 'New Electronics',
    subtitle: 'Discover the latest tech gadgets',
    buttonText: 'Browse Electronics',
    url: '/products?category=electronics',
    color: 'secondary'
  },
  {
    image: 'https://source.unsplash.com/random/1400x400/?fashion',
    title: 'Fashion Week',
    subtitle: 'Trendy outfits for all occasions',
    buttonText: 'See Collection',
    url: '/products?category=fashion',
    color: 'info'
  }
];

const Banner = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));
  
  const [activeBanner, setActiveBanner] = useState(0);
  
  // Auto rotate banners
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveBanner((prev) => (prev + 1) % bannerImages.length);
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);
  
  const currentBanner = bannerImages[activeBanner];
  
  return (
    <Paper 
      elevation={0}
      sx={{
        position: 'relative',
        backgroundColor: 'grey.800',
        color: '#fff',
        mb: isMobile ? 2 : 4,
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',
        backgroundImage: `url(${currentBanner.image})`,
        height: isMobile ? 200 : isTablet ? 300 : 400,
        display: 'flex',
        alignItems: 'center',
        borderRadius: isMobile ? 1 : 2,
        overflow: 'hidden',
      }}
    >
      {/* Overlay */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          bottom: 0,
          right: 0,
          left: 0,
          backgroundColor: 'rgba(0,0,0,.3)',
        }}
      />
      
      {/* Banner Content */}
      <Container maxWidth="lg">
        <Box 
          sx={{ 
            position: 'relative', 
            p: { 
              xs: 2, 
              sm: 3, 
              md: 6 
            },
            textShadow: '1px 1px 3px rgba(0,0,0,0.5)'
          }}
        >
          <Typography 
            component="h2" 
            variant={isMobile ? 'h5' : isTablet ? 'h4' : 'h3'} 
            color="inherit" 
            gutterBottom
            sx={{ 
              fontWeight: 'bold',
              mb: isMobile ? 0.5 : 1
            }}
          >
            {currentBanner.title}
          </Typography>
          <Typography 
            variant={isMobile ? 'body2' : isTablet ? 'body1' : 'h6'} 
            color="inherit" 
            paragraph
            sx={{
              mb: isMobile ? 1 : 2,
              display: isMobile ? '-webkit-box' : 'block',
              WebkitLineClamp: isMobile ? 2 : 'unset',
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden'
            }}
          >
            {currentBanner.subtitle}
          </Typography>
          <Button 
            variant="contained" 
            size={isMobile ? "small" : "large"} 
            color={currentBanner.color}
            onClick={() => navigate(currentBanner.url)}
          >
            {currentBanner.buttonText}
          </Button>
        </Box>
      </Container>
      
      {/* Banner Indicators */}
      <Box sx={{ 
        position: 'absolute', 
        bottom: isMobile ? 10 : 20, 
        left: 0, 
        right: 0, 
        display: 'flex', 
        justifyContent: 'center'
      }}>
        {bannerImages.map((_, index) => (
          <Box
            key={index}
            sx={{
              width: isMobile ? 8 : 12,
              height: isMobile ? 8 : 12,
              borderRadius: '50%',
              mx: 0.5,
              backgroundColor: index === activeBanner ? 'white' : 'rgba(255,255,255,0.5)',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'scale(1.2)'
              }
            }}
            onClick={() => setActiveBanner(index)}
          />
        ))}
      </Box>
    </Paper>
  );
};

export default Banner;

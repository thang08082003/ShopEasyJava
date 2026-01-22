import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchFeaturedProducts } from '../store/slices/productSlice';
import { fetchCategories } from '../store/slices/categorySlice';

// MUI Components
import {
  Box,
  Container,
  Grid,
  Typography,
  Button,
  Card,
  CardContent,
  CardMedia,
  Divider,
  Paper,
  useTheme,
  Skeleton,
  useMediaQuery
} from '@mui/material';

// Custom Components
import ProductCard from '../components/ProductCard';

// Carousel
// We no longer use the carousel to avoid duplication/vertical stacking issues

// Hero banner image
const HeroBanner = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <Paper 
      sx={{
        position: 'relative',
        backgroundColor: 'grey.800',
        color: '#fff',
        mb: 4,
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',
        backgroundImage: isMobile 
          ? `url(/sale1.jpg)` 
          : `url(/sale1.jpg)`,       
        height: isMobile ? 200 : 400, 
        display: 'flex',
        alignItems: 'center',
        borderRadius: { xs: 0, sm: 2 } 
      }}
    >
      <Container maxWidth="lg">
        <Box sx={{ 
          maxWidth: { xs: '100%', md: '60%' }, 
          p: { xs: 3, md: 4 }
        }}>
        
          
    
        </Box>
      </Container>
    </Paper>
  );
};

const HomePage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const { featuredProducts, loading } = useSelector(state => state.products);
  const { categories } = useSelector(state => state.categories);
  
  useEffect(() => {
    dispatch(fetchFeaturedProducts());
    dispatch(fetchCategories());
  }, [dispatch]);
  
  const renderSkeletons = () => (
    Array(8).fill().map((_, index) => (
      <Grid item xs={12} sm={6} md={3} key={index}>
        <Skeleton variant="rectangular" height={200} />
        <Box sx={{ pt: 0.5 }}>
          <Skeleton />
          <Skeleton width="60%" />
          <Skeleton width="80%" />
        </Box>
      </Grid>
    ))
  );

  return (
    <>
      <HeroBanner />
      
      {/* Featured Products Section */}
      <Container maxWidth="lg" sx={{ my: 6 }}>
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h4" component="h2" sx={{ fontWeight: 'bold' }}>
              Featured Products
            </Typography>
            <Button 
              variant="outlined" 
              color="primary"
              onClick={() => navigate('/products')}
            >
              View All
            </Button>
          </Box>
          
          <Divider sx={{ mb: 3 }} />
          
          <Grid container spacing={3}>
            {loading ? (
              renderSkeletons()
            ) : featuredProducts && featuredProducts.length > 0 ? (
              featuredProducts.map(product => (
                <Grid item xs={12} sm={6} md={3} key={product._id}>
                  <ProductCard product={product} />
                </Grid>
              ))
            ) : (
              <Grid item xs={12}>
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="body1" color="text.secondary">
                    No featured products available at this time.
                  </Typography>
                </Box>
              </Grid>
            )}
          </Grid>
          
          {!loading && featuredProducts && featuredProducts.length > 0 && (
            <Box sx={{ textAlign: 'center', mt: 3 }}>
              <Button variant="outlined" onClick={() => navigate('/products')}>Browse All Products</Button>
            </Box>
          )}
          
          {!loading && (!featuredProducts || featuredProducts.length === 0) && (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="body1" color="text.secondary">
                No featured products available at this time.
              </Typography>
            </Box>
          )}
        </Box>
      </Container>
      
      {/* Explore Categories Section */}
      <Container maxWidth="lg" sx={{ my: 6 }}>
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h4" component="h2" sx={{ fontWeight: 'bold' }}>
              Explore Categories
            </Typography>
            <Button 
              variant="outlined" 
              color="primary"
              onClick={() => navigate('/products')}
            >
              Browse All
            </Button>
          </Box>
          
          <Divider sx={{ mb: 3 }} />
          
          <Grid container spacing={3}>
            {categories && categories.length > 0 ? (
              categories.slice(0, 4).map(category => (
                <Grid item xs={6} md={3} key={category._id}>
                  <Card 
                    sx={{ 
                      height: 200, 
                      cursor: 'pointer',
                      backgroundImage: `url(${category.image || 'https://source.unsplash.com/random/300x200?category'})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      position: 'relative',
                      transition: 'transform 0.3s ease',
                      '&:hover': {
                        transform: 'scale(1.05)'
                      }
                    }}
                    onClick={() => navigate(`/products?category=${category._id}`)}
                  >
                    <Box sx={{ 
                      position: 'absolute', 
                      bottom: 0, 
                      left: 0, 
                      right: 0, 
                      bgcolor: 'rgba(0,0,0,0.6)',
                      p: 2,
                      borderBottomLeftRadius: 'inherit',
                      borderBottomRightRadius: 'inherit'
                    }}>
                      <Typography variant="h6" component="div" color="white">
                        {category.name}
                      </Typography>
                    </Box>
                  </Card>
                </Grid>
              ))
            ) : (
              <Grid item xs={12}>
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="body1" color="text.secondary">
                    Categories will appear here
                  </Typography>
                </Box>
              </Grid>
            )}
          </Grid>
        </Box>
      </Container>
    </>
  );
};

export default HomePage;
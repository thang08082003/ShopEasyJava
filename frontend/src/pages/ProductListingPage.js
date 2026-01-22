import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import { fetchProducts } from '../store/slices/productSlice';
import { fetchCategories } from '../store/slices/categorySlice';

// MUI Components
import {
  Box,
  Container,
  Grid,
  Typography,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Pagination,
  Checkbox,
  FormControlLabel,
  Button,
  Divider,
  Drawer,
  IconButton,
  useMediaQuery,
  useTheme,
  Skeleton,
  Alert
} from '@mui/material';

// MUI Icons
import { FilterList, Close } from '@mui/icons-material';

// Custom Components
import ProductCard from '../components/ProductCard';

// Helpers
const useQuery = () => {
  return new URLSearchParams(useLocation().search);
};

const ProductListingPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const query = useQuery();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  // Redux state
  const { products, loading, total } = useSelector(state => state.products);
  const { categories } = useSelector(state => state.categories);
  
  // Local state for filters
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [filters, setFilters] = useState({
    search: query.get('search') || '',
    category: query.get('category') || '',
    price_min: query.get('price_min') || '',
    price_max: query.get('price_max') || '',
    price_range: query.get('price_range') || '',
    sort: query.get('sort') || '-createdAt',
    in_stock: query.get('in_stock') === 'true',
    page: parseInt(query.get('page') || '1', 10),
  });

  // Add error state to track API errors
  const [apiError, setApiError] = useState(null);

  // Add state for price validation errors
  const [priceErrors, setPriceErrors] = useState({
    min: false,
    max: false
  });
  
  // Function to build query parameters from filters
  const buildQueryParams = (filters) => {
    const queryParams = {};
    
    if (filters.search) queryParams.search = filters.search;
    if (filters.category) queryParams.category = filters.category;
    
    // Handle price range selection
    if (filters.price_range) {
 
      
      // Convert price range to min/max values
      switch (filters.price_range) {
        case 'under10':
          queryParams.price_max = '10';
          break;
        case 'under100':
          queryParams.price_max = '100';
          break;
        case 'under1000':
          queryParams.price_max = '1000';
          break;
        case 'over1000':
          queryParams.price_min = '1000';
          break;
        default:
          // If no specific range selected, don't add price filters
          break;
      }
    } else {
      // If no price range is selected, use the original min/max values if provided
      if (filters.price_min) queryParams.price_min = filters.price_min;
      if (filters.price_max) queryParams.price_max = filters.price_max;
    }
    
    if (filters.sort) queryParams.sort = filters.sort;
    if (filters.in_stock) queryParams.in_stock = filters.in_stock;
    if (filters.page > 1) queryParams.page = filters.page;
    
    // Add debug logging for price filters
    console.log('Price filters:', {
      price_range: filters.price_range,
      price_min: queryParams.price_min,
      price_max: queryParams.price_max
    });
    
    return queryParams;
  };
  
  // Load products based on filters
  useEffect(() => {
    const queryParams = buildQueryParams(filters);
    
    console.log('ProductListingPage: Fetching products with:', queryParams);
    dispatch(fetchProducts(queryParams))
      .unwrap()
      .then(result => {
        console.log('ProductListingPage: Products fetched successfully:', result);
        const list = Array.isArray(result?.data) ? result.data : Array.isArray(result) ? result : [];
        if (list.length === 0) {
          console.warn('ProductListingPage: No products returned from API');
        } else {
          console.log(`ProductListingPage: ${list.length} products returned`);
          // Log price range of returned products for debugging
          const priceRange = {
            min: Math.min(...list.map(p => p.price || 0)),
            max: Math.max(...list.map(p => p.price || 0))
          };
          console.log('Price range of returned products:', priceRange);
        }
      })
      .catch(error => {
        console.error('ProductListingPage: Error fetching products:', error);
      });
    
    // Clear previous errors
    setApiError(null);
    
    // Update URL with filters
    const searchParams = new URLSearchParams();
    Object.entries(queryParams).forEach(([key, value]) => {
      searchParams.append(key, value);
    });
    
    navigate({
      pathname: '/products',
      search: searchParams.toString()
    }, { replace: true });
    
  }, [dispatch, filters, navigate]);
  
  // Add this function to refresh product data when the component is focused
  useEffect(() => {
    // Function to refresh products data
    const refreshData = () => {
      // Only refresh if we already loaded products before
      if (products.length > 0) {
        console.log('Refreshing product listing data');
        const currentQueryParams = buildQueryParams(filters);
        dispatch(fetchProducts(currentQueryParams));
      }
    };

    // Add event listener for when the page becomes visible again
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        refreshData();
      }
    });

    // Add event listener for when the page is focused
    window.addEventListener('focus', refreshData);

    return () => {
      document.removeEventListener('visibilitychange', refreshData);
      window.removeEventListener('focus', refreshData); // Fix: Changed addEventListener to removeEventListener
    };
  }, [dispatch, filters, products.length]);

  // Load categories
  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);
  
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: key === 'page' ? value : 1 // Reset page when other filters change
    }));
  };
  
  // Reset errors when filters are reset
  const handleReset = () => {
    setFilters({
      search: '',
      category: '',
      price_min: '',
      price_max: '',
      price_range: '',
      sort: '-createdAt',
      in_stock: false,
      page: 1,
    });
    // Also reset price errors
    setPriceErrors({
      min: false,
      max: false
    });
  };
  
  const toggleFilterDrawer = (open) => () => {
    setFilterDrawerOpen(open);
  };
  
  // Filter panel component
  const FilterPanel = () => (
    <Card sx={{ mb: { xs: 2, md: 0 } }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Filters
          {isMobile && (
            <IconButton 
              sx={{ float: 'right' }} 
              onClick={toggleFilterDrawer(false)}
            >
              <Close />
            </IconButton>
          )}
        </Typography>
        <Divider sx={{ mb: 2 }} />
        
        {/* Categories */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" gutterBottom>Categories</Typography>
          <FormControl fullWidth size="small">
            <InputLabel>Select Category</InputLabel>
            <Select
              value={filters.category}
              label="Select Category"
              onChange={(e) => handleFilterChange('category', e.target.value)}
            >
              <MenuItem value="">All Categories</MenuItem>
              {categories.map(category => (
                <MenuItem key={category._id} value={category._id}>
                  {category.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
        
        {/* Price Range */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" gutterBottom>Price Range</Typography>
          <FormControl fullWidth size="small">
            <InputLabel>Select Price Range</InputLabel>
            <Select
              value={filters.price_range}
              label="Select Price Range"
              onChange={(e) => handleFilterChange('price_range', e.target.value)}
            >
              <MenuItem value="">All Prices</MenuItem>
              <MenuItem value="under10">Under $10</MenuItem>
              <MenuItem value="under100">Under $100</MenuItem>
              <MenuItem value="under1000">Under $1000</MenuItem>
              <MenuItem value="over1000">Over $1000</MenuItem>
            </Select>
          </FormControl>
        </Box>
        
  
        
        
        <Button 
          variant="outlined" 
          color="secondary"
          fullWidth
          onClick={handleReset}
        >
          Reset Filters
        </Button>
      </CardContent>
    </Card>
  );
  
  // Product listing skeletons for loading state
  const renderSkeletons = () => (
    Array(8).fill().map((_, index) => (
      <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
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
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Products
        {filters.search && (
          <Typography component="span" variant="subtitle1" sx={{ ml: 2 }}>
            Search results for: "{filters.search}"
          </Typography>
        )}
      </Typography>
      
      {/* Show API errors if any */}
      {apiError && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {apiError}
          <Button sx={{ ml: 2 }} size="small" onClick={() => dispatch(fetchProducts(buildQueryParams(filters)))}>
            Retry
          </Button>
        </Alert>
      )}
      
      {/* Mobile Filter Button */}
      {isMobile && (
        <Button 
          variant="outlined" 
          startIcon={<FilterList />}
          onClick={toggleFilterDrawer(true)}
          sx={{ mb: 2 }}
          fullWidth
        >
          Filter Products
        </Button>
      )}
      
      {/* Mobile Filter Drawer */}
      <Drawer
        anchor="left"
        open={filterDrawerOpen}
        onClose={toggleFilterDrawer(false)}
      >
        <Box
          sx={{ width: 250, p: 2 }}
          role="presentation"
        >
          <FilterPanel />
        </Box>
      </Drawer>
      
      <Grid container spacing={3}>
        {/* Desktop Filter Panel */}
        {!isMobile && (
          <Grid item md={3}>
            <FilterPanel />
          </Grid>
        )}
        
        {/* Product Grid */}
        <Grid item xs={12} md={9}>
          {/* Results Count */}
          <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="body2">
              {loading ? 'Loading...' : `Showing ${products.length} of ${total} products`}
            </Typography>
          </Box>
          
          {/* Products */}
          <Grid container spacing={3}>
            {loading ? (
              renderSkeletons()
            ) : products.length > 0 ? (
              products.map(product => (
                <Grid item key={product._id} xs={12} sm={6} md={4} lg={3}>
                  <ProductCard product={product} />
                </Grid>
              ))
            ) : (
              <Grid item xs={12}>
                <Box sx={{ textAlign: 'center', py: 5 }}>
                  <Typography variant="h6">
                    No products found matching your criteria.
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 2 }}>
                    {apiError ? 
                      `Error: ${apiError}` : 
                      "Try adjusting your filters or check back later for new products."}
                  </Typography>
                  <Button 
                    variant="contained" 
                    onClick={handleReset}
                    sx={{ mr: 1 }}
                  >
                    Clear Filters
                  </Button>
                  <Button 
                    variant="outlined"
                    onClick={() => dispatch(fetchProducts(buildQueryParams(filters)))}
                  >
                    Refresh Products
                  </Button>
                </Box>
              </Grid>
            )}
          </Grid>
          
          {/* Pagination */}
          {!loading && products.length > 0 && (
            <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
              <Pagination
                count={Math.ceil(total / 12)} // Assuming 12 items per page
                page={filters.page}
                onChange={(e, newPage) => handleFilterChange('page', newPage)}
                color="primary"
              />
            </Box>
          )}
        </Grid>
      </Grid>
    </Container>
  );
};

export default ProductListingPage;

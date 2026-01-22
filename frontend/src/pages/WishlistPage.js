import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchWishlist, removeFromWishlist } from '../store/slices/wishlistSlice';
import { addToCart } from '../store/slices/cartSlice';

// MUI components
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Button,
  IconButton,
  Skeleton,
  Alert,
  Snackbar,
  Divider
} from '@mui/material';

// MUI icons
import {
  Delete as DeleteIcon,
  ShoppingCart as ShoppingCartIcon,
  Favorite as FavoriteIcon
} from '@mui/icons-material';

const WishlistPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const wishlist = useSelector(state => state.wishlist);
  // Safely destructure and ensure items is always an array
  const items = Array.isArray(wishlist?.items) ? wishlist.items : [];
  const loading = wishlist?.loading || false;
  const error = wishlist?.error || null;
  const [snackbar, setSnackbar] = React.useState({ open: false, message: '', severity: 'success' });
  
  useEffect(() => {
    dispatch(fetchWishlist());
  }, [dispatch]);
  
  const handleRemoveItem = (productId) => {
    dispatch(removeFromWishlist(productId))
      .unwrap()
      .then(() => {
        setSnackbar({ 
          open: true, 
          message: 'Product removed from wishlist', 
          severity: 'success' 
        });
      })
      .catch(() => {
        setSnackbar({ 
          open: true, 
          message: 'Failed to remove product', 
          severity: 'error' 
        });
      });
  };
  
  const handleAddToCart = (product) => {
    dispatch(addToCart({ productId: product._id, quantity: 1 }))
      .unwrap()
      .then(() => {
        setSnackbar({ 
          open: true, 
          message: 'Product added to cart', 
          severity: 'success' 
        });
      })
      .catch((error) => {
        setSnackbar({ 
          open: true, 
          message: error || 'Failed to add product to cart', 
          severity: 'error' 
        });
      });
  };
  
  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };
  
  // Wishlist skeleton loader
  const renderSkeletons = () => (
    Array(4).fill().map((_, index) => (
      <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
        <Card sx={{ height: '100%' }}>
          <Skeleton variant="rectangular" height={200} />
          <CardContent>
            <Skeleton height={30} width="80%" />
            <Skeleton height={20} width="60%" />
            <Skeleton height={20} width="40%" />
          </CardContent>
          <CardActions>
            <Skeleton height={40} width="100%" />
          </CardActions>
        </Card>
      </Grid>
    ))
  );
  
  return (
    <Container sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
        <FavoriteIcon sx={{ fontSize: 30, color: 'error.main', mr: 2 }} />
        <Typography variant="h4" component="h1">
          My Wishlist
        </Typography>
      </Box>
      
      {error && (
        <Alert severity="error" sx={{ mb: 4 }}>
          {error}
        </Alert>
      )}
      
      {!loading && items.length === 0 && !error && (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <FavoriteIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h5" gutterBottom>
            Your wishlist is empty
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            Add items to your wishlist to keep track of products you're interested in.
          </Typography>
          <Button 
            variant="contained" 
            color="primary"
            onClick={() => navigate('/products')}
          >
            Explore Products
          </Button>
        </Box>
      )}
      
      <Grid container spacing={3}>
        {loading ? (
          renderSkeletons()
        ) : Array.isArray(items) ? (
          items.map(product => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={product._id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardMedia
                  component="img"
                  height="200"
                  image={product.images?.[0] || "https://via.placeholder.com/200"}
                  alt={product.name}
                  sx={{ objectFit: 'contain', p: 2, cursor: 'pointer' }}
                  onClick={() => navigate(`/products/${product._id}`)}
                />
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography gutterBottom variant="h6" component="div">
                    {product.name}
                  </Typography>
                  <Typography variant="h6" color="primary">
                    ${product.price.toFixed(2)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    {product.description?.substring(0, 100)}
                    {product.description?.length > 100 ? '...' : ''}
                  </Typography>
                </CardContent>
                <Divider />
                <CardActions>
                  <Button
                    size="small"
                    startIcon={<ShoppingCartIcon />}
                    onClick={() => handleAddToCart(product)}
                    fullWidth
                    variant="contained"
                    disabled={product.stock <= 0}
                  >
                    { 'Add to Cart' }
                  </Button>
                  <IconButton 
                    color="error" 
                    onClick={() => handleRemoveItem(product._id)}
                    aria-label="remove from wishlist"
                  >
                    <DeleteIcon />
                  </IconButton>
                </CardActions>
              </Card>
            </Grid>
          ))
        ) : (
          <Grid item xs={12}>
            <Alert severity="error">
              There was a problem loading your wishlist. Please try again.
            </Alert>
          </Grid>
        )}
      </Grid>
      
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default WishlistPage;

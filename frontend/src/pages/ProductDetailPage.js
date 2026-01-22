import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { 
  fetchProductDetails, 
  fetchRelatedProducts, 
  clearProductDetails 
} from '../store/slices/productSlice';
import { addToCart } from '../store/slices/cartSlice';

// MUI Components
import {
  Box,
  Container,
  Grid,
  Typography,
  Button,
  Card,
  CardMedia,
  Divider,
  Rating,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Paper,
  TextField,
  Chip,
  IconButton,
  Skeleton,
  Stack
} from '@mui/material';

// MUI Icons
import {
  ShoppingCart,
  Favorite,
  Share,
  Add,
  Remove
} from '@mui/icons-material';

// Custom Components
import ProductCard from '../components/ProductCard';
import ProductReviews from '../components/ProductReviews';

const ProductDetailPage = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const { product, relatedProducts, loading, error } = useSelector(state => state.products);
  const { isAuthenticated } = useSelector(state => state.auth);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState(0);
  
  useEffect(() => {
    dispatch(fetchProductDetails(id));
    
    return () => {
      dispatch(clearProductDetails());
    };
  }, [dispatch, id]);
  
  useEffect(() => {
    if (product?.category) {
      const categoryId = product.category._id || product.category.id;
      const productId = product._id || product.id;
      if (categoryId && productId) {
        dispatch(fetchRelatedProducts({ 
          categoryId, 
          productId 
        }));
      }
    }
  }, [dispatch, product]);
  
  const handleQuantityChange = (amount) => {
    const newQuantity = Math.max(1, quantity + amount);
    if (product && newQuantity <= product.stock) {
      setQuantity(newQuantity);
    }
  };
  
  const handleAddToCart = () => {
    if (product) {
      dispatch(addToCart({
        productId: product._id || product.id,
        quantity
      }));
    }
  };
  
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };
  
  if (loading) {
    return (
      <Container sx={{ py: 4 }}>
        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Skeleton variant="rectangular" height={400} />
          </Grid>
          <Grid item xs={12} md={6}>
            <Skeleton height={60} />
            <Skeleton height={30} width="60%" />
            <Skeleton height={30} width="40%" />
            <Box sx={{ mt: 2 }}>
              <Skeleton height={60} />
            </Box>
            <Box sx={{ mt: 3 }}>
              <Skeleton height={50} />
            </Box>
          </Grid>
        </Grid>
      </Container>
    );
  }
  
  if (error) {
    return (
      <Container sx={{ py: 4, textAlign: 'center' }}>
        <Typography variant="h5" color="error" gutterBottom>
          Error loading product details
        </Typography>
        <Typography variant="body1">
          {error}
        </Typography>
        <Button 
          variant="contained" 
          color="primary"
          onClick={() => navigate('/products')}
          sx={{ mt: 2 }}
        >
          Return to Products
        </Button>
      </Container>
    );
  }
  
  if (!product) {
    return (
      <Container sx={{ py: 4, textAlign: 'center' }}>
        <Typography variant="h5" gutterBottom>
          Product not found
        </Typography>
        <Button 
          variant="contained" 
          color="primary"
          onClick={() => navigate('/products')}
          sx={{ mt: 2 }}
        >
          Return to Products
        </Button>
      </Container>
    );
  }
  
  // Check if product is on sale
  const price = Number(product.price) || 0;
  const sale = Number(product.salePrice);
  const isOnSale = sale > 0 && sale < price;
  const currentPrice = isOnSale ? sale : price;
  const ratingValue = product.ratings?.average ?? product.ratingAverage ?? 0;
  const ratingCount = product.ratings?.count ?? product.ratingCount ?? 0;
  
  return (
    <Container sx={{ py: 4 }}>
      {/* Product Detail */}
      <Grid container spacing={4}>
        {/* Product Image */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardMedia
              component="img"
              image={product.images && product.images.length > 0 
                ? product.images[0] 
                : 'https://via.placeholder.com/600x400'}
              alt={product.name}
              sx={{ height: 400, objectFit: 'contain' }}
            />
          </Card>
          
          {/* Thumbnail images - would implement image gallery/slider here */}
          {product.images && product.images.length > 1 && (
            <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
              {product.images.slice(0, 4).map((img, index) => (
                <Card key={index} sx={{ width: 70, height: 70 }}>
                  <CardMedia
                    component="img"
                    image={img}
                    alt={`${product.name} ${index}`}
                    sx={{ height: '100%', objectFit: 'contain' }}
                  />
                </Card>
              ))}
            </Stack>
          )}
        </Grid>
        
        {/* Product Info */}
        <Grid item xs={12} md={6}>
          <Typography variant="h4" component="h1" gutterBottom>
            {product.name}
          </Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Rating 
              value={ratingValue} 
              precision={0.5} 
              readOnly 
            />
            <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
              ({ratingCount} reviews)
            </Typography>
          </Box>
          
          <Box sx={{ mb: 2 }}>
            {isOnSale ? (
              <>
                <Typography 
                  variant="h5" 
                  color="primary" 
                  component="span" 
                  sx={{ fontWeight: 'bold', mr: 2 }}
                >
                  ${sale.toFixed(2)}
                </Typography>
                <Typography 
                  variant="h6" 
                  color="text.secondary" 
                  component="span" 
                  sx={{ textDecoration: 'line-through' }}
                >
                  ${price.toFixed(2)}
                </Typography>
                <Chip 
                  label={`${Math.round(((product.price - product.salePrice) / product.price) * 100)}% OFF`}
                  color="secondary"
                  size="small"
                  sx={{ ml: 2 }}
                />
              </>
            ) : (
              <Typography variant="h5" color="primary" sx={{ fontWeight: 'bold' }}>
                ${price.toFixed(2)}
              </Typography>
            )}
          </Box>
          
          <Typography variant="body1" paragraph>
            {product.description}
          </Typography>
          
          <Box sx={{ mb: 3 }}>
            <Typography variant="body2" color={product.stock > 0 ? 'success.main' : 'error.main'}>
              {product.stock > 0 ? `In Stock (${product.stock} available)` : 'Out of Stock'}
            </Typography>
          </Box>
          
          {product.stock > 0 && (
            <>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Typography variant="body1" sx={{ mr: 2 }}>Quantity:</Typography>
                <IconButton 
                  size="small" 
                  onClick={() => handleQuantityChange(-1)}
                  disabled={quantity <= 1}
                >
                  <Remove />
                </IconButton>
                <TextField
                  size="small"
                  value={quantity}
                  inputProps={{ 
                    readOnly: true, 
                    style: { textAlign: 'center', width: '30px' } 
                  }}
                  sx={{ mx: 1 }}
                />
                <IconButton 
                  size="small" 
                  onClick={() => handleQuantityChange(1)}
                  disabled={quantity >= product.stock}
                >
                  <Add />
                </IconButton>
              </Box>
              
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button 
                  variant="contained" 
                  color="primary" 
                  startIcon={<ShoppingCart />}
                  size="large"
                  fullWidth
                  onClick={handleAddToCart}
                >
                  Add to Cart
                </Button>
                
              </Box>
            </>
          )}
        </Grid>
      </Grid>
      
      {/* Tabs for Details, Specs, Reviews */}
      <Box sx={{ width: '100%', mt: 6 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={activeTab} onChange={handleTabChange}>
            <Tab label="Description" />
            <Tab label="Reviews" />
          </Tabs>
        </Box>
        
        {/* Description Tab */}
        {activeTab === 0 && (
          <Box sx={{ py: 3 }}>
            <Typography variant="body1">
              {product.description}
            </Typography>
          </Box>
        )}
        
        {/* Reviews Tab */}
        {activeTab === 1 && (
          <Box sx={{ py: 3 }}>
            <ProductReviews productId={product._id || product.id} />
          </Box>
        )}
      </Box>
      
      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <Box sx={{ mt: 8 }}>
          <Typography variant="h5" component="h2" gutterBottom>
            Related Products
          </Typography>
          <Divider sx={{ mb: 3 }} />
          
          <Grid container spacing={3}>
            {relatedProducts.slice(0, 4).map(relProduct => (
              <Grid item xs={12} sm={6} md={3} key={relProduct._id}>
                <ProductCard product={relProduct} />
              </Grid>
            ))}
          </Grid>
        </Box>
      )}
    </Container>
  );
};

export default ProductDetailPage;

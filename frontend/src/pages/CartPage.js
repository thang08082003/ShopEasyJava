import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { 
  fetchCart, 
  updateCartItem, 
  removeCartItem, 
  clearCart, 
  applyCoupon 
} from '../store/slices/cartSlice';

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
  IconButton,
  TextField,
  Divider,
  Paper,
  Alert,
  Snackbar,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';

// MUI Icons
import {
  Add,
  Remove,
  Delete,
  ShoppingCart,
  NavigateNext
} from '@mui/icons-material';

const CartPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items, totalAmount, discountedAmount, coupon, loading, error } = useSelector(state => state.cart);
  const { isAuthenticated } = useSelector(state => state.auth);
  
  const [couponCode, setCouponCode] = React.useState('');
  const [showErrorSnack, setShowErrorSnack] = React.useState(false);
  
  useEffect(() => {
    dispatch(fetchCart());
  }, [dispatch]);
  
  useEffect(() => {
    if (error) {
      setShowErrorSnack(true);
    }
  }, [error]);
  
  const handleQuantityChange = (itemId, currentQuantity, change) => {
    const newQuantity = Math.max(1, currentQuantity + change);
    dispatch(updateCartItem({ itemId, quantity: newQuantity }));
  };
  
  const handleRemoveItem = (productId) => {
    dispatch(removeCartItem(productId));
  };
  
  const handleApplyCoupon = () => {
    if (couponCode.trim()) {
      dispatch(applyCoupon(couponCode));
      setCouponCode('');
    }
  };
  
  const handleCheckout = () => {
    if (isAuthenticated) {
      navigate('/checkout');
    } else {
      navigate('/login', { state: { redirect: '/checkout' } });
    }
  };
  
  const handleCloseSnack = () => {
    setShowErrorSnack(false);
  };
  
  if (loading && items.length === 0) {
    return (
      <Container sx={{ py: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Your Cart
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            {[1, 2].map(i => (
              <Card key={i} sx={{ mb: 2, display: 'flex' }}>
                <Skeleton variant="rectangular" width={120} height={120} />
                <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1, p: 2 }}>
                  <Skeleton width="60%" height={30} />
                  <Skeleton width="40%" height={20} />
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
                    <Skeleton width={100} height={40} />
                    <Box sx={{ ml: 'auto' }}>
                      <Skeleton width={80} height={30} />
                    </Box>
                  </Box>
                </Box>
              </Card>
            ))}
          </Grid>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Order Summary
                </Typography>
                <Skeleton height={20} />
                <Skeleton height={20} />
                <Skeleton height={20} />
                <Skeleton height={50} sx={{ mt: 2 }} />
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    );
  }
  
  if (items.length === 0 && !loading) {
    return (
      <Container sx={{ py: 4, textAlign: 'center' }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Your Cart is Empty
        </Typography>
        <ShoppingCart sx={{ fontSize: 100, color: 'primary.light', my: 3 }} />
        <Typography variant="body1" paragraph>
          Looks like you haven't added anything to your cart yet.
        </Typography>
        <Button 
          variant="contained" 
          color="primary" 
          size="large"
          onClick={() => navigate('/products')}
        >
          Start Shopping
        </Button>
      </Container>
    );
  }
  
  return (
    <Container sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Your Cart
      </Typography>
      
      <Grid container spacing={3}>
        {/* Cart Items */}
        <Grid item xs={12} md={8}>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Product</TableCell>
                  <TableCell align="center">Quantity</TableCell>
                  <TableCell align="right">Price</TableCell>
                  <TableCell align="right">Subtotal</TableCell>
                  <TableCell align="center">Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {items.map((item, idx) => {
                  const product = item.product || {}; // Provide default empty object if product is null
                  const rowKey = item._id || item.id || product._id || product.id || `${product.name || 'item'}-${idx}`;
                  const productId = product.id || product._id || item.productId;
                  return (
                    <TableRow key={rowKey}>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <CardMedia
                            component="img"
                            sx={{ width: 80, height: 80, objectFit: 'contain', mr: 2 }}
                            image={(product.images && product.images[0]) || "https://via.placeholder.com/80"}
                            alt={product.name || "Product"}
                          />
                          <Box>
                            <Typography variant="subtitle1" component="div">
                              {product.name || "Product Unavailable"}
                            </Typography>
                            {product.salePrice > 0 && product.salePrice < product.price ? (
                              <Box>
                                <Typography variant="subtitle2" color="primary" component="span">
                                  ${product.salePrice?.toFixed(2)}
                                </Typography>
                                <Typography 
                                  variant="body2" 
                                  color="text.secondary" 
                                  component="span"
                                  sx={{ textDecoration: 'line-through', ml: 1 }}
                                >
                                  ${product.price?.toFixed(2)}
                                </Typography>
                              </Box>
                            ) : (
                              <Typography variant="subtitle2" color="primary">
                                ${product.price?.toFixed(2) || "0.00"}
                              </Typography>
                            )}
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell align="center">
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <IconButton 
                            size="small" 
                            onClick={() => handleQuantityChange(item._id, item.quantity, -1)}
                            disabled={item.quantity <= 1}
                          >
                            <Remove />
                          </IconButton>
                          <TextField
                            size="small"
                            value={item.quantity}
                            inputProps={{ 
                              readOnly: true, 
                              style: { textAlign: 'center', width: '40px' } 
                            }}
                            sx={{ mx: 1 }}
                          />
                          <IconButton 
                            size="small" 
                            onClick={() => handleQuantityChange(item._id, item.quantity, 1)}
                          >
                            <Add />
                          </IconButton>
                        </Box>
                      </TableCell>
                      <TableCell align="right">
                        ${item.price.toFixed(2)}
                      </TableCell>
                      <TableCell align="right">
                        ${(item.price * item.quantity).toFixed(2)}
                      </TableCell>
                      <TableCell align="center">
                        <IconButton 
                          color="error"
                          onClick={() => handleRemoveItem(productId)}
                        >
                          <Delete />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
            <Button 
              variant="outlined" 
              onClick={() => navigate('/products')}
              startIcon={<ShoppingCart />}
            >
              Continue Shopping
            </Button>
            <Button 
              variant="outlined" 
              color="error" 
              onClick={() => dispatch(clearCart())}
            >
              Clear Cart
            </Button>
          </Box>
        </Grid>
        
        {/* Order Summary */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Order Summary
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Box sx={{ mb: 2 }}>
                <Grid container spacing={1}>
                  <Grid item xs={6}>
                    <Typography variant="body1">Subtotal:</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body1" align="right">${totalAmount.toFixed(2)}</Typography>
                  </Grid>
                  
                  {coupon && (
                    <>
                      <Grid item xs={6}>
                        <Typography variant="body1">Discount:</Typography>
                        <Typography variant="caption" color="success.main">({coupon.code})</Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body1" align="right" color="success.main">
                          -${(totalAmount - discountedAmount).toFixed(2)}
                        </Typography>
                      </Grid>
                    </>
                  )}
                  
                  <Grid item xs={6}>
                    <Typography variant="h6">Total:</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="h6" align="right">
                      ${(discountedAmount || totalAmount).toFixed(2)}
                    </Typography>
                  </Grid>
                </Grid>
              </Box>
              
              <Divider sx={{ mb: 2 }} />
              
              {/* Coupon Code */}
              <Box sx={{ mb: 3, display: 'flex' }}>
                <TextField
                  label="Coupon Code"
                  variant="outlined"
                  size="small"
                  fullWidth
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  sx={{ mr: 1 }}
                />
                <Button 
                  variant="outlined" 
                  onClick={handleApplyCoupon}
                >
                  Apply
                </Button>
              </Box>
              
              <Button 
                variant="contained" 
                color="primary"
                fullWidth
                size="large"
                endIcon={<NavigateNext />}
                onClick={handleCheckout}
                disabled={items.length === 0}
              >
                Proceed to Checkout
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      {/* Error Snackbar */}
      <Snackbar 
        open={showErrorSnack} 
        autoHideDuration={6000} 
        onClose={handleCloseSnack}
      >
        <Alert 
          onClose={handleCloseSnack} 
          severity="error" 
          sx={{ width: '100%' }}
        >
          {error}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default CartPage;

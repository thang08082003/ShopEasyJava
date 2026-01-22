import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Container,
  Box,
  Button,
  Typography,
  Chip,
  Paper,
  Grid,
  Card,
  CardMedia,
  CardContent,
  List,
  ListItem,
  ListItemText,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PaymentIcon from '@mui/icons-material/Payment';
import ShippingIcon from '@mui/icons-material/LocalShipping';
import { fetchOrderDetails, clearOrderDetails } from '../store/slices/orderSlice';

const OrderDetailPage = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { order, loading, error } = useSelector(state => state.orders);
  const [cancelDialog, setCancelDialog] = useState(false);

  useEffect(() => {
    if (id && id !== 'null' && id !== 'undefined') {
      dispatch(fetchOrderDetails(id));
    }

    return () => {
      dispatch(clearOrderDetails());
    };
  }, [dispatch, id]);

  if (loading) {
    return (
      <Container sx={{ py: 4 }}>
        <Typography variant="h5" gutterBottom>
          Loading...
        </Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container sx={{ py: 4 }}>
        <Typography variant="h5" gutterBottom>
          Error: {error}
        </Typography>
        <Button 
          variant="contained" 
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/orders')}
        >
          Back to Orders
        </Button>
      </Container>
    );
  }

  if (!order) {
    return (
      <Container sx={{ py: 4 }}>
        <Typography variant="h5" gutterBottom>
          Order not found
        </Typography>
        <Button 
          variant="contained" 
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/orders')}
        >
          Back to Orders
        </Button>
      </Container>
    );
  }

  const orderDate = order?.createdAt ? new Date(order.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }) : 'N/A';

  const isCancellable = order?.orderStatus === 'pending';

  return (
    <Container sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Button 
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/orders')}
            sx={{ mr: 2 }}
          >
            Back
          </Button>
          <Typography variant="h4" component="h1">
            Order Details
          </Typography>
        </Box>
        <Chip
          label={order.orderStatus}
          color={order?.orderStatus ? 'primary' : 'default'}
        />
      </Box>
      
      <Paper sx={{ p: 3, mb: 4 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="body2" color="text.secondary">
              Order ID
            </Typography>
            <Typography variant="body1">
              #{(() => {
                const id = order?._id || order?.id;
                return typeof id === 'string'
                  ? id.substring(Math.max(0, id.length - 8)).toUpperCase()
                  : 'N/A';
              })()}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="body2" color="text.secondary">
              Order Date
            </Typography>
            <Typography variant="body1">
              {orderDate}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="body2" color="text.secondary">
              Payment Status
            </Typography>
            <Chip
              label={order?.paymentStatus || 'N/A'}
              color={order?.paymentStatus === 'completed' ? 'success' : 'warning'}
              size="small"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="body2" color="text.secondary">
              Payment Method
            </Typography>
            <Typography variant="body1" sx={{ display: 'flex', alignItems: 'center' }}>
              <PaymentIcon fontSize="small" sx={{ mr: 1 }} />
              {order?.paymentMethod || 'N/A'}
            </Typography>
          </Grid>
        </Grid>
      </Paper>
      
      <Grid container spacing={4}>
        <Grid item xs={12} md={8}>
          <Typography variant="h6" gutterBottom>
            Order Items
          </Typography>
          {order?.items?.map((item, idx) => (
            <Card key={item._id || item.id || idx} sx={{ display: 'flex', mb: 2 }}>
              <CardMedia
                component="img"
                sx={{ width: 100, height: 100, objectFit: 'contain' }}
                image={item?.product?.images?.[0] || "https://via.placeholder.com/100"}
                alt={item?.product?.name || 'Product Name'}
              />
              <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                <CardContent sx={{ flex: '1 0 auto' }}>
                  <Typography component="div" variant="h6">
                    {item?.product?.name || 'Product Name'}
                  </Typography>
                  <Typography variant="subtitle1" color="text.secondary" component="div">
                    Quantity: {item?.quantity || 0}
                  </Typography>
                  <Typography variant="subtitle1" component="div">
                    ${item?.price?.toFixed(2) || '0.00'} each
                  </Typography>
                </CardContent>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', p: 2 }}>
                <Typography variant="h6">
                  ${(item?.price * item?.quantity).toFixed(2) || '0.00'}
                </Typography>
              </Box>
            </Card>
          ))}
          
          <Paper sx={{ p: 3, mt: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <ShippingIcon sx={{ mr: 1, color: 'primary.main' }} />
              <Typography variant="h6">
                Shipping Address
              </Typography>
            </Box>
            <Typography>
              {order?.shippingAddress?.street || 'N/A'}
            </Typography>
            <Typography>
              {order?.shippingAddress?.city}, {order?.shippingAddress?.state} {order?.shippingAddress?.zipCode}
            </Typography>
            <Typography>
              {order?.shippingAddress?.country || 'N/A'}
            </Typography>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Order Summary
            </Typography>
            <List disablePadding>
              <ListItem sx={{ py: 1, px: 0 }}>
                <ListItemText primary="Subtotal" />
                <Typography variant="body1">
                  ${order?.totalAmount?.toFixed(2) || '0.00'}
                </Typography>
              </ListItem>
              
              <ListItem sx={{ py: 1, px: 0 }}>
                <ListItemText primary="Shipping" />
                <Typography variant="body1">
                  ${order?.shippingFee?.toFixed(2) || '0.00'}
                </Typography>
              </ListItem>
              
              <ListItem sx={{ py: 1, px: 0 }}>
                <ListItemText primary="Tax" />
                <Typography variant="body1">
                  ${order?.tax?.toFixed(2) || '0.00'}
                </Typography>
              </ListItem>
              
              <Divider />
              
              <ListItem sx={{ py: 1, px: 0 }}>
                <ListItemText primary="Total" />
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                  ${order?.grandTotal?.toFixed(2) || '0.00'}
                </Typography>
              </ListItem>
            </List>
            
            {isCancellable && (
              <Button
                variant="outlined"
                color="error"
                fullWidth
                sx={{ mt: 3 }}
                onClick={() => setCancelDialog(true)}
              >
                Cancel Order
              </Button>
            )}
          </Paper>
        </Grid>
      </Grid>
      
      {/* Cancel Order Dialog */}
      <Dialog
        open={cancelDialog}
        onClose={() => setCancelDialog(false)}
      >
        <DialogTitle>Cancel Order</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to cancel this order? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCancelDialog(false)}>No, Keep Order</Button>
          <Button 
            onClick={() => dispatch(clearOrderDetails())} 
            color="error" 
            autoFocus
          >
            Yes, Cancel Order
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default OrderDetailPage;
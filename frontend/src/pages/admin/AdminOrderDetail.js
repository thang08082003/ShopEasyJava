import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api/axiosConfig';

// MUI components
import {
  Box,
  Typography,
  Paper,
  Grid,
  Chip,
  Button,
  Card,
  CardContent,
  CardMedia,
  Divider,
  List,
  ListItem,
  ListItemText,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  IconButton
} from '@mui/material';

// MUI icons
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  LocalShipping as ShippingIcon,
  Receipt as ReceiptIcon,
  Home as HomeIcon,
  Payment as PaymentIcon
} from '@mui/icons-material';

const statusColors = {
  'pending': 'warning',
  'processing': 'info',
  'shipped': 'secondary',
  'delivered': 'success',
  'cancelled': 'error'
};

const paymentStatusColors = {
  'pending': 'warning',
  'completed': 'success',
  'failed': 'error',
  'refunded': 'info'
};

const AdminOrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusUpdateLoading, setStatusUpdateLoading] = useState(false);
  
  // Status update dialog
  const [statusDialog, setStatusDialog] = useState(false);
  const [newStatus, setNewStatus] = useState('');

  const shortId = (orderLike) => {
    const rawId = orderLike?._id || orderLike?.id;
    if (typeof rawId === 'string') {
      return rawId.substring(Math.max(0, rawId.length - 8)).toUpperCase();
    }
    if (typeof rawId === 'number') {
      return String(rawId).padStart(8, '0');
    }
    return 'UNKNOWN';
  };
  
  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/api/orders/${id}`);
        const payload = response.data?.data || response.data;
        setOrder(payload);
        if (payload) {
          setNewStatus(payload.orderStatus);
        }
        setError(null);
      } catch (err) {
        console.error('Error fetching order details:', err);
        setError('Error loading order details: ' + (err.response?.data?.message || err.message));
      } finally {
        setLoading(false);
      }
    };
    
    fetchOrderDetails();
  }, [id]);
  
  const handleUpdateStatus = async () => {
    if (!order || !newStatus) return;
    
    try {
      setStatusUpdateLoading(true);
      await api.put(`/api/orders/${id}`, { orderStatus: newStatus });
      
      // Update local state
      setOrder({
        ...order,
        orderStatus: newStatus
      });
      
      setStatusDialog(false);
    } catch (err) {
      console.error('Error updating order status:', err);
      setError('Error updating order status: ' + (err.response?.data?.message || err.message));
    } finally {
      setStatusUpdateLoading(false);
    }
  };
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }
  
  if (error) {
    return (
      <Box sx={{ py: 4 }}>
        <Button 
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/admin/orders')}
          sx={{ mb: 2 }}
        >
          Back to Orders
        </Button>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }
  
  if (!order) {
    return (
      <Box sx={{ py: 4 }}>
        <Button 
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/admin/orders')}
          sx={{ mb: 2 }}
        >
          Back to Orders
        </Button>
        <Alert severity="warning">Order not found</Alert>
      </Box>
    );
  }
  
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <IconButton onClick={() => navigate('/admin/orders')} sx={{ mr: 1 }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h5" component="h1">
            Order #{shortId(order)}
          </Typography>
        </Box>
        
        <Button 
          variant="contained" 
          startIcon={<EditIcon />}
          onClick={() => setStatusDialog(true)}
        >
          Update Status
        </Button>
      </Box>
      
      {/* Order Summary Card */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="body2" color="text.secondary">Order Date</Typography>
            <Typography variant="body1">{formatDate(order.createdAt)}</Typography>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="body2" color="text.secondary">Status</Typography>
            <Chip 
              label={order.orderStatus} 
              color={statusColors[order.orderStatus] || 'default'}
              size="small"
            />
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="body2" color="text.secondary">Payment Status</Typography>
            <Chip 
              label={order.paymentStatus} 
              color={paymentStatusColors[order.paymentStatus] || 'default'}
              size="small"
            />
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="body2" color="text.secondary">Total Amount</Typography>
            <Typography variant="h6">${order.grandTotal?.toFixed(2) || '0.00'}</Typography>
          </Grid>
        </Grid>
      </Paper>
      
      {/* Main content */}
      <Grid container spacing={3}>
        {/* Left column - Order Items */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              <ReceiptIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
              Order Items
            </Typography>
            
            {order.items?.map((item) => (
              <Card key={item._id} variant="outlined" sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex' }}>
                  <CardMedia
                    component="img"
                    sx={{ width: 100, height: 100, objectFit: 'contain' }}
                    image={item.product?.images?.[0] || "https://via.placeholder.com/100"}
                    alt={item.product?.name || 'Product'}
                  />
                  <CardContent sx={{ flex: '1 0 auto' }}>
                    <Typography component="div" variant="h6">
                      {item.product?.name || 'Product Name'}
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        Quantity: {item.quantity}
                      </Typography>
                      <Typography variant="body1">
                        ${(item.price * item.quantity).toFixed(2)}
                      </Typography>
                    </Box>
                  </CardContent>
                </Box>
              </Card>
            ))}
          </Paper>
          
          {/* Shipping Information */}
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              <ShippingIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
              Shipping Information
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Card variant="outlined" sx={{ mb: 2 }}>
                  <CardContent>
                    <Typography variant="subtitle1" gutterBottom>
                      <HomeIcon sx={{ verticalAlign: 'middle', mr: 1, fontSize: 'small' }} />
                      Shipping Address
                    </Typography>
                    
                    <Typography variant="body2" component="div">
                      {order.shippingAddress?.street}<br />
                      {order.shippingAddress?.city}, {order.shippingAddress?.state} {order.shippingAddress?.zipCode}<br />
                      {order.shippingAddress?.country}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
        
        {/* Right column - Order Summary */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              <PaymentIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
              Payment Details
            </Typography>
            
            <List disablePadding>
              <ListItem sx={{ py: 1, px: 0 }}>
                <ListItemText primary="Subtotal" />
                <Typography variant="body1">
                  ${order.totalAmount?.toFixed(2) || '0.00'}
                </Typography>
              </ListItem>
              
              <ListItem sx={{ py: 1, px: 0 }}>
                <ListItemText primary="Shipping Fee" />
                <Typography variant="body1">
                  ${order.shippingFee?.toFixed(2) || '0.00'}
                </Typography>
              </ListItem>
              
              <ListItem sx={{ py: 1, px: 0 }}>
                <ListItemText primary="Tax" />
                <Typography variant="body1">
                  ${order.tax?.toFixed(2) || '0.00'}
                </Typography>
              </ListItem>
              
              <Divider />
              
              <ListItem sx={{ py: 1, px: 0 }}>
                <ListItemText primary="Total" />
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                  ${order.grandTotal?.toFixed(2) || '0.00'}
                </Typography>
              </ListItem>
              
              <ListItem sx={{ py: 1, px: 0 }}>
                <ListItemText primary="Payment Method" />
                <Typography variant="body1">
                  {order.paymentMethod || 'N/A'}
                </Typography>
              </ListItem>
            </List>
            
            {order.notes && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" gutterBottom>Order Notes:</Typography>
                <Typography variant="body2">{order.notes}</Typography>
              </Box>
            )}
          </Paper>
          
          {/* Order Timeline / History */}
          <Paper sx={{ p: 3, mt: 3 }}>
            <Typography variant="h6" gutterBottom>Order Timeline</Typography>
            
            <List dense>
              {order.statusHistory && order.statusHistory.length > 0 ? (
                order.statusHistory.map((status, index) => (
                  <ListItem key={index} disableGutters>
                    <ListItemText
                      primary={status.status}
                      secondary={formatDate(status.date)}
                    />
                  </ListItem>
                ))
              ) : (
                <>
                  <ListItem disableGutters>
                    <ListItemText 
                      primary="Order Created" 
                      secondary={formatDate(order.createdAt)} 
                    />
                  </ListItem>
                  {order.updatedAt && order.updatedAt !== order.createdAt && (
                    <ListItem disableGutters>
                      <ListItemText 
                        primary={`Status updated to: ${order.orderStatus}`} 
                        secondary={formatDate(order.updatedAt)} 
                      />
                    </ListItem>
                  )}
                </>
              )}
            </List>
          </Paper>
        </Grid>
      </Grid>
      
      {/* Status Update Dialog */}
      <Dialog open={statusDialog} onClose={() => setStatusDialog(false)}>
        <DialogTitle>Update Order Status</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 1 }}>
            <InputLabel>Status</InputLabel>
            <Select 
              value={newStatus} 
              onChange={(e) => setNewStatus(e.target.value)}
              label="Status"
            >
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="processing">Processing</MenuItem>
              <MenuItem value="shipped">Shipped</MenuItem>
              <MenuItem value="delivered">Delivered</MenuItem>
              <MenuItem value="cancelled">Cancelled</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setStatusDialog(false)}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={handleUpdateStatus}
            disabled={statusUpdateLoading}
          >
            {statusUpdateLoading ? <CircularProgress size={24} /> : 'Update'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminOrderDetail;

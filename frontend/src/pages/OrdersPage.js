import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchOrders } from '../store/slices/orderSlice';

// MUI components
import {
  Box,
  Container,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Chip,
  Skeleton
} from '@mui/material';

// MUI icons
import {
  Visibility as VisibilityIcon,
  Receipt as ReceiptIcon
} from '@mui/icons-material';

// Order status chip colors
const statusColors = {
  'pending': 'warning',
  'processing': 'info',
  'shipped': 'secondary',
  'delivered': 'success',
  'cancelled': 'error'
};

// Payment status chip colors
const paymentStatusColors = {
  'pending': 'warning',
  'completed': 'success',
  'failed': 'error',
  'refunded': 'info'
};

const OrdersPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { orders, loading, error } = useSelector(state => state.orders);
  
  useEffect(() => {
    dispatch(fetchOrders());
  }, [dispatch]);
  
  const handleViewOrder = (orderId) => {
    navigate(`/orders/${orderId}`);
  };
  
  // Skeleton loader for orders
  const renderSkeletons = () => (
    Array(5).fill().map((_, index) => (
      <TableRow key={index}>
        <TableCell><Skeleton /></TableCell>
        <TableCell><Skeleton /></TableCell>
        <TableCell><Skeleton /></TableCell>
        <TableCell><Skeleton /></TableCell>
        <TableCell><Skeleton /></TableCell>
        <TableCell><Skeleton width={100} /></TableCell>
      </TableRow>
    ))
  );
  
  return (
    <Container sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
        <ReceiptIcon sx={{ mr: 2, fontSize: 30, color: 'primary.main' }} />
        <Typography variant="h4" component="h1">
          My Orders
        </Typography>
      </Box>
      
      {error && (
        <Box sx={{ mb: 4 }}>
          <Typography color="error">{error}</Typography>
          <Button 
            variant="contained" 
            onClick={() => dispatch(fetchOrders())}
            sx={{ mt: 2 }}
          >
            Try Again
          </Button>
        </Box>
      )}
      
      {!error && orders.length === 0 && !loading && (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" gutterBottom>
            No Orders Yet
          </Typography>
          <Typography variant="body1" paragraph>
            You haven't placed any orders yet. Start shopping to place your first order.
          </Typography>
          <Button 
            variant="contained" 
            color="primary"
            onClick={() => navigate('/products')}
          >
            Browse Products
          </Button>
        </Paper>
      )}
      
      {(orders.length > 0 || loading) && (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Order ID</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Total</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Payment</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                renderSkeletons()
              ) : (
                orders.map((order, idx) => {
                  const id = order?._id || order?.id;
                  const shortId = typeof id === 'string' ? id.substring(Math.max(0, id.length - 8)).toUpperCase() : 'N/A';
                  const total = Number(order?.grandTotal || order?.finalAmount || 0);
                  return (
                  <TableRow key={id ?? idx}>
                    <TableCell>
                      {shortId}
                    </TableCell>
                    <TableCell>
                      {new Date(order.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      ${total.toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={order.orderStatus}
                        color={statusColors[order.orderStatus] || 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={order.paymentStatus}
                        color={paymentStatusColors[order.paymentStatus] || 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Button
                        startIcon={<VisibilityIcon />}
                        onClick={() => handleViewOrder(id)}
                        size="small"
                      >
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Container>
  );
};

export default OrdersPage;

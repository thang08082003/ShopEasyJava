import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axiosConfig';
import orderAPI from '../../api/orderAPI';

// MUI components
import {
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  IconButton,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Alert,
  CircularProgress,
  Menu,
  Tooltip,
  TextField
} from '@mui/material';

// MUI icons
import {
  MoreVert as MoreVertIcon,
  Visibility as VisibilityIcon,
  LocalShipping as ShippingIcon,
  Payment as PaymentIcon,
  FilterList as FilterListIcon
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

const AdminOrders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Pagination state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [total, setTotal] = useState(0);

  // Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Action menu state
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Update status dialog state
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [statusUpdateLoading, setStatusUpdateLoading] = useState(false);

  // Add new state for payment status dialog
  const [paymentStatusDialog, setPaymentStatusDialog] = useState(false);
  const [paymentStatusUpdateLoading, setPaymentStatusUpdateLoading] = useState(false);
  const [newPaymentStatus, setNewPaymentStatus] = useState('');

  // Define fetchOrders with useCallback to prevent infinite loops
  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      let response;

      if (startDate && endDate) {
        response = await orderAPI.getOrdersByDateRange(startDate, endDate, {
          page: page + 1,
          limit: rowsPerPage
        });
      } else {
        const params = {
          page: page + 1,
          limit: rowsPerPage
        };

        if (searchTerm) params.search = searchTerm;
        if (orderStatusFilter) params.orderStatus = orderStatusFilter;
        if (paymentStatusFilter) params.paymentStatus = paymentStatusFilter;

        response = await api.get('/api/orders', { params });
      }

      const payload = Array.isArray(response.data)
        ? response.data
        : (response.data?.data || []);

      setOrders(payload.map(o => ({ _id: o._id || o.id, ...o })));
      setTotal(response.data?.total ?? payload.length ?? 0);
      setError(null);
    } catch (err) {
      setError('Failed to fetch orders: ' + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, searchTerm, orderStatusFilter, paymentStatusFilter, startDate, endDate]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Handle page change
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  // Handle rows per page change
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Handle action menu
  const handleOpenMenu = (event, order) => {
    setMenuAnchorEl(event.currentTarget);
    setSelectedOrder(order);
  };

  const handleCloseMenu = () => {
    setMenuAnchorEl(null);
  };

  // Handle status update dialog
  const handleOpenStatusDialog = () => {
    handleCloseMenu();
    if (selectedOrder) {
      setNewStatus(selectedOrder.orderStatus);
      setStatusDialogOpen(true);
    }
  };

  const handleUpdateStatus = async () => {
    if (selectedOrder && newStatus) {
      setStatusUpdateLoading(true);
      try {
        await api.put(`/api/orders/${selectedOrder._id}`, {
          orderStatus: newStatus
        });

        // Refresh the data after update
        fetchOrders();
        setStatusDialogOpen(false);
        setSelectedOrder(null);
      } catch (err) {
        setError('Failed to update order status: ' + (err.response?.data?.error || err.message));
      } finally {
        setStatusUpdateLoading(false);
      }
    }
  };

  // Handle payment status update dialog
  const handleOpenPaymentStatusDialog = () => {
    handleCloseMenu();
    if (selectedOrder) {
      setNewPaymentStatus(selectedOrder.paymentStatus);
      setPaymentStatusDialog(true);
    }
  };

  const handleUpdatePaymentStatus = async () => {
    if (selectedOrder && newPaymentStatus) {
      setPaymentStatusUpdateLoading(true);
      try {
        await api.put(`/api/orders/${selectedOrder._id}`, {
          paymentStatus: newPaymentStatus
        });

        // Update local state
        setOrders(orders.map(order =>
          order._id === selectedOrder._id
            ? { ...order, paymentStatus: newPaymentStatus }
            : order
        ));
        setPaymentStatusDialog(false);
        setSelectedOrder(null);
      } catch (err) {
        setError('Failed to update payment status: ' + (err.response?.data?.error || err.message));
      } finally {
        setPaymentStatusUpdateLoading(false);
      }
    }
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

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

  return (
    <>
      <Typography variant="h4" component="h1" gutterBottom>
        Orders
      </Typography>
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      

      {/* Orders Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Order ID</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Customer</TableCell>
              <TableCell>Total</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Payment</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              Array(rowsPerPage).fill().map((_, index) => (
                <TableRow key={index}>
                  <TableCell colSpan={7} align="center">
                    <CircularProgress size={20} />
                  </TableCell>
                </TableRow>
              ))
            ) : orders.length > 0 ? (
              orders.map((order, idx) => {
                const id = order._id || order.id;
                const shortId = typeof id === 'string'
                  ? id.substring(Math.max(0, id.length - 8)).toUpperCase()
                  : id ?? `ROW-${idx + 1}`;
                const amount = Number(order.grandTotal || order.finalAmount || order.totalAmount || 0);

                return (
                <TableRow key={id ?? idx} hover>
                  <TableCell>
                    <Typography variant="body2" fontWeight="medium">
                      #{shortId}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {order.createdAt ? formatDate(order.createdAt) : '—'}
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{order.user?.name || 'Unknown'}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {order.user?.email || ''}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight="medium">
                      ${Number.isFinite(amount) ? amount.toFixed(2) : '0.00'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={order.orderStatus || 'pending'}
                      color={statusColors[order.orderStatus] || 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={order.paymentStatus || 'pending'}
                      color={paymentStatusColors[order.paymentStatus] || 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Tooltip title="View Details">
                      <IconButton
                        size="small"
                        onClick={() => navigate(`/admin/orders/${id}`)}
                      >
                        <VisibilityIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <IconButton
                      size="small"
                      onClick={(e) => handleOpenMenu(e, order)}
                    >
                      <MoreVertIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  <Typography variant="body1" sx={{ py: 2 }}>
                    No orders found
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={total}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </TableContainer>

      {/* Action Menu */}
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleCloseMenu}
      >
        <MenuItem onClick={() => navigate(`/admin/orders/${selectedOrder?._id || selectedOrder?.id}`)}>
          <VisibilityIcon fontSize="small" sx={{ mr: 1 }} />
          View Details
        </MenuItem>
        <MenuItem onClick={handleOpenStatusDialog}>
          <ShippingIcon fontSize="small" sx={{ mr: 1 }} />
          Update Status
        </MenuItem>
        <MenuItem onClick={handleOpenPaymentStatusDialog}>
          <PaymentIcon fontSize="small" sx={{ mr: 1 }} />
          Update Payment Status
        </MenuItem>
      </Menu>

      {/* Status Update Dialog */}
      <Dialog open={statusDialogOpen} onClose={() => setStatusDialogOpen(false)}>
        <DialogTitle>Update Order Status</DialogTitle>
        <DialogContent>
          <Typography variant="body2" gutterBottom>
            Order #{shortId(selectedOrder)}
          </Typography>
          <FormControl fullWidth sx={{ mt: 2 }}>
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
          <Button onClick={() => setStatusDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleUpdateStatus}
            disabled={statusUpdateLoading}
          >
            {statusUpdateLoading ? <CircularProgress size={24} /> : 'Update'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Payment Status Update Dialog */}
      <Dialog open={paymentStatusDialog} onClose={() => setPaymentStatusDialog(false)}>
        <DialogTitle>Update Payment Status</DialogTitle>
        <DialogContent>
          <Typography variant="body2" gutterBottom>
            Order #{shortId(selectedOrder)}
          </Typography>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Payment Status</InputLabel>
            <Select
              value={newPaymentStatus}
              onChange={(e) => setNewPaymentStatus(e.target.value)}
              label="Payment Status"
            >
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="completed">Completed</MenuItem>
              <MenuItem value="failed">Failed</MenuItem>
              <MenuItem value="refunded">Refunded</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPaymentStatusDialog(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleUpdatePaymentStatus}
            disabled={paymentStatusUpdateLoading}
          >
            {paymentStatusUpdateLoading ? <CircularProgress size={24} /> : 'Update'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default AdminOrders;
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Chip,
  Container,
  Grid,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
} from '@mui/icons-material';
import { getCoupons, deleteCoupon, resetCouponState } from '../../store/slices/adminCouponSlice';
import Loader from '../../components/Loader';
import Message from '../../components/Message';
import { formatDate } from '../../utils/formatters';

const CouponListPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedCouponId, setSelectedCouponId] = useState(null);

  // Make sure this destructuring matches the state structure in adminCouponSlice
  const { coupons, loading, error, success } = useSelector((state) => state.adminCoupons);

  useEffect(() => {
    dispatch(getCoupons());
  }, [dispatch]);

  useEffect(() => {
    if (success) {
      dispatch(resetCouponState());
    }
  }, [success, dispatch]);

  const handleCreateCoupon = () => {
    navigate('/admin/coupons/create');
  };

  const handleEditCoupon = (id) => {
    navigate(`/admin/coupons/${id}/edit`);
  };

  const handleDeleteClick = (id) => {
    setSelectedCouponId(id);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    dispatch(deleteCoupon(selectedCouponId));
    setDeleteDialogOpen(false);
  };

  const handleCancelDelete = () => {
    setDeleteDialogOpen(false);
    setSelectedCouponId(null);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography component="h1" variant="h5">
                Coupons
              </Typography>
              <Button
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
                onClick={handleCreateCoupon}
              >
                Create Coupon
              </Button>
            </Box>

            {loading ? (
              <Loader />
            ) : error ? (
              <Message severity="error">{error}</Message>
            ) : (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Code</TableCell>
                      <TableCell>Type</TableCell>
                      <TableCell>Amount</TableCell>
                      <TableCell>Min Purchase</TableCell>
                      <TableCell>Valid Until</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell align="right">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {coupons.map((coupon) => (
                      <TableRow key={coupon._id}>
                        <TableCell>{coupon.code}</TableCell>
                        <TableCell>
                          {coupon.discountType === 'percentage' ? 'Percentage' : 'Fixed'}
                        </TableCell>
                        <TableCell>
                          {coupon.discountType === 'percentage'
                            ? `${coupon.discountAmount}%`
                            : `$${coupon.discountAmount.toFixed(2)}`}
                        </TableCell>
                        <TableCell>${coupon.minPurchase.toFixed(2)}</TableCell>
                        <TableCell>{formatDate(coupon.endDate)}</TableCell>
                        <TableCell>
                          <Chip
                            label={coupon.isActive ? 'Active' : 'Inactive'}
                            color={coupon.isActive ? 'success' : 'default'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell align="right">
                          <IconButton
                            color="primary"
                            onClick={() => handleEditCoupon(coupon._id)}
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton
                            color="error"
                            onClick={() => handleDeleteClick(coupon._id)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={handleCancelDelete}>
        <DialogTitle>Delete Coupon</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this coupon? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelDelete}>Cancel</Button>
          <Button onClick={handleConfirmDelete} color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default CouponListPage;

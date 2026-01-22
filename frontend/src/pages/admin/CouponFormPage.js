import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Button,
  Container,
  FormControl,
  FormControlLabel,
  FormHelperText,
  Grid,
  InputAdornment,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Switch,
  TextField,
  Typography,
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import {
  createCoupon,
  getCouponDetails,
  updateCoupon,
  resetCouponState,
  clearCouponDetails,
} from '../../store/slices/adminCouponSlice';
import Loader from '../../components/Loader';
import Message from '../../components/Message';

const CouponFormPage = () => {
  const { id } = useParams();
  const isEditMode = Boolean(id);
  
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    code: '',
    description: '',
    discountType: 'percentage',
    discountAmount: '',
    minPurchase: 0,
    maxDiscount: '',
    startDate: new Date(),
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Default: 1 week from now
    isActive: true,
    usageLimit: '',
    appliedCategories: [],
    appliedProducts: [],
  });
  
  const [formErrors, setFormErrors] = useState({});
  
  const { coupon, loading, error, success } = useSelector((state) => state.adminCoupons);
  
  useEffect(() => {
    if (isEditMode) {
      dispatch(getCouponDetails(id));
    } else {
      dispatch(clearCouponDetails());
    }
    
    return () => {
      dispatch(resetCouponState());
    };
  }, [dispatch, id, isEditMode]);
  
  useEffect(() => {
    if (isEditMode && coupon) {
      setFormData({
        code: coupon.code || '',
        description: coupon.description || '',
        discountType: coupon.discountType || 'percentage',
        discountAmount: coupon.discountAmount || '',
        minPurchase: coupon.minPurchase || 0,
        maxDiscount: coupon.maxDiscount !== null ? coupon.maxDiscount : '',
        startDate: new Date(coupon.startDate) || new Date(),
        endDate: new Date(coupon.endDate) || new Date(),
        isActive: coupon.isActive !== undefined ? coupon.isActive : true,
        usageLimit: coupon.usageLimit !== null ? coupon.usageLimit : '',
        appliedCategories: coupon.appliedCategories || [],
        appliedProducts: coupon.appliedProducts || [],
      });
    }
  }, [coupon, isEditMode]);
  
  useEffect(() => {
    if (success) {
      navigate('/admin/coupons');
    }
  }, [success, navigate]);
  
  const validateForm = () => {
    const errors = {};
    
    if (!formData.code.trim()) {
      errors.code = 'Coupon code is required';
    }
    
    if (!formData.description.trim()) {
      errors.description = 'Description is required';
    }
    
    if (!formData.discountAmount || formData.discountAmount <= 0) {
      errors.discountAmount = 'Discount amount must be greater than 0';
    }
    
    if (formData.discountType === 'percentage' && formData.discountAmount > 100) {
      errors.discountAmount = 'Percentage discount cannot exceed 100%';
    }
    
    if (formData.minPurchase < 0) {
      errors.minPurchase = 'Minimum purchase cannot be negative';
    }
    
    if (formData.maxDiscount !== '' && formData.maxDiscount <= 0) {
      errors.maxDiscount = 'Maximum discount must be greater than 0';
    }
    
    if (formData.usageLimit !== '' && formData.usageLimit <= 0) {
      errors.usageLimit = 'Usage limit must be greater than 0';
    }
    
    if (formData.startDate >= formData.endDate) {
      errors.endDate = 'End date must be after start date';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };
  
  const handleDateChange = (name, date) => {
    setFormData({
      ...formData,
      [name]: date,
    });
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    const couponData = {
      ...formData,
      // Convert empty strings to null for nullable fields
      maxDiscount: formData.maxDiscount === '' ? null : Number(formData.maxDiscount),
      usageLimit: formData.usageLimit === '' ? null : Number(formData.usageLimit),
    };
    
    if (isEditMode) {
      dispatch(updateCoupon({ id, couponData }));
    } else {
      dispatch(createCoupon(couponData));
    }
  };
  
  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Paper sx={{ p: 3 }}>
          <Typography component="h1" variant="h5" sx={{ mb: 3 }}>
            {isEditMode ? 'Edit Coupon' : 'Create Coupon'}
          </Typography>
          
          {loading ? (
            <Loader />
          ) : error ? (
            <Message severity="error">{error}</Message>
          ) : (
            <Box component="form" onSubmit={handleSubmit}>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    required
                    fullWidth
                    label="Coupon Code"
                    name="code"
                    value={formData.code}
                    onChange={handleInputChange}
                    error={!!formErrors.code}
                    helperText={formErrors.code}
                    disabled={isEditMode}
                    inputProps={{ maxLength: 20 }}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Discount Type</InputLabel>
                    <Select
                      name="discountType"
                      value={formData.discountType}
                      onChange={handleInputChange}
                      label="Discount Type"
                    >
                      <MenuItem value="percentage">Percentage</MenuItem>
                      <MenuItem value="fixed">Fixed Amount</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    required
                    fullWidth
                    label="Discount Amount"
                    name="discountAmount"
                    type="number"
                    value={formData.discountAmount}
                    onChange={handleInputChange}
                    error={!!formErrors.discountAmount}
                    helperText={formErrors.discountAmount}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          {formData.discountType === 'percentage' ? '%' : '$'}
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Minimum Purchase"
                    name="minPurchase"
                    type="number"
                    value={formData.minPurchase}
                    onChange={handleInputChange}
                    error={!!formErrors.minPurchase}
                    helperText={formErrors.minPurchase}
                    InputProps={{
                      startAdornment: <InputAdornment position="start">$</InputAdornment>,
                    }}
                  />
                </Grid>
                
                {formData.discountType === 'percentage' && (
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Maximum Discount (Optional)"
                      name="maxDiscount"
                      type="number"
                      value={formData.maxDiscount}
                      onChange={handleInputChange}
                      error={!!formErrors.maxDiscount}
                      helperText={formErrors.maxDiscount || 'Leave empty for no limit'}
                      InputProps={{
                        startAdornment: <InputAdornment position="start">$</InputAdornment>,
                      }}
                    />
                  </Grid>
                )}
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Usage Limit (Optional)"
                    name="usageLimit"
                    type="number"
                    value={formData.usageLimit}
                    onChange={handleInputChange}
                    error={!!formErrors.usageLimit}
                    helperText={formErrors.usageLimit || 'Leave empty for unlimited uses'}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    required
                    fullWidth
                    label="Description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    error={!!formErrors.description}
                    helperText={formErrors.description}
                    multiline
                    rows={3}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <DateTimePicker
                    label="Start Date"
                    value={formData.startDate}
                    onChange={(date) => handleDateChange('startDate', date)}
                    renderInput={(params) => <TextField {...params} fullWidth />}
                  />
                  {formErrors.startDate && (
                    <FormHelperText error>{formErrors.startDate}</FormHelperText>
                  )}
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <DateTimePicker
                    label="End Date"
                    value={formData.endDate}
                    onChange={(date) => handleDateChange('endDate', date)}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        fullWidth
                        error={!!formErrors.endDate}
                        helperText={formErrors.endDate}
                      />
                    )}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.isActive}
                        onChange={handleInputChange}
                        name="isActive"
                        color="primary"
                      />
                    }
                    label="Active"
                  />
                </Grid>
                
                <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                  <Button
                    type="button"
                    variant="outlined"
                    onClick={() => navigate('/admin/coupons')}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" variant="contained" color="primary">
                    {isEditMode ? 'Update' : 'Create'}
                  </Button>
                </Grid>
              </Grid>
            </Box>
          )}
        </Paper>
      </Container>
    </LocalizationProvider>
  );
};

export default CouponFormPage;

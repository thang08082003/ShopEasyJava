import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCart } from '../store/slices/cartSlice';

// Order creation API
import orderAPI from '../api/orderAPI';

// Formik and Yup for form handling and validation
import { useFormik } from 'formik';
import * as Yup from 'yup';

// MUI components
import {
  Box,
  Container,
  Paper,
  Typography,
  Stepper,
  Step,
  StepLabel,
  Grid,
  TextField,
  FormControl,
  FormControlLabel,
  FormLabel,
  Radio,
  RadioGroup,
  Button,
  Divider,
  List,
  ListItem,
  ListItemText,
  Alert,
  CircularProgress
} from '@mui/material';

// Update the steps to include shipping method but without text
const steps = ['', '', '', ''];

// Add shipping method options
const shippingMethods = [
  { id: 'standard', name: 'Standard Shipping', price: 5.99, description: 'Delivery in 5-7 business days', days: '5-7' },
  { id: 'express', name: 'Express Shipping', price: 12.99, description: 'Delivery in 2-3 business days', days: '2-3' },
  { id: 'overnight', name: 'Overnight Shipping', price: 24.99, description: 'Next business day delivery', days: '1' }
];

const CheckoutPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [activeStep, setActiveStep] = useState(0);
  const [orderSubmitting, setOrderSubmitting] = useState(false);
  const [orderError, setOrderError] = useState(null);
  const [orderComplete, setOrderComplete] = useState(false);
  const [orderId, setOrderId] = useState(null);
  const [shipping, setShipping] = useState(5.99); // Default to standard shipping fee
  
  // Get cart state from Redux
  const { items, totalAmount, discountedAmount, coupon } = useSelector(state => state.cart);
  const { user } = useSelector(state => state.auth);
  
  // Calculate totals - ensure all values are valid numbers
  const cartTotal = Number(totalAmount) || 0;
  const discounted = Number(discountedAmount);
  const discount = (!isNaN(discounted) && discounted >= 0)
    ? Math.max(0, cartTotal - discounted)
    : 0;
  const tax = Math.round((cartTotal - discount) * 0.1 * 100) / 100; // 10% tax
  const orderTotal = Math.max(0, cartTotal - discount + shipping + tax);
  
  // Ensure cart data is loaded
  useEffect(() => {
    dispatch(fetchCart());
  }, [dispatch]);
  
  // Redirect to cart if empty
  useEffect(() => {
    if (items.length === 0 && !orderComplete) {
      navigate('/cart');
    }
  }, [items, navigate, orderComplete]);
  
  // Shipping address validation schema
  const shippingAddressSchema = Yup.object({
    fullName: Yup.string().required('Full name is required'),
    address: Yup.string().required('Street address is required'),
    city: Yup.string().required('City is required'),
    state: Yup.string().required('State is required'),
    zipCode: Yup.string().required('ZIP code is required'),
    country: Yup.string().required('Country is required'),
    phone: Yup.string().required('Phone number is required')
  });
  
  // Payment validation schema
  const paymentMethodSchema = Yup.object({
    paymentMethod: Yup.string().required('Please select a payment method')
  });
  
  // Form handling
  const formik = useFormik({
    initialValues: {
      // Shipping info
      fullName: user?.name || '',
      address: user?.address?.street || '',
      city: user?.address?.city || '',
      state: user?.address?.state || '',
      zipCode: user?.address?.zipCode || '',
      country: user?.address?.country || '',
      phone: user?.phone || '',
      
      // Payment info
      paymentMethod: 'creditCard',
      
      // Card details (would be processed securely in a real app)
      cardName: '',
      cardNumber: '',
      expiryDate: '',
      cvv: '',

      // Shipping method
      shippingMethod: 'standard',
    },
    validationSchema: activeStep === 0 
      ? shippingAddressSchema 
      : (activeStep === 2 ? paymentMethodSchema : null),
    onSubmit: () => {
      if (activeStep === steps.length - 1) {
        handlePlaceOrder();
      } else {
        handleNext();
      }
    }
  });

  // Update shipping fee whenever shipping method changes
  useEffect(() => {
    const selectedMethod = shippingMethods.find(method => method.id === formik.values.shippingMethod);
    if (selectedMethod) {
      setShipping(selectedMethod.price);
    }
  }, [formik.values.shippingMethod]);
  
  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };
  
  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };
  
  const handlePlaceOrder = async () => {
    try {
      setOrderSubmitting(true);
      setOrderError(null);
      
      // Prepare order data
      const orderData = {
        street: formik.values.address,
        city: formik.values.city,
        state: formik.values.state,
        zipCode: formik.values.zipCode,
        country: formik.values.country,
        paymentMethod: formik.values.paymentMethod,
        shippingFee: Number(shipping) || 0,
        tax: Number(tax) || 0,
        couponCode: coupon ? coupon.code : null
      };
      
      // Submit order to API
      const response = await orderAPI.createOrder(orderData);
      setOrderComplete(true);
      setOrderId(response.data.data._id);
      
    } catch (error) {
      setOrderError(error.response?.data?.error || 'Failed to place order');
    } finally {
      setOrderSubmitting(false);
    }
  };
  
  // Content for different steps
  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                required
                id="fullName"
                name="fullName"
                label="Full Name"
                fullWidth
                autoComplete="name"
                value={formik.values.fullName}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.fullName && Boolean(formik.errors.fullName)}
                helperText={formik.touched.fullName && formik.errors.fullName}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                required
                id="address"
                name="address"
                label="Street Address"
                fullWidth
                autoComplete="shipping address-line1"
                value={formik.values.address}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.address && Boolean(formik.errors.address)}
                helperText={formik.touched.address && formik.errors.address}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                id="city"
                name="city"
                label="City"
                fullWidth
                autoComplete="shipping address-level2"
                value={formik.values.city}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.city && Boolean(formik.errors.city)}
                helperText={formik.touched.city && formik.errors.city}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                id="state"
                name="state"
                label="State/Province/Region"
                fullWidth
                value={formik.values.state}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.state && Boolean(formik.errors.state)}
                helperText={formik.touched.state && formik.errors.state}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                id="zipCode"
                name="zipCode"
                label="Zip / Postal code"
                fullWidth
                autoComplete="shipping postal-code"
                value={formik.values.zipCode}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.zipCode && Boolean(formik.errors.zipCode)}
                helperText={formik.touched.zipCode && formik.errors.zipCode}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                id="country"
                name="country"
                label="Country"
                fullWidth
                autoComplete="shipping country"
                value={formik.values.country}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.country && Boolean(formik.errors.country)}
                helperText={formik.touched.country && formik.errors.country}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                required
                id="phone"
                name="phone"
                label="Phone Number"
                fullWidth
                autoComplete="tel"
                value={formik.values.phone}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.phone && Boolean(formik.errors.phone)}
                helperText={formik.touched.phone && formik.errors.phone}
              />
            </Grid>
          </Grid>
        );
      case 1:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Select Shipping Method
              </Typography>
              {shippingMethods.map((method) => (
                <Paper
                  key={method.id}
                  sx={{
                    p: 2,
                    mb: 2,
                    border: method.id === formik.values.shippingMethod
                      ? '2px solid'
                      : '1px solid',
                    borderColor: method.id === formik.values.shippingMethod
                      ? 'primary.main'
                      : 'divider',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      borderColor: 'primary.main',
                      boxShadow: 1
                    }
                  }}
                  onClick={() => formik.setFieldValue('shippingMethod', method.id)}
                >
                  <Grid container alignItems="center" justifyContent="space-between">
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle1" fontWeight={method.id === formik.values.shippingMethod ? 'bold' : 'regular'}>
                        {method.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {method.description}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={3} textAlign="center">
                      <Typography variant="body1" color="text.secondary">
                        Delivery time: {method.days} days
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={3} textAlign="right">
                      <Typography variant="subtitle1" fontWeight="bold" color="primary">
                        ${method.price.toFixed(2)}
                      </Typography>
                    </Grid>
                  </Grid>
                </Paper>
              ))}
            </Grid>
          </Grid>
        );
      case 2:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <FormControl component="fieldset">
                <FormLabel component="legend">Payment Method</FormLabel>
                <RadioGroup
                  name="paymentMethod"
                  value={formik.values.paymentMethod}
                  onChange={formik.handleChange}
                >
                  <FormControlLabel
                    value="creditCard"
                    control={<Radio />}
                    label="Credit Card"
                  />
                  <FormControlLabel
                    value="paypal"
                    control={<Radio />}
                    label="PayPal"
                  />
                  <FormControlLabel
                    value="cashOnDelivery"
                    control={<Radio />}
                    label="Cash on Delivery"
                  />
                </RadioGroup>
              </FormControl>
            </Grid>
            
            {formik.values.paymentMethod === 'creditCard' && (
              <>
                <Grid item xs={12}>
                  <TextField
                    id="cardName"
                    name="cardName"
                    label="Name on Card"
                    fullWidth
                    autoComplete="cc-name"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    id="cardNumber"
                    name="cardNumber"
                    label="Card Number"
                    fullWidth
                    autoComplete="cc-number"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    id="expiryDate"
                    name="expiryDate"
                    label="Expiry Date"
                    fullWidth
                    autoComplete="cc-exp"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    id="cvv"
                    name="cvv"
                    label="CVV"
                    helperText="Last three digits on signature strip"
                    fullWidth
                    autoComplete="cc-csc"
                  />
                </Grid>
              </>
            )}
          </Grid>
        );
      case 3:
        return (
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Order Summary
              </Typography>
              <List disablePadding>
                {items.map((item) => (
                  <ListItem key={item._id} sx={{ py: 1, px: 0 }}>
                    <ListItemText 
                      primary={`${item.product.name} (x${item.quantity})`}
                      secondary={item.product.description && item.product.description.substring(0, 60) + '...'}
                    />
                    <Typography variant="body2">
                      ${(item.price * item.quantity).toFixed(2)}
                    </Typography>
                  </ListItem>
                ))}
                
                <Divider sx={{ my: 2 }} />
                
                <ListItem sx={{ py: 1, px: 0 }}>
                  <ListItemText primary="Subtotal" />
                  <Typography variant="body2">
                    ${cartTotal.toFixed(2)}
                  </Typography>
                </ListItem>
                
                {discount > 0 && (
                  <ListItem sx={{ py: 1, px: 0 }}>
                    <ListItemText primary="Discount" />
                    <Typography variant="body2" color="success.main">
                      -${discount.toFixed(2)}
                    </Typography>
                  </ListItem>
                )}
                
                <ListItem sx={{ py: 1, px: 0 }}>
                  <ListItemText primary="Shipping" />
                  <Typography variant="body2">
                    ${shipping.toFixed(2)}
                  </Typography>
                </ListItem>
                
                <ListItem sx={{ py: 1, px: 0 }}>
                  <ListItemText primary="Tax" />
                  <Typography variant="body2">
                    ${tax.toFixed(2)}
                  </Typography>
                </ListItem>
                
                <ListItem sx={{ py: 1, px: 0 }}>
                  <ListItemText primary="Total" />
                  <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                    ${orderTotal.toFixed(2)}
                  </Typography>
                </ListItem>
              </List>
            </Grid>
            
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Shipping Address
              </Typography>
              <Typography gutterBottom>{formik.values.fullName}</Typography>
              <Typography gutterBottom>{formik.values.address}</Typography>
              <Typography gutterBottom>
                {formik.values.city}, {formik.values.state} {formik.values.zipCode}
              </Typography>
              <Typography gutterBottom>{formik.values.country}</Typography>
              <Typography gutterBottom>Phone: {formik.values.phone}</Typography>
            </Grid>
            
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Shipping Method
              </Typography>
              <Typography gutterBottom>
                {shippingMethods.find(method => method.id === formik.values.shippingMethod)?.name || 'Standard Shipping'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {shippingMethods.find(method => method.id === formik.values.shippingMethod)?.description || ''}
              </Typography>
            </Grid>

            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Payment Method
              </Typography>
              <Typography gutterBottom>
                {formik.values.paymentMethod === 'creditCard' 
                  ? 'Credit Card'
                  : formik.values.paymentMethod === 'paypal'
                    ? 'PayPal'
                    : 'Cash on Delivery'}
              </Typography>
            </Grid>
          </Grid>
        );
      default:
        throw new Error('Unknown step');
    }
  };
  
  // Order confirmation content
  const renderOrderConfirmation = () => (
    <Box sx={{ mt: 3, textAlign: 'center' }}>
      <Typography variant="h5" gutterBottom>
        Thank you for your order!
      </Typography>
      <Typography variant="subtitle1">
        Your order number is #{orderId}.
      </Typography>
      <Typography variant="body1" sx={{ mt: 2 }}>
        We have emailed your order confirmation, and will
        send you an update when your order has shipped.
      </Typography>
      <Button
        variant="contained"
        color="primary"
        onClick={() => navigate(`/orders/${orderId}`)}
        sx={{ mt: 4, mx: 1 }}
      >
        View Order
      </Button>
      <Button
        variant="outlined"
        color="primary"
        onClick={() => navigate('/')}
        sx={{ mt: 4, mx: 1 }}
      >
        Continue Shopping
      </Button>
    </Box>
  );
  
  return (
    <Container component="main" maxWidth="md" sx={{ mb: 4 }}>
      <Paper sx={{ my: { xs: 3, md: 6 }, p: { xs: 2, md: 3 } }}>
        <Typography component="h1" variant="h4" align="center" gutterBottom>
          Checkout
        </Typography>
        
        {orderComplete ? (
          renderOrderConfirmation()
        ) : (
          <>
            <Stepper activeStep={activeStep} sx={{ pt: 3, pb: 5 }}>
              {steps.map((label, index) => (
                <Step key={index}>
                  <StepLabel></StepLabel>
                </Step>
              ))}
            </Stepper>
            
            {orderError && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {orderError}
              </Alert>
            )}
            
            <Box component="form" onSubmit={formik.handleSubmit}>
              {getStepContent(activeStep)}
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
                <Button 
                  disabled={activeStep === 0}
                  onClick={handleBack}
                >
                  Back
                </Button>
                <Button
                  variant="contained"
                  type="submit"
                  disabled={orderSubmitting}
                >
                  {orderSubmitting ? (
                    <CircularProgress size={24} />
                  ) : (
                    activeStep === steps.length - 1 ? 'Place order' : 'Next'
                  )}
                </Button>
              </Box>
            </Box>
          </>
        )}
      </Paper>
    </Container>
  );
};

export default CheckoutPage;

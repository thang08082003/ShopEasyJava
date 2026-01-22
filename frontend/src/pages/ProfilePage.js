import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateUserProfile } from '../store/slices/authSlice';
import authAPI from '../api/authAPI'; // Add this import for the API client

// Formik and Yup for form handling and validation
import { useFormik } from 'formik';
import * as Yup from 'yup';

// MUI components
import {
  Box,
  Container,
  Grid,
  Typography,
  TextField,
  Button,
  Paper,
  Tabs,
  Tab,
  Divider,
  Alert,
  Snackbar,
  CircularProgress,
  Card,
  CardContent
} from '@mui/material';

const ProfilePage = () => {
  const dispatch = useDispatch();
  const { user, loading, error } = useSelector(state => state.auth);
  
  const [activeTab, setActiveTab] = useState(0);
  const [success, setSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState(null);
  
  // Form validation schema
  const validationSchema = Yup.object({
    name: Yup.string().required('Name is required'),
    email: Yup.string().email('Invalid email address').required('Email is required'),
    phone: Yup.string(),
    street: Yup.string(),
    city: Yup.string(),
    state: Yup.string(),
    zipCode: Yup.string(),
    country: Yup.string()
  });
  
  // Form handling
  const formik = useFormik({
    initialValues: {
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      street: user?.address?.street || '',
      city: user?.address?.city || '',
      state: user?.address?.state || '',
      zipCode: user?.address?.zipCode || '',
      country: user?.address?.country || ''
    },
    validationSchema,
    onSubmit: (values) => {
      const userData = {
        name: values.name,
        email: values.email,
        phone: values.phone,
        address: {
          street: values.street,
          city: values.city,
          state: values.state,
          zipCode: values.zipCode,
          country: values.country
        }
      };
      
      dispatch(updateUserProfile(userData))
        .unwrap()
        .then(() => {
          setSuccess(true);
        })
        .catch(() => {
          // Error is handled in the reducer
        });
    }
  });

  const passwordFormik = useFormik({
    initialValues: {
      currentPassword: '',
      newPassword: ''
    },
    validationSchema: Yup.object({
      currentPassword: Yup.string().required('Current password is required'),
      newPassword: Yup.string()
        .min(6, 'Password should be at least 6 characters')
        .required('New password is required')
    }),
    onSubmit: async (values, { resetForm }) => {
      try {
        setPasswordLoading(true);
        setPasswordError(null);
        
        console.log('Submitting password change...');
        
        // Use a custom axios instance without the auth interceptor, or manually handle the response
        try {
          const response = await authAPI.changePassword({
            currentPassword: values.currentPassword,
            newPassword: values.newPassword
          }, { skipAuthInterceptor: true }); // Add this flag if your API client supports it
          
          console.log('Password change response:', response);
          
          // Show success message
          setSuccessMessage('Password updated successfully! Please use this new password next time you log in.');
          setSuccess(true);
          resetForm();
        } catch (apiError) {
          // Prevent 401 from propagating to global interceptors
          if (apiError.response && apiError.response.status === 401) {
            setPasswordError('Current password is incorrect. Please try again.');
            return; // Don't rethrow the error
          }
          throw apiError; // Rethrow other errors to be caught by the outer catch
        }
        
      } catch (err) {
        console.error('Password change error:', err);
        
        // Extract the specific error message from response
        if (err.response) {
          // Only handle non-401 errors here
          if (err.response.data && err.response.data.error) {
            setPasswordError(err.response.data.error);
          } else {
            setPasswordError('Failed to update password. Please try again.');
          }
        } else if (err.message) {
          setPasswordError(err.message);
        } else {
          setPasswordError('Failed to update password. Please try again.');
        }
      } finally {
        setPasswordLoading(false);
      }
    }
  });
  
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };
  
  const handleCloseSnackbar = () => {
    setSuccess(false);
  };
  
  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper sx={{ p: 0 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
        >
          <Tab label="Profile" />
          <Tab label="Address" />
          <Tab label="Password" />
        </Tabs>
        
        <Box sx={{ p: 3 }}>
          <Typography variant="h5" gutterBottom>
            {activeTab === 0 ? 'My Profile' : activeTab === 1 ? 'My Address' : 'Change Password'}
          </Typography>
          <Divider sx={{ mb: 3 }} />
          
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}
          
          {activeTab === 2 ? (
            // Password form - completely separate from the main form
            <Box component="form" onSubmit={passwordFormik.handleSubmit}>
              {/* Display password form error if present */}
              {passwordError && (
                <Alert severity="error" sx={{ mb: 3 }}>
                  {passwordError}
                </Alert>
              )}
              
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    id="currentPassword"
                    name="currentPassword"
                    label="Current Password"
                    type="password"
                    value={passwordFormik.values.currentPassword}
                    onChange={passwordFormik.handleChange}
                    onBlur={passwordFormik.handleBlur}
                    error={passwordFormik.touched.currentPassword && Boolean(passwordFormik.errors.currentPassword)}
                    helperText={passwordFormik.touched.currentPassword && passwordFormik.errors.currentPassword}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    id="newPassword"
                    name="newPassword"
                    label="New Password"
                    type="password"
                    value={passwordFormik.values.newPassword}
                    onChange={passwordFormik.handleChange}
                    onBlur={passwordFormik.handleBlur}
                    error={passwordFormik.touched.newPassword && Boolean(passwordFormik.errors.newPassword)}
                    helperText={passwordFormik.touched.newPassword && passwordFormik.errors.newPassword}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    size="large"
                    disabled={passwordLoading}
                  >
                    {passwordLoading ? <CircularProgress size={24} /> : 'Update Password'}
                  </Button>
                </Grid>
              </Grid>
            </Box>
          ) : (
            // Profile and Address forms
            <Box component="form" onSubmit={formik.handleSubmit}>
              {activeTab === 0 && (
                // Profile Information
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      id="name"
                      name="name"
                      label="Full Name"
                      value={formik.values.name}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={formik.touched.name && Boolean(formik.errors.name)}
                      helperText={formik.touched.name && formik.errors.name}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      id="email"
                      name="email"
                      label="Email Address"
                      value={formik.values.email}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={formik.touched.email && Boolean(formik.errors.email)}
                      helperText={formik.touched.email && formik.errors.email}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      id="phone"
                      name="phone"
                      label="Phone Number"
                      value={formik.values.phone}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={formik.touched.phone && Boolean(formik.errors.phone)}
                      helperText={formik.touched.phone && formik.errors.phone}
                    />
                  </Grid>
                </Grid>
              )}
              
              {activeTab === 1 && (
                // Address Information
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      id="street"
                      name="street"
                      label="Street Address"
                      value={formik.values.street}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={formik.touched.street && Boolean(formik.errors.street)}
                      helperText={formik.touched.street && formik.errors.street}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      id="city"
                      name="city"
                      label="City"
                      value={formik.values.city}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={formik.touched.city && Boolean(formik.errors.city)}
                      helperText={formik.touched.city && formik.errors.city}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      id="state"
                      name="state"
                      label="State/Province"
                      value={formik.values.state}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={formik.touched.state && Boolean(formik.errors.state)}
                      helperText={formik.touched.state && formik.errors.state}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      id="zipCode"
                      name="zipCode"
                      label="ZIP / Postal Code"
                      value={formik.values.zipCode}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={formik.touched.zipCode && Boolean(formik.errors.zipCode)}
                      helperText={formik.touched.zipCode && formik.errors.zipCode}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      id="country"
                      name="country"
                      label="Country"
                      value={formik.values.country}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={formik.touched.country && Boolean(formik.errors.country)}
                      helperText={formik.touched.country && formik.errors.country}
                    />
                  </Grid>
                </Grid>
              )}
              
              <Box sx={{ mt: 3, textAlign: 'right' }}>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  size="large"
                  disabled={loading}
                >
                  {loading ? <CircularProgress size={24} /> : 'Save Changes'}
                </Button>
              </Box>
            </Box>
          )}
        </Box>
      </Paper>
      
      {/* Account Information Summary Card */}
      <Card sx={{ mt: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Account Information
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={4} sm={3}>
              <Typography variant="body1" color="textSecondary">
                Member Since:
              </Typography>
            </Grid>
            <Grid item xs={8} sm={9}>
              <Typography variant="body1">
                {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
              </Typography>
            </Grid>
            
            <Grid item xs={4} sm={3}>
              <Typography variant="body1" color="textSecondary">
                Account Type:
              </Typography>
            </Grid>
            <Grid item xs={8} sm={9}>
              <Typography variant="body1" sx={{ textTransform: 'capitalize' }}>
                {user?.role || 'User'}
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
      
      <Snackbar
        open={success}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity="success" sx={{ width: '100%' }}>
          {successMessage || 'Profile updated successfully!'}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default ProfilePage;

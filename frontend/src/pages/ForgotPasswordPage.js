import React, { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import authAPI from '../api/authAPI';

// MUI components
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Paper,
  Link,
  Alert,
  CircularProgress,
  Stepper,
  Step,
  StepLabel,
  InputAdornment,
  IconButton
} from '@mui/material';

// MUI icons
import { Visibility, VisibilityOff } from '@mui/icons-material';

const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [emailVerified, setEmailVerified] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [verifiedEmail, setVerifiedEmail] = useState('');

  // Step 1: Email verification schema
  const emailValidationSchema = Yup.object({
    email: Yup.string()
      .email('Enter a valid email')
      .required('Email is required')
  });

  // Step 2: Password reset schema
  const passwordValidationSchema = Yup.object({
    password: Yup.string()
      .min(6, 'Password should be at least 6 characters')
      .required('Password is required'),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref('password'), null], 'Passwords must match')
      .required('Confirm Password is required')
  });

  // Email verification form
  const emailFormik = useFormik({
    initialValues: {
      email: ''
    },
    validationSchema: emailValidationSchema,
    onSubmit: async (values) => {
      try {
        setLoading(true);
        setError(null);
        
        // Verify email exists
        const response = await authAPI.forgotPassword(values.email);
        
        if (response.data.verified) {
          setEmailVerified(true);
          setVerifiedEmail(values.email);
        }
      } catch (err) {
        setError(err.response?.data?.error || 'Email not found. Please check and try again.');
      } finally {
        setLoading(false);
      }
    }
  });

  // Password reset form
  const passwordFormik = useFormik({
    initialValues: {
      password: '',
      confirmPassword: ''
    },
    validationSchema: passwordValidationSchema,
    onSubmit: async (values) => {
      try {
        setLoading(true);
        setError(null);
        
        // Reset password directly with email
        await authAPI.resetPassword({
          email: verifiedEmail,
          password: values.password
        });
        
        setResetSuccess(true);
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to reset password. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  });

  return (
    <Container component="main" maxWidth="sm" sx={{ mt: 8, mb: 4 }}>
      <Paper
        elevation={3}
        sx={{
          p: 4,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Typography component="h1" variant="h4" gutterBottom>
          Reset Password
        </Typography>
        
        <Stepper activeStep={emailVerified ? 1 : 0} sx={{ width: '100%', mb: 4 }}>
          <Step>
            <StepLabel>Verify Email</StepLabel>
          </Step>
          <Step>
            <StepLabel>Reset Password</StepLabel>
          </Step>
        </Stepper>
        
        {error && (
          <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
            {error}
          </Alert>
        )}
        
        {!emailVerified && !resetSuccess ? (
          <>
            <Typography color="textSecondary" sx={{ mb: 3, textAlign: 'center' }}>
              Enter your registered email address to reset your password.
            </Typography>
            
            <Box component="form" onSubmit={emailFormik.handleSubmit} sx={{ mt: 1, width: '100%' }}>
              <TextField
                margin="normal"
                required
                fullWidth
                id="email"
                label="Email Address"
                name="email"
                autoComplete="email"
                autoFocus
                value={emailFormik.values.email}
                onChange={emailFormik.handleChange}
                onBlur={emailFormik.handleBlur}
                error={emailFormik.touched.email && Boolean(emailFormik.errors.email)}
                helperText={emailFormik.touched.email && emailFormik.errors.email}
              />
              
              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                sx={{ mt: 3, mb: 2 }}
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} /> : 'Verify Email'}
              </Button>
              
              <Box sx={{ mt: 2, textAlign: 'center' }}>
                <Link component={RouterLink} to="/login" variant="body2">
                  Back to login
                </Link>
              </Box>
            </Box>
          </>
        ) : emailVerified && !resetSuccess ? (
          <>
            <Typography color="textSecondary" sx={{ mb: 3, textAlign: 'center' }}>
              Email verified! Now you can reset your password.
            </Typography>
            
            <Box component="form" onSubmit={passwordFormik.handleSubmit} sx={{ mt: 1, width: '100%' }}>
              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="New Password"
                type={showPassword ? 'text' : 'password'}
                id="password"
                autoComplete="new-password"
                value={passwordFormik.values.password}
                onChange={passwordFormik.handleChange}
                onBlur={passwordFormik.handleBlur}
                error={passwordFormik.touched.password && Boolean(passwordFormik.errors.password)}
                helperText={passwordFormik.touched.password && passwordFormik.errors.password}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />
              
              <TextField
                margin="normal"
                required
                fullWidth
                name="confirmPassword"
                label="Confirm New Password"
                type={showPassword ? 'text' : 'password'}
                id="confirmPassword"
                autoComplete="new-password"
                value={passwordFormik.values.confirmPassword}
                onChange={passwordFormik.handleChange}
                onBlur={passwordFormik.handleBlur}
                error={passwordFormik.touched.confirmPassword && Boolean(passwordFormik.errors.confirmPassword)}
                helperText={passwordFormik.touched.confirmPassword && passwordFormik.errors.confirmPassword}
              />
              
              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                sx={{ mt: 3, mb: 2 }}
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} /> : 'Reset Password'}
              </Button>
            </Box>
          </>
        ) : (
          <>
            <Alert severity="success" sx={{ width: '100%', mb: 3 }}>
              Your password has been reset successfully!
            </Alert>
            <Typography variant="body1" paragraph>
              You can now log in with your new password.
            </Typography>
            <Button
              variant="contained"
              onClick={() => navigate('/login')}
              sx={{ mt: 2 }}
            >
              Go to Login
            </Button>
          </>
        )}
      </Paper>
    </Container>
  );
};

export default ForgotPasswordPage;

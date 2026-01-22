import axios from 'axios';
import { store } from '../store';
import { logout } from '../store/slices/authSlice';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000',
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 10000 // Add timeout to prevent hanging requests
});

// Add a request interceptor to include auth token in headers
api.interceptors.request.use(
  (config) => {
    const { auth } = store.getState();
    if (auth.token) {
      config.headers.Authorization = `Bearer ${auth.token}`;
    }
    
    // Log all outgoing requests in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`, config.params);
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

// Add a response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => {
    // Log successful responses in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`API Response: ${response.status}`, response.config.url);
    }
    return response;
  },
  (error) => {
    // Log failed responses in development
    if (process.env.NODE_ENV === 'development') {
      console.error('API Error:', error.message, 
        error.response?.status, 
        error.response?.data, 
        error.config?.url);
    }
    
    // Logout on 401 Unauthorized
    if (error.response && error.response.status === 401) {
      store.dispatch(logout());
    }
    return Promise.reject(error);
  }
);

export default api;

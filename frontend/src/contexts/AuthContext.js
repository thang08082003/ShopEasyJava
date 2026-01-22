import { createContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Set axios default headers with token
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [token]);

  // Load user if token exists
  useEffect(() => {
    if (token) {
      loadUser();
    }
  }, []);

  // Load user details
  const loadUser = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get('http://localhost:5000/api/auth/profile');
      setUser(res.data.data);
      setIsLoading(false);
    } catch (err) {
      localStorage.removeItem('token');
      setToken(null);
      setUser(null);
      setError(err.response?.data?.error || 'An error occurred');
      setIsLoading(false);
    }
  };

  // Register user
  const register = async (userData) => {
    setIsLoading(true);
    try {
      const res = await axios.post('http://localhost:5000/api/auth/register', userData);
      localStorage.setItem('token', res.data.token);
      setToken(res.data.token);
      setUser(res.data.user);
      setIsLoading(false);
      return res.data;
    } catch (err) {
      setError(err.response?.data?.error || 'An error occurred');
      setIsLoading(false);
      throw err;
    }
  };

  // Login user
  const login = async (email, password) => {
    setIsLoading(true);
    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', { email, password });
      localStorage.setItem('token', res.data.token);
      setToken(res.data.token);
      setUser(res.data.user);
      setIsLoading(false);
      return res.data;
    } catch (err) {
      setError(err.response?.data?.error || 'An error occurred');
      setIsLoading(false);
      throw err;
    }
  };

  // Logout user
  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        error,
        register,
        login,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;

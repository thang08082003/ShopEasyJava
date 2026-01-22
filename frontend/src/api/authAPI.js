import api from './axiosConfig';

const authAPI = {
  register: (userData) => api.post('/api/auth/register', userData),
  login: (credentials) => api.post('/api/auth/login', credentials),
  getProfile: () => api.get('/api/auth/me'),
  me: () => api.get('/api/auth/me')
};

export default authAPI;

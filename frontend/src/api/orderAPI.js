import api from './axiosConfig';

const orderAPI = {
  getOrders: (params = {}) => api.get('/api/orders', { params }),
  getOrderById: (id) => api.get(`/api/orders/${id}`),
  getOrdersByPaymentStatus: (status, params = {}) => api.get(`/api/orders/payment/${status}`, { params }),
  getOrdersByDeliveryStatus: (status, params = {}) => api.get(`/api/orders/status/${status}`, { params }),
  getOrdersByDateRange: (startDate, endDate, params = {}) => api.get(`/api/orders/date/${startDate}/${endDate}`, { params }),
  createOrder: (orderData) => api.post('/api/orders', orderData),
  updateOrderStatus: (id, statusData) => api.put(`/api/orders/${id}`, statusData),
  cancelOrder: (id) => api.delete(`/api/orders/${id}`)
};

export default orderAPI;

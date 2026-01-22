import api from './axiosConfig';

const cartAPI = {
  getCart: () => api.get('/api/cart'),
  addToCart: (productId, quantity = 1) => api.post('/api/cart/items', { 
    productId, 
    quantity 
  }),
  removeCartItem: (productId) => api.delete(`/api/cart/items/${productId}`),
  clearCart: () => api.delete('/api/cart'),
  applyCoupon: (code) => api.post('/api/coupons/apply', { code }),
  removeCoupon: () => api.delete('/api/coupons/remove')
};

export default cartAPI;

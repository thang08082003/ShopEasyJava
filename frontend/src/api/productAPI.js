import api from './axiosConfig';

const productAPI = {
  getProducts: (params = {}) => api.get('/api/products', { params }),
  getProductById: (id) => api.get(`/api/products/${id}`),
  createProduct: (productData) => api.post('/api/products', productData),
  updateProduct: (id, productData) => api.put(`/api/products/${id}`, productData),
  deleteProduct: (id) => api.delete(`/api/products/${id}`),

  // Reviews align to Spring endpoints
  getProductReviews: (productId) => api.get(`/api/reviews/product/${productId}`),
  createReview: (productId, reviewData) => api.post('/api/reviews', { ...reviewData, productId }),
  deleteProductReview: (reviewId) => api.delete(`/api/reviews/${reviewId}`)
};

export default productAPI;

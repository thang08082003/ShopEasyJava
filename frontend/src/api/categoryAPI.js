import api from './axiosConfig';

const categoryAPI = {
  getCategories: () => api.get('/api/categories'),
  getCategoryById: (id) => api.get(`/api/categories/${id}`),
  createCategory: (categoryData) => api.post('/api/categories', categoryData),
  updateCategory: (id, categoryData) => api.put(`/api/categories/${id}`, categoryData),
  deleteCategory: (id) => api.delete(`/api/categories/${id}`)
};

export default categoryAPI;

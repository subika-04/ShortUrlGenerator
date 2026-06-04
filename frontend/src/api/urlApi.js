import api from './axios';

export const urlApi = {
  // Existing methods
  create: (data) => api.post('/url/shorten', data),
  getAll: () => api.get('/url/user/all'),
  delete: (id) => api.delete(`/url/${id}`),
  update: (id, data) => api.put(`/url/${id}`, data),
  getAnalytics: (id) => api.get(`/url/analytics/${id}`),
  getPublicStats: (shortCode) => api.get(`/url/public/${shortCode}`),
  updateExpiry: (id, data) => api.patch(`/url/expiry/${id}`, data),
  
  // ✅ Add this NEW method for bulk URLs
  bulkShorten: (urls, options) => api.post('/url/bulk', { urls, ...options }),
};

export default urlApi;
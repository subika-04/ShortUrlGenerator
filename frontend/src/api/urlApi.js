import api from './axios';

export const urlApi = {
  create: (data) => api.post('/api/url/shorten', data),
  getAll: () => api.get('/api/url/user/all'),
  delete: (id) => api.delete(`/api/url/${id}`),
  update: (id, data) => api.put(`/api/url/${id}`, data),
  getAnalytics: (id) => api.get(`/api/url/analytics/${id}`),
  getPublicStats: (shortCode) => api.get(`/api/url/public/${shortCode}`),
};

export default urlApi;
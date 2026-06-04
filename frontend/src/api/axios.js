import axios from 'axios';

const api = axios.create({
  baseURL:'https://shorturlgenerator-4hbz.onrender.com',
  
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('snip_token');  // Changed!
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
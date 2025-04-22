import axios from 'axios';
import API_URL from '../config';

// Axios instance pointing at the backend API root
const api = axios.create({
  baseURL: `${API_URL}/api`,
});

// Automatically attach token to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

export default api; 
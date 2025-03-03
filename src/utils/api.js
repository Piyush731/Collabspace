import axios from 'axios';

const api = axios.create({
  baseURL: 'https://api.render.com/deploy/srv-cv28supu0jms738rfq20?key=Yo-KNKgS3HI/api' ||
           'https://localhost:5000/api',
});

api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
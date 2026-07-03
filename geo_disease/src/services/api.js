import axios from 'axios';

const api = axios.create({
  baseURL: 'https://api.geodisease-madiun.go.id/v1', // Ganti dengan URL API-mu
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor untuk menyematkan Token jika user sudah login
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
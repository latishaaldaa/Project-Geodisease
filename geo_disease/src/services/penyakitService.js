import api from './api';

export const penyakitService = {
  getAll: () => api.get('/penyakit'),
  getById: (id) => api.get(`/penyakit/${id}`),
  create: (data) => api.post('/penyakit', data),
  update: (id, data) => api.put(`/penyakit/${id}`, data),
};
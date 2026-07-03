import api from './api';

export const pasienService = {
  // Ambil semua data pasien individu
  getAll: () => api.get('/pasien'),

  // Tambah satu pasien (Input Manual)
  create: (data) => api.post('/pasien', data),

  // Fitur Utama: Import Bulk dari Excel
  importExcel: (formData) => {
    return api.post('/pasien/import', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },

  // Hapus data pasien
  delete: (id) => api.delete(`/pasien/${id}`),
};
import { useState } from 'react';
import { pasienService } from '../services/pasienService';

export const useExcelImport = () => {
  const [status, setStatus] = useState('idle'); // idle, uploading, success, error
  const [errors, setErrors] = useState([]);

  const importData = async (file) => {
    setStatus('uploading');
    setErrors([]);

    try {
      const formData = new FormData();
      formData.append('file', file);
      
      await pasienService.importExcel(formData);
      setStatus('success');
    } catch (err) {
      setStatus('error');
      // Jika backend mengirimkan error per baris
      setErrors(err.response?.data?.rowErrors || ["Terjadi kesalahan sistem saat import"]);
    }
  };

  return { importData, status, errors };
};
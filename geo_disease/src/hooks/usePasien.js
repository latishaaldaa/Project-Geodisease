import { useState, useEffect } from 'react';
import { pasienService } from '../services/pasienService';

export const usePasien = () => {
  const [pasien, setPasien] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPasien = async () => {
    try {
      setLoading(true);
      const res = await pasienService.getAll();
      setPasien(res.data);
    } catch (err) {
      setError("Gagal mengambil data pasien");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPasien();
  }, []);

  // Fungsi untuk menghitung statistik otomatis (Tanpa field jumlah)
  const getStats = () => {
    const total = pasien.length;
    const perWilayah = pasien.reduce((acc, curr) => {
      acc[curr.wilayah_id] = (acc[curr.wilayah_id] || 0) + 1;
      return acc;
    }, {});

    return { total, perWilayah };
  };

  return { pasien, loading, error, refresh: fetchPasien, stats: getStats() };
};
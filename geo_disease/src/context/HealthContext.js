// src/context/HealthContext.jsx
import React, { createContext, useState, useContext } from 'react';

const HealthContext = createContext();

export const HealthProvider = ({ children }) => {
  const [dataPasien, setDataPasien] = useState([]);

  // Admin menambah data lengkap
  const tambahPasien = (data) => {
    setDataPasien([...dataPasien, { ...data, id: Date.now() }]);
  };

  // User mengambil data anonim (tanpa Nama)
  const getDataPublik = () => {
    return dataPasien.map(({ penyakit_id, wilayah_id, status }) => ({
      penyakit_id, wilayah_id, status
    }));
  };

  return (
    <HealthContext.Provider value={{ dataPasien, tambahPasien, getDataPublik }}>
      {children}
    </HealthContext.Provider>
  );
};

export const useHealth = () => useContext(HealthContext);
// Hitung persentase kenaikan kasus dibanding bulan lalu
export const calculateGrowth = (currentData, previousData) => {
  if (previousData === 0) return 100;
  return ((currentData - previousData) / previousData) * 100;
};

// Hitung sebaran penyakit untuk grafik Pie
export const getDiseaseDistribution = (dataPasien) => {
  const counts = {};
  dataPasien.forEach(p => {
    counts[p.penyakit_id] = (counts[p.penyakit_id] || 0) + 1;
  });
  return Object.keys(counts).map(key => ({
    name: key,
    value: counts[key]
  }));
};

// Klasifikasi zona wilayah berdasarkan jumlah penderita
export const getZoneStatus = (count) => {
  if (count > 10) return { label: "Merah", color: "rose" };
  if (count > 5) return { label: "Kuning", color: "amber" };
  return { label: "Hijau", color: "emerald" };
};
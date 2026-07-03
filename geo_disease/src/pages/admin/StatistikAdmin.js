import React, { useState, useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  LineChart, Line, Cell, PieChart, Pie 
} from 'recharts';
import { 
  Activity, Users, ClipboardCheck, Clock, 
  ShieldAlert, TrendingUp, Hospital, ArrowUpRight,
  Filter, RefreshCw, FileText, HeartPulse, BedDouble, MapPin
} from 'lucide-react';

const StatistikAdmin = ({ dataPasien = [], daftarKecamatan = [], refreshData, loading }) => {
  // State untuk kontrol filter wilayah asal rujukan puskesmas
  const [filterKecamatan, setFilterKecamatan] = useState('Semua');

  const TOTAL_BED_KAPASITAS = 150;

  // 1. Logika Filter Wilayah (Hospital Command Center)
  const filteredData = useMemo(() => {
    return filterKecamatan === 'Semua' 
      ? dataPasien 
      : dataPasien.filter(p => (p.wilayah_id || p.kecamatan) === filterKecamatan);
  }, [dataPasien, filterKecamatan]);

  // 2. Logika KPI Monitoring Operasional RS
  const stats = useMemo(() => {
    const total = filteredData.length;
    
    const rawatInap = filteredData.filter(p => p.status === 'Rawat Inap' || p.status === 'Perawatan').length;
    const icu = filteredData.filter(p => p.status === 'ICU').length;
    const sembuh = filteredData.filter(p => p.status === 'Sembuh').length;
    
    // Bed Occupancy Rate (BOR %)
    const bor = total > 0 ? (((rawatInap + icu) / TOTAL_BED_KAPASITAS) * 100).toFixed(1) : '0.0';

    // Indikator kualitas berkas RM (Tidak ada NIK atau tidak ada tanda vital)
    const butuhVerifikasi = filteredData.filter(p => {
      const isMissingNik = !p.nik || p.nik.length !== 16;
      const isMissingVitals = !p.suhu || !p.tensi || !p.nadi;
      return isMissingNik || isMissingVitals;
    }).length; 

    return {
      total,
      rawatInap,
      icu,
      sembuh,
      bor,
      butuhVerifikasi
    };
  }, [filteredData]);

  // 3. Analisis Beban Diagnosa (Top 5 Penyakit di RS dengan ICD-10)
  const diagnosaChart = useMemo(() => {
    const counts = {};
    filteredData.forEach(p => {
      let penyakit = p.penyakit_id || p.penyakit || 'Lain-lain';
      if (penyakit) counts[penyakit] = (counts[penyakit] || 0) + 1;
    });

    // ICD-10 mock mapping for professional hospital look
    const icd10Mapping = {
      'DBD': 'A91 (DBD)',
      'Dengue': 'A91 (DBD)',
      'Pneumonia': 'J18 (Pneumonia)',
      'Influenza': 'J11 (Influenza)',
      'Typhoid': 'A01 (Typhoid)',
      'Diabetes Mellitus': 'E11 (DM)',
      'Diabetes': 'E11 (DM)',
      'Hipertensi': 'I10 (Hipertensi)',
      'Stroke': 'I64 (Stroke)',
      'TBC': 'A15 (Tuberkulosis)'
    };

    return Object.keys(counts)
      .map(name => {
        const displayName = icd10Mapping[name] || name;
        return { name: displayName, value: counts[name] };
      })
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  }, [filteredData]);

  // 4. Tren Admisi Rujukan Masuk Pasien
  const trenAdmisiChart = useMemo(() => {
    const dailyCounts = {};
    filteredData.forEach(p => {
      if (p.tanggal_input) dailyCounts[p.tanggal_input] = (dailyCounts[p.tanggal_input] || 0) + 1;
    });

    return Object.keys(dailyCounts)
      .sort()
      .slice(-7) // Ambil 7 rentang rekam data terakhir
      .map(date => {
        const formattedDate = date.split('-').reverse().slice(0, 2).join('/');
        return {
          tanggal: formattedDate,
          "Pasien Masuk": dailyCounts[date]
        };
      });
  }, [filteredData]);

  // 5. Distribusi Status Klinis Pasien (Pie Chart)
  const statusKlinisChart = useMemo(() => {
    return [
      { name: 'Kamar ICU (Kritis)', value: stats.icu, color: '#EF4444' },
      { name: 'Rawat Inap', value: stats.rawatInap, color: '#F59E0B' },
      { name: 'Rawat Jalan / Isolasi', value: filteredData.filter(p => p.status === 'Rawat Jalan' || p.status === 'Isolasi Mandiri').length, color: '#3B82F6' },
      { name: 'Discharged / Sembuh', value: stats.sembuh, color: '#10B981' }
    ].filter(item => item.value > 0);
  }, [filteredData, stats]);

  // 6. Distribusi Wilayah Asal Rujukan (Bar Chart)
  const wilayahRujukanChart = useMemo(() => {
    const counts = {};
    filteredData.forEach(p => {
      const wilayah = p.wilayah_id || 'Lainnya';
      counts[wilayah] = (counts[wilayah] || 0) + 1;
    });
    return Object.keys(counts)
      .map(name => ({ name, "Rujukan": counts[name] }))
      .sort((a, b) => b.Rujukan - a.Rujukan)
      .slice(0, 5);
  }, [filteredData]);

  const daftarKecamatanFinal = daftarKecamatan.length > 0 ? daftarKecamatan : [
    "Balerejo", "Dagangan", "Dolopo", "Geger", "Gemarang", 
    "Jiwan", "Kare", "Kebonsari", "Madiun", "Mejayan", 
    "Pilangkenceng", "Saradan", "Sawahan", "Wonoasri", "Wungu"
  ];

  return (
    <div className="p-8 space-y-8 bg-slate-50 antialiased min-h-screen">
      
      {/* HEADER MONITORING DASHBOARD */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/60 pb-6">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tighter flex items-center gap-2.5">
            <Hospital className="text-indigo-600" /> STATISTIK MONITORING RUMAH SAKIT
          </h1>
          <p className="text-sm text-slate-500 font-medium mt-0.5">Analitik Klinis Terpadu & Utilitas Manajemen Hunian Bangsal</p>
        </div>
        
        {/* PANEL FILTER & KONTROL ACTION */}
        <div className="flex flex-wrap items-center gap-3 self-end md:self-center">
          <div className="bg-white px-4 py-2.5 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-2">
            <Filter size={14} className="text-indigo-500" />
            <select
              value={filterKecamatan}
              onChange={(e) => setFilterKecamatan(e.target.value)}
              className="text-xs font-black text-slate-700 bg-transparent border-none outline-none cursor-pointer pr-2"
            >
              <option value="Semua">Seluruh Puskesmas Pengirim</option>
              {daftarKecamatanFinal.map(kec => (
                <option key={kec} value={kec}>{kec}</option>
              ))}
            </select>
          </div>

          {refreshData && (
            <button 
              onClick={refreshData}
              disabled={loading}
              className="p-3 bg-white text-slate-600 hover:text-indigo-600 rounded-2xl border border-slate-200 shadow-sm hover:shadow transition-all disabled:opacity-50"
              title="Refresh Data Monitor"
            >
              <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
            </button>
          )}
        </div>
      </div>

      {/* METRIK UTAMA OPERASIONAL HOSPITAL COMMAND CENTER */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard 
          title="Bed Occupancy Rate (BOR)" 
          value={`${stats.bor}%`} 
          icon={<BedDouble />} 
          color="rose" 
          desc={`Hunian: ${stats.rawatInap + stats.icu} / ${TOTAL_BED_KAPASITAS} Bed`}
        />
        <KPICard 
          title="Pasien ICU Terisi" 
          value={stats.icu} 
          icon={<Activity />} 
          color="indigo" 
          desc="Kapasitas bed isolasi intensif kritis"
        />
        <KPICard 
          title="Total Pasien Terpantau" 
          value={stats.total} 
          icon={<Users />} 
          color="emerald" 
          desc="Manifes kumulatif rujukan masuk"
        />
        <KPICard 
          title="Audit Berkas RM Incomplete" 
          value={stats.butuhVerifikasi} 
          icon={<ShieldAlert />} 
          color="amber" 
          desc="Missing NIK / tanda vital klinis"
        />
      </div>

      {/* PANEL GRAFIK ANALISIS DATA MEDIS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* GRAFIK 1: LINE CHART TREN ADMISI MASUK (2/3 Kolom) */}
        <div className="lg:col-span-2 bg-white p-7 rounded-[2rem] border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl border border-indigo-100">
                <TrendingUp size={18} />
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight">Tren Admisi Rujukan Masuk</h3>
                <p className="text-xs text-slate-400 font-semibold">Grafik pergerakan laju pasien baru masuk faskes rujukan</p>
              </div>
            </div>
          </div>

          <div className="h-[300px] w-full mt-2">
            {trenAdmisiChart.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trenAdmisiChart} margin={{ left: -20, right: 10, top: 10, bottom: 0 }} style={{ fontFamily: 'sans-serif' }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="tanggal" stroke="#94a3b8" fontSize={10} fontWeight="bold" tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={10} fontWeight="bold" tickLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#fff', borderRadius: '1rem', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)' }}
                    labelStyle={{ fontSize: '11px', fontWeight: 'bold', color: '#1e293b' }}
                    itemStyle={{ fontSize: '11px', fontWeight: 'bold' }}
                  />
                  <Line type="monotone" dataKey="Pasien Masuk" stroke="#4f46e5" strokeWidth={3} dot={{ r: 4, strokeWidth: 2, fill: '#fff' }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center text-xs text-slate-400 py-16">Data tren kosong</p>
            )}
          </div>
        </div>

        {/* GRAFIK 2: PIE CHART PROPORSI STATUS CLINIC (1/3 Kolom) */}
        <div className="bg-white p-7 rounded-[2rem] border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl border border-emerald-100">
              <HeartPulse size={18} />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight">Kondisi Klinis Pasien</h3>
              <p className="text-xs text-slate-400 font-semibold">Proporsi penanganan pasien aktif di faskes</p>
            </div>
          </div>

          <div className="h-[200px] w-full relative flex items-center justify-center">
            {statusKlinisChart.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusKlinisChart}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={85}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {statusKlinisChart.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#fff', borderRadius: '0.75rem', border: '1px solid #e2e8f0' }}
                    itemStyle={{ fontSize: '11px', fontWeight: 'bold' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center text-xs text-slate-400">Data klinis kosong</p>
            )}
          </div>

          {/* LEGEND UNTUK PIE CHART STATUS */}
          <div className="space-y-2 border-t border-slate-100 pt-4 mt-2">
            {statusKlinisChart.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-[9px] font-bold text-slate-600 uppercase">{item.name}</span>
                </div>
                <span className="text-xs font-black text-slate-900">{item.value} Pasien</span>
              </div>
            ))}
            {statusKlinisChart.length === 0 && (
              <p className="text-center text-xs font-semibold text-slate-300 py-4">Nihil data klinis</p>
            )}
          </div>
        </div>

      </div>

      {/* SECOND ROW CHARTS: DISEASE LOADS & SUBDISTRICT ORIGINS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* BAR CHART: 5 BESAR DIAGNOSA BEBAN TERTINGGI */}
        <div className="bg-white p-7 rounded-[2rem] border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl border border-amber-100">
              <FileText size={18} />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight">Kapasitas Diagnosa Terbanyak (Top 5)</h3>
              <p className="text-xs text-slate-400 font-semibold">Distribusi volume jenis penyakit rujukan masuk disertai kode ICD-10</p>
            </div>
          </div>

          <div className="h-[250px] w-full">
            {diagnosaChart.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={diagnosaChart} margin={{ left: -20, right: 10, top: 10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} fontWeight="bold" tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={10} fontWeight="bold" tickLine={false} />
                  <Tooltip
                    cursor={{ fill: '#f8fafc' }}
                    contentStyle={{ backgroundColor: '#fff', borderRadius: '1rem', border: '1px solid #e2e8f0' }}
                    itemStyle={{ fontSize: '11px', fontWeight: 'bold' }}
                  />
                  <Bar dataKey="value" fill="#6366f1" radius={[8, 8, 0, 0]} maxBarSize={60}>
                    {diagnosaChart.map((entry, index) => {
                      const colors = ['#4f46e5', '#6366f1', '#818cf8', '#a5b4fc', '#c7d2fe'];
                      return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />;
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center text-xs text-slate-400 py-16">Data diagnosis kosong</p>
            )}
          </div>
        </div>

        {/* BAR CHART: WILAYAH RUJUKAN TERBANYAK */}
        <div className="bg-white p-7 rounded-[2rem] border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-rose-50 text-rose-600 rounded-2xl border border-rose-100">
              <MapPin size={18} />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight">Top 5 Puskesmas / Kecamatan Rujukan</h3>
              <p className="text-xs text-slate-400 font-semibold">Distribusi kontribusi rujukan pasien terbesar berdasarkan wilayah kecamatan</p>
            </div>
          </div>

          <div className="h-[250px] w-full">
            {wilayahRujukanChart.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={wilayahRujukanChart} margin={{ left: -20, right: 10, top: 10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} fontWeight="bold" tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={10} fontWeight="bold" tickLine={false} />
                  <Tooltip
                    cursor={{ fill: '#f8fafc' }}
                    contentStyle={{ backgroundColor: '#fff', borderRadius: '1rem', border: '1px solid #e2e8f0' }}
                    itemStyle={{ fontSize: '11px', fontWeight: 'bold' }}
                  />
                  <Bar dataKey="Rujukan" fill="#10B981" radius={[8, 8, 0, 0]} maxBarSize={60}>
                    {wilayahRujukanChart.map((entry, index) => {
                      const colors = ['#10b981', '#34d399', '#6ee7b7', '#a7f3d0', '#d1fae5'];
                      return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />;
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center text-xs text-slate-400 py-16">Data wilayah rujukan kosong</p>
            )}
          </div>
        </div>

      </div>

    </div>
  );
};

// --- PRIVATE HELPER CARD COMPONENT ---
const KPICard = ({ title, value, icon, color, desc }) => {
  const colorMap = {
    indigo: "bg-indigo-50 text-indigo-600 border-indigo-100 shadow-indigo-100/50",
    rose: "bg-rose-50 text-rose-600 border-rose-100 shadow-rose-100/50",
    emerald: "bg-emerald-50 text-emerald-600 border-emerald-100 shadow-emerald-100/50",
    amber: "bg-amber-50 text-amber-600 border-amber-100 shadow-amber-100/50"
  };

  return (
    <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm hover:shadow-md transition-all group">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3.5 rounded-2xl ${colorMap[color]} border transition-transform group-hover:scale-110 duration-300`}>
          {React.cloneElement(icon, { size: 20 })}
        </div>
      </div>
      <div>
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">{title}</span>
        <span className="text-2xl font-black text-slate-800 block mt-1 tracking-tight">{value}</span>
        {desc && <span className="text-[10px] font-medium text-slate-400 block mt-1.5">{desc}</span>}
      </div>
    </div>
  );
};

export default StatistikAdmin;
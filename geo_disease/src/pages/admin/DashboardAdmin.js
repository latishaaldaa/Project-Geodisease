import React, { useMemo, useState } from 'react';
import { 
  Activity, Users, HeartPulse, MapPin, TrendingUp, 
  Clock, AlertCircle, ChevronRight, Filter, ShieldAlert,
  BedDouble, Stethoscope, ShieldCheck, Ambulance, FileDown
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell
} from 'recharts';
import { exportToExcel } from '../../utils/excelHelper';

const DashboardAdmin = ({ dataPasien = [], logs = [], setActiveTab }) => {
  // --- STATE FILTER DYNAMIC ---
  const [statusFilter, setStatusFilter] = useState('Semua');

  // --- PARAMETER MONITORING OPERASIONAL RS ---
  const TOTAL_BED_KAPASITAS = 150;

  // --- LOGIKA DATA UTAMA ---
  const totalTerdaftar = dataPasien.length;

  const rawatInap = useMemo(() => {
    return dataPasien.filter(p => {
      const statusNormal = p.status?.toLowerCase() || '';
      return statusNormal === 'rawat inap' || statusNormal === 'perawatan';
    }).length;
  }, [dataPasien]);

  const icu = useMemo(() => {
    return dataPasien.filter(p => {
      const statusNormal = p.status?.toLowerCase() || '';
      return statusNormal === 'icu';
    }).length;
  }, [dataPasien]);

  const rawatJalan = useMemo(() => {
    return dataPasien.filter(p => {
      const statusNormal = p.status?.toLowerCase() || '';
      return statusNormal === 'rawat jalan' || statusNormal === 'isolasi mandiri';
    }).length;
  }, [dataPasien]);

  const sembuh = useMemo(() => {
    return dataPasien.filter(p => (p.status?.toLowerCase() || '') === 'sembuh').length;
  }, [dataPasien]);

  const meninggal = useMemo(() => {
    return dataPasien.filter(p => (p.status?.toLowerCase() || '') === 'meninggal').length;
  }, [dataPasien]);

  // Bed Occupancy Rate (BOR) = (Pasien Rawat Inap + ICU) / Total Kapasitas Bed * 100
  const borRate = useMemo(() => {
    const totalTerisi = rawatInap + icu;
    return totalTerisi > 0 ? ((totalTerisi / TOTAL_BED_KAPASITAS) * 100).toFixed(1) : '0.0';
  }, [rawatInap, icu]);

  // --- SINKRONISASI FILTERING DATA ---
  const filteredDataPasien = useMemo(() => {
    if (statusFilter === 'Semua') return dataPasien;
    return dataPasien.filter(p => {
      const status = p.status?.toLowerCase() || '';
      if (statusFilter === 'Rawat Inap') return status === 'rawat inap' || status === 'perawatan';
      if (statusFilter === 'Rawat Jalan') return status === 'rawat jalan' || status === 'isolasi mandiri';
      return status === statusFilter.toLowerCase();
    });
  }, [dataPasien, statusFilter]);

  // --- LOGIKA TREND KUNJUNGAN ADMISI ---
  const chartData = useMemo(() => {
    const counts = {};
    filteredDataPasien.forEach(pasien => {
      if (pasien.tanggal_input) {
        const dateObj = new Date(pasien.tanggal_input);
        const formattedDate = !isNaN(dateObj.getTime()) 
          ? dateObj.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
          : pasien.tanggal_input;
        
        counts[formattedDate] = (counts[formattedDate] || 0) + 1;
      }
    });

    return Object.keys(counts).map(date => ({
      name: date,
      jumlah: counts[date]
    })).slice(-7);
  }, [filteredDataPasien]);

  // --- SEBARAN WILAYAH KECAMATAN MASUK ---
  const kecamatanData = useMemo(() => {
    const counts = {};
    dataPasien.forEach(p => {
      const wilayah = p.wilayah_id || p.kecamatan || 'Tidak Diketahui';
      counts[wilayah] = (counts[wilayah] || 0) + 1;
    });
    return Object.keys(counts)
      .map(kec => ({ name: kec, jumlah: counts[kec] }))
      .sort((a, b) => b.jumlah - a.jumlah)
      .slice(0, 5);
  }, [dataPasien]);

  // --- PROPORSIONAL RASIO HUNIAN KLINIS PASIEN ---
  const statusPieData = useMemo(() => {
    return [
      { name: 'ICU', value: icu, color: '#EF4444' }, // Red
      { name: 'Rawat Inap', value: rawatInap, color: '#F59E0B' }, // Amber
      { name: 'Rawat Jalan', value: rawatJalan, color: '#3B82F6' }, // Blue
      { name: 'Sembuh/Pulang', value: sembuh, color: '#10B981' } // Emerald
    ].filter(item => item.value > 0);
  }, [icu, rawatInap, rawatJalan, sembuh]);

  // --- TOP DIAGNOSA PENYAKIT RS ---
  const topPenyakit = useMemo(() => {
    const counts = {};
    dataPasien.forEach(p => {
      const namaPenyakit = p.penyakit_id || p.penyakit || 'Lain-lain';
      counts[namaPenyakit] = (counts[namaPenyakit] || 0) + 1;
    });
    return Object.keys(counts)
      .map(key => ({ nama: key, jumlah: counts[key] }))
      .sort((a, b) => b.jumlah - a.jumlah)
      .slice(0, 4);
  }, [dataPasien]);

  // --- FUNGSI EXPORT DATA DASHBOARD ---
  const handleExportDashboard = () => {
    const exportData = dataPasien.map((p, idx) => ({
      No: idx + 1,
      'Nama Pasien': p.nama,
      'NIK': p.nik || '-',
      'Umur': p.umur,
      'Jenis Kelamin': p.jenis_kelamin || '-',
      'Gol. Darah': p.gol_darah,
      'Wilayah Kecamatan': p.wilayah_id,
      'Diagnosa': p.penyakit_id,
      'Bangsal/Kamar': p.kamar || '-',
      'Status Medis': p.status,
      'Suhu (°C)': p.suhu || '-',
      'Tekanan Darah': p.tensi || '-',
      'Denyut Nadi': p.nadi || '-',
      'Tanggal Input': p.tanggal_input
    }));
    exportToExcel(exportData, 'Dashboard_Monitoring_Rumah_Sakit');
  };

  // --- KAPASITAS BANGSAL RS ---
  const bangsalKapasitas = useMemo(() => {
    // Menghitung hunian bangsal secara dinamis
    const counts = { 'ICU': icu, 'Melati (Rawat Inap)': 0, 'Dahlia (Rawat Inap)': 0, 'IGD': 0 };
    
    dataPasien.forEach(p => {
      const status = p.status?.toLowerCase() || '';
      const bangsal = (p.kamar || p.bangsal || '').toLowerCase();
      if (status === 'sembuh' || status === 'meninggal') return;

      if (bangsal.includes('melati')) {
        counts['Melati (Rawat Inap)']++;
      } else if (bangsal.includes('dahlia')) {
        counts['Dahlia (Rawat Inap)']++;
      } else if (bangsal.includes('icu') || status === 'icu') {
        // counted in ICU
      } else if (bangsal.includes('igd') || status === 'igd') {
        counts['IGD']++;
      } else {
        // distribute rawat inap
        if (status === 'rawat inap' || status === 'perawatan') {
          if (counts['Melati (Rawat Inap)'] < 35) {
            counts['Melati (Rawat Inap)']++;
          } else {
            counts['Dahlia (Rawat Inap)']++;
          }
        } else {
          counts['IGD']++;
        }
      }
    });

    return [
      { name: 'Bangsal ICU', terisi: counts['ICU'], kapasitas: 15, warna: 'bg-rose-500' },
      { name: 'Bangsal Melati', terisi: counts['Melati (Rawat Inap)'], kapasitas: 50, warna: 'bg-amber-500' },
      { name: 'Bangsal Dahlia', terisi: counts['Dahlia (Rawat Inap)'], kapasitas: 50, warna: 'bg-indigo-500' },
      { name: 'Unit Gawat Darurat (IGD)', terisi: counts['IGD'], kapasitas: 35, warna: 'bg-emerald-500' }
    ];
  }, [dataPasien, icu]);

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-700 text-slate-800">
      
      {/* HEADER SECTION & LIVE TRACKING STATUS */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-[#121629] tracking-tight uppercase">
            Hospital <span className="text-indigo-600">Command Center</span>
          </h1>
          <p className="text-slate-500 font-semibold mt-1 text-sm">Sistem Monitoring Operasional & Surveilans Klinis Rumah Sakit</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-white p-2 px-3 rounded-xl border border-slate-200 shadow-sm text-xs font-bold text-slate-700">
            <Filter size={14} className="text-slate-400" />
            <span className="font-semibold">Filter Tren:</span>
            <select 
              value={statusFilter} 
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent border-none outline-none text-indigo-600 cursor-pointer font-extrabold"
            >
              <option value="Semua">Semua Kondisi</option>
              <option value="Rawat Inap">Rawat Inap</option>
              <option value="ICU">ICU</option>
              <option value="Rawat Jalan">Rawat Jalan/Isolasi</option>
              <option value="Sembuh">Sembuh</option>
              <option value="Meninggal">Meninggal</option>
            </select>
          </div>

          <button
            onClick={handleExportDashboard}
            className="flex items-center gap-2 bg-emerald-50 text-emerald-700 border border-emerald-100 p-2 px-3 rounded-xl shadow-sm text-xs font-bold hover:bg-emerald-100 transition-all"
            title="Export Data Dashboard"
          >
            <FileDown size={14} />
            <span>Export</span>
          </button>

          <div className="flex items-center gap-3 bg-white p-2 px-4 rounded-2xl border border-slate-100 shadow-sm">
            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></div>
            <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Monitoring RS Aktif</span>
          </div>
        </div>
      </div>

      {/* KPI METRIC CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard title="Bed Occupancy Rate (BOR)" value={`${borRate}%`} subTitle={`Hunian: ${rawatInap + icu} / ${TOTAL_BED_KAPASITAS} Bed`} icon={BedDouble} color="rose" />
        <StatCard title="Beban Rawat Inap & ICU" value={rawatInap + icu} subTitle={`Rawat Inap: ${rawatInap} | ICU: ${icu}`} icon={Activity} color="indigo" />
        <StatCard title="Pasien Rawat Jalan" value={rawatJalan} subTitle="Terpantau kontrol klinis rutin" icon={Users} color="blue" />
        <StatCard title="Total Pasien Discharge" value={sembuh} subTitle={`Angka Kematian: ${meninggal}`} icon={HeartPulse} color="emerald" />
      </div>

      {/* OPERATIONAL MONITORING: WARD STATUS & STAFF ON DUTY */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: WARD BEDS OCCUPANCY (8 columns) */}
        <div className="lg:col-span-8 bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6">
          <div>
            <h3 className="font-black text-slate-800 uppercase text-sm tracking-widest flex items-center gap-2">
              <BedDouble size={18} className="text-indigo-600" /> Utilitas Kapasitas Tempat Tidur (Bangsal)
            </h3>
            <p className="text-xs text-slate-400 font-medium mt-1">Monitoring bed occupancy secara real-time pada masing-masing unit perawatan faskes</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {bangsalKapasitas.map((b, idx) => {
              const occupancyPercent = ((b.terisi / b.kapasitas) * 100).toFixed(0);
              return (
                <div key={idx} className="bg-slate-50 border border-slate-100 p-5 rounded-2xl space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-black text-slate-700">{b.name}</span>
                    <span className="text-[10px] bg-white border border-slate-200 font-bold px-2 py-0.5 rounded text-slate-500">
                      {b.terisi} / {b.kapasitas} Bed
                    </span>
                  </div>

                  <div className="relative w-full h-3 bg-slate-200/60 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${b.warna}`} 
                      style={{ width: `${Math.min(100, (b.terisi / b.kapasitas) * 100)}%` }} 
                    />
                  </div>

                  <div className="flex justify-between items-center text-[10px]">
                    <span className="text-slate-400 font-semibold">Tingkat Keterisian:</span>
                    <span className="font-black text-slate-700">{occupancyPercent}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT COLUMN: STAFF STATUS & ACTIONS (4 columns) */}
        <div className="lg:col-span-4 bg-slate-900 p-8 rounded-[2.5rem] text-white shadow-xl flex flex-col justify-between relative overflow-hidden">
          <div className="relative z-10 space-y-6">
            <h3 className="text-sm font-black uppercase tracking-[0.2em] text-slate-400">Tim Medis Jaga & Alut</h3>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b border-white/5 pb-2.5">
                <div className="flex items-center gap-2">
                  <Stethoscope size={14} className="text-indigo-400" />
                  <span className="text-xs font-semibold text-slate-200">Dokter On-Duty</span>
                </div>
                <span className="text-xs font-black text-emerald-400">12 Spesialis / Umum</span>
              </div>

              <div className="flex justify-between items-center border-b border-white/5 pb-2.5">
                <div className="flex items-center gap-2">
                  <Users size={14} className="text-indigo-400" />
                  <span className="text-xs font-semibold text-slate-200">Perawat Jaga</span>
                </div>
                <span className="text-xs font-black text-emerald-400">38 Personel</span>
              </div>

              <div className="flex justify-between items-center border-b border-white/5 pb-2.5">
                <div className="flex items-center gap-2">
                  <Ambulance size={14} className="text-indigo-400" />
                  <span className="text-xs font-semibold text-slate-200">Ambulans Siaga</span>
                </div>
                <span className="text-xs font-black text-emerald-400">4 Unit Aktif</span>
              </div>

              <div className="flex justify-between items-center pb-1">
                <div className="flex items-center gap-2">
                  <ShieldCheck size={14} className="text-indigo-400" />
                  <span className="text-xs font-semibold text-slate-200">Konektivitas Dinkes</span>
                </div>
                <span className="text-xs bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded text-[9px] font-black uppercase">
                  Connected
                </span>
              </div>
            </div>

            <button 
              onClick={() => setActiveTab('rekam-medis')}
              className="w-full py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all mt-2 text-center"
            >
              Registrasi & Update Rekam Medis
            </button>
          </div>
          <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-indigo-600/10 rounded-full blur-3xl" />
        </div>

      </div>

      {/* CORE CHARTS: ADMISSION TRENDS & GEOGRAPHIC CLUSTER */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* GRAPH: DAILY PATIENT ADMISSIONS (8 columns) */}
        <div className="lg:col-span-8 bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h3 className="font-black text-slate-800 uppercase text-sm tracking-widest">Tren Admisi Pasien Jaga</h3>
              <p className="text-xs text-slate-400 font-medium mt-1">Jumlah pendaftaran pasien masuk berdasarkan tanggal input sistem ({statusFilter})</p>
            </div>
            <button 
              onClick={() => setActiveTab('statistik')}
              className="text-indigo-600 hover:bg-indigo-50 p-2 px-3 rounded-xl transition-all flex items-center gap-2 font-black text-xs uppercase tracking-wider"
            >
              Analitik Klinis <ChevronRight size={16} />
            </button>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorJumlah" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366F1" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#6366F1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94A3B8', fontSize: 11, fontWeight: 600}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94A3B8', fontSize: 11}}/>
                <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} labelStyle={{ fontWeight: 'bold', color: '#1E293B' }}/>
                <Area type="monotone" dataKey="jumlah" name="Pasien Baru" stroke="#6366F1" strokeWidth={4} fillOpacity={1} fill="url(#colorJumlah)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* LOG AKTIVITAS SYSTEM (4 columns) */}
        <div className="lg:col-span-4 bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-black uppercase tracking-[0.15em] mb-6 text-slate-800">Aktivitas Terkini</h3>
            <div className="space-y-4 max-h-[250px] overflow-y-auto pr-1">
              {logs && logs.length > 0 ? (
                logs.slice(0, 5).map((log, i) => (
                  <div key={i} className="flex gap-4 items-start border-l-2 border-indigo-500 pl-4 py-0.5">
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-slate-700 leading-tight truncate">{log.aktivitas}</p>
                      <div className="flex items-center gap-1.5 mt-1 text-[10px] text-slate-400">
                        <Clock size={10} />
                        <span>{log.waktu}</span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-xs text-slate-400 italic">Belum ada log masuk</p>
                </div>
              )}
            </div>
          </div>

          <div className="border-t border-slate-100 pt-4 mt-4 flex items-center gap-3">
             <div className="p-2.5 bg-rose-50 text-rose-600 rounded-2xl border border-rose-100">
                <AlertCircle size={20} className="animate-pulse" />
             </div>
             <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Notifikasi Command</p>
                <p className="text-xs font-bold text-slate-700 mt-0.5">Semua faskes puskesmas jaring rujukan tersinkronisasi.</p>
             </div>
          </div>
        </div>

      </div>

      {/* CLUSTER DIAGNOSIS & TOP DOMISILI */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        
        {/* BAR CHART: SEBARAN WILAYAH RUJUKAN (5 columns) */}
        <div className="md:col-span-5 bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm">
          <div className="mb-4">
            <h3 className="font-black text-slate-800 uppercase text-xs tracking-widest flex items-center gap-2">
              <MapPin size={16} className="text-indigo-600" /> Asal Rujukan Tertinggi
            </h3>
            <p className="text-[11px] text-slate-400 font-medium">Asal kecamatan pengirim pasien rujukan terbesar</p>
          </div>
          <div className="h-[200px]">
            {kecamatanData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={kecamatanData} layout="vertical">
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fill: '#475569', fontSize: 11, fontWeight: 600}} width={95} />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: 'none' }}/>
                  <Bar dataKey="jumlah" fill="#6366F1" radius={[0, 8, 8, 0]} barSize={12} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-xs text-slate-400 italic text-center pt-10">Data wilayah nihil</p>
            )}
          </div>
        </div>

        {/* PIE CHART: PROPORSI STATUS PERAWATAN AKTIF (4 columns) */}
        <div className="md:col-span-4 bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="font-black text-slate-800 uppercase text-xs tracking-widest flex items-center gap-2">
              <TrendingUp size={16} className="text-emerald-600" /> Proporsi Kondisi Pasien
            </h3>
            <p className="text-[11px] text-slate-400 font-medium">Proporsi penanganan pasien aktif di rumah sakit</p>
          </div>
          <div className="h-[150px] flex items-center justify-center">
            {totalTerdaftar > 0 ? (
              <>
                <ResponsiveContainer width="55%" height="100%">
                  <PieChart>
                    <Pie data={statusPieData} cx="50%" cy="50%" innerRadius={42} outerRadius={55} paddingAngle={4} dataKey="value">
                      {statusPieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip/>
                  </PieChart>
                </ResponsiveContainer>
                <div className="text-left space-y-1 pl-2 w-[45%]">
                  {statusPieData.map((item, i) => (
                      <div key={i} className="flex flex-col text-[10px] text-slate-600">
                        <div className="flex items-center gap-1.5 font-black">
                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                          <span>{item.name}</span>
                        </div>
                        <span className="text-slate-400 font-bold pl-3.5">{item.value} Pasien</span>
                      </div>
                  ))}
                </div>
              </>
            ) : (
              <p className="text-xs text-slate-400 italic">Data kosong</p>
            )}
          </div>
        </div>

        {/* LIST BOX: TOP DIAGNOSA PENYAKIT (3 columns) */}
        <div className="md:col-span-3 bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm">
          <div className="mb-4">
            <h3 className="font-black text-slate-800 uppercase text-xs tracking-widest flex items-center gap-2">
              <ShieldAlert size={16} className="text-rose-600" /> Diagnosis Terbanyak
            </h3>
            <p className="text-[11px] text-slate-400 font-medium">Beban diagnosa yang paling tinggi ditangani</p>
          </div>
          <div className="space-y-3">
            {topPenyakit.length > 0 ? (
              topPenyakit.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <span className="text-xs font-bold text-slate-700 truncate max-w-[130px]">{item.nama}</span>
                  <span className="bg-rose-50 text-rose-600 font-extrabold text-[10px] px-2 py-0.5 rounded border border-rose-100">
                    {item.jumlah} Kasus
                  </span>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 italic text-center pt-10">Belum ada rekam penyakit</p>
            )}
          </div>
        </div>

      </div>

    </div>
  );
};

// --- REUSABLE STAT CARD COMPONENT ---
const StatCard = ({ title, value, subTitle, icon: Icon, color }) => {
  const colors = {
    indigo: "text-indigo-600 bg-indigo-50 border-indigo-100",
    rose: "text-rose-600 bg-rose-50 border-rose-100 border-rose-200",
    emerald: "text-emerald-600 bg-emerald-50 border-emerald-100",
    blue: "text-blue-600 bg-blue-50 border-blue-100"
  };
  
  return (
    <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm group hover:border-indigo-300 transition-all duration-300">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3.5 rounded-2xl ${colors[color]} border transition-transform group-hover:scale-110 duration-500`}>
          <Icon size={22} />
        </div>
        <div className="flex flex-col items-end">
           <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Live</span>
           <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse mt-1"></div>
        </div>
      </div>
      <div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">{title}</p>
        <h4 className="text-2xl font-black text-slate-800 tracking-tight">{value}</h4>
        {subTitle && <p className="text-[10px] text-slate-400 font-bold mt-1 leading-none">{subTitle}</p>}
      </div>
    </div>
  );
};

export default DashboardAdmin;
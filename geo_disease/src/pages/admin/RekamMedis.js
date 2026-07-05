import React, { useState } from 'react';
import { 
  ClipboardList, 
  Search, 
  Activity, 
  MapPin,
  Stethoscope,
  Phone,
  HeartPulse,
  TrendingUp,
  AlertTriangle,
  FileDown,
  Thermometer,
  Calendar,
  Layers,
  Heart
} from 'lucide-react';
import { exportToExcel } from '../../utils/excelHelper';

const RekamMedis = ({ dataPasien = [], dataPenyakit = [], daftarKecamatan = [], refreshData, addLog, loading }) => {
  const [searchTerm, setSearchTerm] = useState('');

  // Logika filter pencarian multi-variabel (Nama, NIK, Penyakit, Wilayah, Bangsal)
  const filteredRecords = dataPasien.filter(pasien =>
    pasien.nama?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pasien.nik?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pasien.penyakit_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pasien.wilayah_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pasien.kamar?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Statistik Ringkas Rumah Sakit
  const totalPasien = dataPasien.length;
  const rawatInapCount = dataPasien.filter(p => p.status === 'Rawat Inap' || p.status === 'Perawatan').length;
  const icuCount = dataPasien.filter(p => p.status === 'ICU').length;
  const sembuhCount = dataPasien.filter(p => p.status === 'Sembuh').length;



  const handleExport = () => {
    const exportData = dataPasien.map((p, idx) => ({
      No: idx + 1,
      Nama: p.nama,
      NIK: p.nik || '-',
      'No HP': p.nomor_hp || '-',
      Umur: p.umur,
      'Gol Darah': p.gol_darah,
      'Tinggi (cm)': p.tinggi || 0,
      'Berat (kg)': p.berat || 0,
      'Suhu Tubuh (°C)': p.suhu || '36.5',
      'Tekanan Darah (mmHg)': p.tensi || '120/80',
      'Denyut Nadi (bpm)': p.nadi || '80',
      'Kecamatan Rujukan': p.wilayah_id,
      Diagnosa: p.penyakit_id,
      'Bangsal/Kamar': p.kamar || 'Bangsal Melati',
      Status: p.status,
      'Keluhan Utama': p.keluhan || '-',
      Alamat: p.alamat,
      'Tanggal Input': p.tanggal_input
    }));
    exportToExcel(exportData, 'Rekam_Medis_Rumah_Sakit');
  };



  return (
    <div className="bg-slate-50 min-h-screen p-6 antialiased space-y-6">
      
      {/* HOSPITAL MONITORING HEADER */}
      <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3.5 bg-rose-50 text-rose-600 rounded-3xl border border-rose-100">
            <HeartPulse size={28} className="animate-pulse" />
          </div>
          <div>
            <span className="text-[10px] bg-emerald-100 text-emerald-700 font-black uppercase tracking-widest px-2.5 py-1 rounded-full">
              Monitoring Read-Only Mode
            </span>
            <h1 className="text-xl font-black text-slate-800 tracking-tight mt-1 uppercase">
              Monitoring Rekam Medis Pasien
            </h1>
            <p className="text-xs text-slate-400 font-medium">Panel Monitoring Data Klinis Pasien (Sinkronisasi Real-time dari Dinkes)</p>
          </div>
        </div>
        
        {/* ACTION CONTROLS - EXPORT ONLY */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button 
            onClick={handleExport} 
            className="bg-emerald-50 text-emerald-700 border border-emerald-100 text-xs font-black px-4 py-3 rounded-2xl hover:bg-emerald-100 transition-all active:scale-95 flex items-center gap-2 uppercase tracking-wider"
          >
            <FileDown size={16} /> Ekspor Excel
          </button>
        </div>
      </div>

      {/* METRIC SUMMARIES */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-[2rem] border border-slate-100 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Pasien Terpantau</p>
            <h3 className="text-2xl font-black text-slate-800">{totalPasien} <span className="text-xs font-bold text-slate-400">Jiwa</span></h3>
          </div>
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl"><Activity size={22} /></div>
        </div>

        <div className="bg-white p-5 rounded-[2rem] border border-slate-100 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest">Hunian Rawat Inap</p>
            <h3 className="text-2xl font-black text-slate-800">{rawatInapCount} <span className="text-xs font-bold text-slate-400">Bed</span></h3>
          </div>
          <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl"><Layers size={22} /></div>
        </div>

        <div className="bg-white p-5 rounded-[2rem] border border-slate-100 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest">Kritis (ICU)</p>
            <h3 className="text-2xl font-black text-slate-800">{icuCount} <span className="text-xs font-bold text-slate-400">Bed</span></h3>
          </div>
          <div className="p-3 bg-rose-50 text-rose-600 rounded-2xl"><AlertTriangle size={22} /></div>
        </div>

        <div className="bg-white p-5 rounded-[2rem] border border-slate-100 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Angka Kesembuhan</p>
            <h3 className="text-2xl font-black text-slate-800">{sembuhCount} <span className="text-xs font-bold text-slate-400">Sembuh</span></h3>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl"><TrendingUp size={22} /></div>
        </div>
      </div>

      {/* FILTER & SEARCH */}
      <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input 
            type="text"
            placeholder="Cari Rekam Medis (Ketik Nama Pasien, NIK, Bangsal Kamar, Diagnosis, atau Wilayah Kecamatan)..."
            className="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-11 pr-5 py-3 text-xs font-bold text-slate-700 outline-none focus:ring-4 focus:ring-indigo-50 placeholder:text-slate-400 transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* MEDICAL RECORDS TABLE */}
        <div className="overflow-x-auto rounded-3xl border border-slate-100">
          <table className="w-full text-left border-collapse bg-white">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-400">
                <th className="px-6 py-4.5">Identitas Pasien</th>
                <th className="px-6 py-4.5">Tanda Vital Pasien</th>
                <th className="px-6 py-4.5">Bangsal & Wilayah</th>
                <th className="px-6 py-4.5">Hasil Diagnosa Klinis</th>
                <th className="px-6 py-4.5">Status Medis</th>
                <th className="px-6 py-4.5 text-center">Tindakan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 text-xs font-medium text-slate-600">
              {loading ? (
                <tr>
                  <td colSpan="6" className="text-center py-16 text-slate-400 font-bold">
                    Memuat data klinis pasien...
                  </td>
                </tr>
              ) : filteredRecords.length > 0 ? (
                filteredRecords.map((pasien) => (
                  <tr key={pasien.id} className="hover:bg-indigo-50/10 transition-colors group">
                    {/* Identity */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-slate-100 text-slate-700 font-black text-sm flex items-center justify-center shrink-0 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300">
                          {pasien.nama?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-black text-slate-800 text-sm tracking-tight">{pasien.nama}</div>
                          <div className="text-[10px] text-slate-400 font-bold mt-0.5">NIK: {pasien.nik || '-'}</div>
                          <div className="text-slate-400 flex items-center gap-1 mt-0.5 font-semibold text-[11px]">
                            <Phone size={11} className="text-slate-300" /> {pasien.nomor_hp || '-'}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Vitals */}
                    <td className="px-6 py-4 font-semibold text-slate-500 space-y-0.5">
                      <div>Umur/G.D: <span className="text-slate-800 font-bold">{pasien.umur || '0'} Th</span> | <span className="bg-slate-100 text-slate-700 font-black px-1 py-0.2 rounded text-[10px]">{pasien.gol_darah || '-'}</span></div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-1">
                        <span className="flex items-center gap-0.5 text-rose-600"><Thermometer size={12} /> {pasien.suhu || '36.5'}°C</span>
                        <span className="flex items-center gap-0.5 text-indigo-600"><Activity size={12} /> {pasien.tensi || '120/80'}</span>
                        <span className="flex items-center gap-0.5 text-emerald-600"><Heart size={12} /> {pasien.nadi || '80'} bpm</span>
                      </div>
                    </td>

                    {/* Ward & Origin */}
                    <td className="px-6 py-4 space-y-1">
                      <div className="font-bold text-indigo-700 bg-indigo-50 border border-indigo-100/60 px-2 py-0.5 rounded text-[11px] w-fit">
                        {pasien.kamar || 'Bangsal Melati'}
                      </div>
                      <div className="flex items-center gap-1 text-[10px] text-slate-400 font-bold">
                        <MapPin size={11} className="text-slate-300" /> Kec. {pasien.wilayah_id || '-'}
                      </div>
                    </td>

                    {/* Diagnosis */}
                    <td className="px-6 py-4 max-w-[200px]">
                      <div className="flex items-center gap-1.5 font-black text-indigo-600 bg-indigo-50/80 px-2.5 py-1.5 rounded-xl border border-indigo-100/60 w-fit">
                        <Stethoscope size={13} className="shrink-0" />
                        <span className="truncate">{pasien.penyakit_id || '-'}</span>
                      </div>
                      {pasien.keluhan && (
                        <p className="text-[10px] text-slate-400 font-semibold truncate mt-1 pl-1">Keluhan: {pasien.keluhan}</p>
                      )}
                    </td>

                    {/* Medical Status */}
                    <td className="px-6 py-4">
                      <div>
                        <span className={`inline-block text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md mb-1.5 ${
                          pasien.status === 'Sembuh' 
                            ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' 
                            : pasien.status === 'ICU' || pasien.status === 'Meninggal'
                            ? 'bg-rose-50 text-rose-600 border border-rose-100'
                            : 'bg-amber-50 text-amber-600 border border-amber-100'
                        }`}>
                          {pasien.status || 'Rawat Inap'}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-[9px] font-black text-emerald-600 uppercase tracking-tight">
                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                        Terverifikasi RS
                      </div>
                    </td>

                    {/* Actions - READ ONLY (No Edit/Delete for Admin Monitoring) */}
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <span className="text-[9px] bg-slate-100 text-slate-500 px-3 py-1.5 rounded-xl font-bold uppercase tracking-wider">
                          View Only
                        </span>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center py-16 text-slate-400 font-bold tracking-tight">
                    <ClipboardList size={32} className="mx-auto text-slate-200 mb-2" />
                    Tidak ada log rekam medis pasien yang sesuai.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>



    </div>
  );
};

export default RekamMedis;
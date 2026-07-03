import React, { useState, useRef } from 'react';
import axios from 'axios';
import { 
  ClipboardList, 
  Search, 
  Activity, 
  MapPin,
  Stethoscope,
  Phone,
  ShieldCheck,
  HeartPulse,
  TrendingUp,
  AlertTriangle,
  UserPlus,
  Edit3,
  Trash2,
  FileDown,
  FileUp,
  X,
  Thermometer,
  Calendar,
  Layers,
  Heart
} from 'lucide-react';
import { exportToExcel, readExcel } from '../../utils/excelHelper';

const RekamMedis = ({ dataPasien = [], dataPenyakit = [], daftarKecamatan = [], refreshData, addLog, loading }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedPasienId, setSelectedPasienId] = useState(null);
  const fileInputRef = useRef(null);

  // Form State
  const [formData, setFormData] = useState({
    nama: '',
    nik: '',
    nomor_hp: '',
    umur: '',
    gol_darah: 'A',
    tinggi: '',
    berat: '',
    wilayah_id: '',
    penyakit_id: '',
    status: 'Rawat Inap',
    alamat: '',
    suhu: '36.5',
    tensi: '120/80',
    nadi: '80',
    keluhan: '',
    kamar: 'Bangsal Melati',
    tanggal_input: new Date().toISOString().split('T')[0]
  });

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

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const openAddModal = () => {
    setIsEditMode(false);
    setSelectedPasienId(null);
    setFormData({
      nama: '',
      nik: '',
      nomor_hp: '',
      umur: '',
      gol_darah: 'A',
      tinggi: '',
      berat: '',
      wilayah_id: daftarKecamatan[0] || 'Balerejo',
      penyakit_id: dataPenyakit[0]?.nama || 'DBD',
      status: 'Rawat Inap',
      alamat: '',
      suhu: '36.5',
      tensi: '120/80',
      nadi: '80',
      keluhan: '',
      kamar: 'Bangsal Melati',
      tanggal_input: new Date().toISOString().split('T')[0]
    });
    setIsModalOpen(true);
  };

  const openEditModal = (pasien) => {
    setIsEditMode(true);
    setSelectedPasienId(pasien.id);
    setFormData({
      nama: pasien.nama || '',
      nik: pasien.nik || '',
      nomor_hp: pasien.nomor_hp || '',
      umur: pasien.umur || '',
      gol_darah: pasien.gol_darah || 'A',
      tinggi: pasien.tinggi || '',
      berat: pasien.berat || '',
      wilayah_id: pasien.wilayah_id || '',
      penyakit_id: pasien.penyakit_id || '',
      status: pasien.status || 'Rawat Inap',
      alamat: pasien.alamat || '',
      suhu: pasien.suhu || '36.5',
      tensi: pasien.tensi || '120/80',
      nadi: pasien.nadi || '80',
      keluhan: pasien.keluhan || '',
      kamar: pasien.kamar || 'Bangsal Melati',
      tanggal_input: pasien.tanggal_input || new Date().toISOString().split('T')[0]
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validasi NIK jika diinput
    if (formData.nik && formData.nik.length !== 16) {
      alert("Nomor NIK harus tepat 16 digit!");
      return;
    }

    try {
      if (isEditMode && selectedPasienId) {
        await axios.put(`http://127.0.0.1:5000/api/pasien/${selectedPasienId}`, formData);
        if (addLog) addLog("Update Rekam Medis", `Memperbarui data medis pasien ${formData.nama} (${formData.status} di ${formData.kamar})`);
      } else {
        await axios.post('http://127.0.0.1:5000/api/pasien', formData);
        if (addLog) addLog("Registrasi Pasien", `Mendaftarkan pasien baru ${formData.nama} di ${formData.kamar}`);
      }
      
      setIsModalOpen(false);
      if (refreshData) refreshData();
      alert("Data rekam medis berhasil disimpan!");
    } catch (error) {
      console.error("Gagal menyimpan rekam medis:", error);
      alert("Gagal menyimpan data rekam medis pasien.");
    }
  };

  const handleDelete = async (pasien) => {
    if (window.confirm(`Apakah Anda yakin ingin menghapus rekam medis atas nama ${pasien.nama} secara permanen?`)) {
      try {
        await axios.delete(`http://127.0.0.1:5000/api/pasien/${pasien.id}`);
        if (addLog) addLog("Hapus Rekam Medis", `Menghapus data rekam medis pasien ${pasien.nama}`);
        if (refreshData) refreshData();
        alert("Rekam medis berhasil dihapus!");
      } catch (error) {
        console.error("Gagal menghapus rekam medis:", error);
        alert("Gagal menghapus data pasien.");
      }
    }
  };

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

  const handleImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const parsedData = await readExcel(file);
      for (const row of parsedData) {
        await axios.post('http://127.0.0.1:5000/api/pasien', {
          nama: row['Nama'] || row['Nama Lengkap Pasien'] || '',
          nik: String(row['NIK'] || '').trim(),
          nomor_hp: String(row['No HP'] || row['Nomor HP / Kontak Keluarga'] || ''),
          umur: row['Umur'] || row['Umur (Tahun)'] || 0,
          gol_darah: row['Gol Darah'] || row['Gol. Darah'] || 'A',
          tinggi: row['Tinggi (cm)'] || row['Tinggi (cm)'] || 0,
          berat: row['Berat (kg)'] || row['Berat (kg)'] || 0,
          suhu: String(row['Suhu Tubuh (°C)'] || '36.5'),
          tensi: String(row['Tekanan Darah (mmHg)'] || '120/80'),
          nadi: String(row['Denyut Nadi (bpm)'] || '80'),
          wilayah_id: row['Kecamatan Rujukan'] || row['Wilayah Kecamatan (Kabupaten Madiun)'] || 'Balerejo',
          penyakit_id: row['Diagnosa'] || row['Jenis Penyakit Terdeteksi'] || 'DBD',
          kamar: row['Bangsal/Kamar'] || 'Bangsal Melati',
          status: row['Status'] || row['Status Kondisi Klinis'] || 'Rawat Inap',
          keluhan: row['Keluhan Utama'] || '',
          alamat: row['Alamat'] || row['Alamat Domisili Lengkap'] || '',
          tanggal_input: row['Tanggal Input'] || new Date().toISOString().split('T')[0]
        });
      }
      if (addLog) addLog("Import Massal RM", `Berhasil mengimpor ${parsedData.length} berkas rekam medis dari Excel`);
      if (refreshData) refreshData();
      alert(`Berhasil mengimpor ${parsedData.length} data rekam medis pasien!`);
    } catch (error) {
      console.error("Gagal mengimpor data:", error);
      alert("Terjadi kesalahan saat memproses berkas Excel.");
    }
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
            <span className="text-[10px] bg-slate-100 text-slate-600 font-black uppercase tracking-widest px-2.5 py-1 rounded-full">
              Hospital Command Center v2.5
            </span>
            <h1 className="text-xl font-black text-slate-800 tracking-tight mt-1 uppercase">
              Registrasi & Manajemen Rekam Medis
            </h1>
            <p className="text-xs text-slate-400 font-medium">Panel Operasional Input dan Manajemen Data Klinis Pasien</p>
          </div>
        </div>
        
        {/* ACTION CONTROLS */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button 
            onClick={openAddModal} 
            className="bg-indigo-600 text-white text-xs font-black px-4 py-3 rounded-2xl hover:bg-indigo-700 transition-all shadow-md shadow-indigo-200 active:scale-95 flex items-center gap-2 uppercase tracking-wider"
          >
            <UserPlus size={16} /> Registrasi Pasien
          </button>
          
          <button 
            onClick={handleExport} 
            className="bg-emerald-50 text-emerald-700 border border-emerald-100 text-xs font-black px-4 py-3 rounded-2xl hover:bg-emerald-100 transition-all active:scale-95 flex items-center gap-2 uppercase tracking-wider"
          >
            <FileDown size={16} /> Ekspor Excel
          </button>
          
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleImport} 
            accept=".xlsx, .xls" 
            className="hidden" 
          />
          <button 
            onClick={() => fileInputRef.current.click()} 
            className="bg-slate-100 text-slate-600 border border-slate-200 text-xs font-black px-4 py-3 rounded-2xl hover:bg-slate-200 transition-all active:scale-95 flex items-center gap-2 uppercase tracking-wider"
          >
            <FileUp size={16} /> Impor Excel
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

                    {/* Actions */}
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button 
                          onClick={() => openEditModal(pasien)} 
                          className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all" 
                          title="Perbarui Rekam Medis"
                        >
                          <Edit3 size={14} />
                        </button>
                        <button 
                          onClick={() => handleDelete(pasien)} 
                          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all" 
                          title="Hapus Rekam Medis"
                        >
                          <Trash2 size={14} />
                        </button>
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

      {/* REGISTRATION & EDIT MODAL DIALOG */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh]">
            
            <div className="bg-slate-50 px-8 py-5 border-b border-slate-100 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                  <UserPlus size={18} />
                </div>
                <div>
                  <h2 className="text-sm font-black text-slate-800 uppercase tracking-tight">
                    {isEditMode ? 'Perbarui Rekam Medis Pasien' : 'Registrasi Masuk Pasien Baru'}
                  </h2>
                  <p className="text-[10px] text-slate-400 font-medium">Input parameter klinis, bangsal perawatan, dan tanda vital</p>
                </div>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X size={18} /></button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 overflow-y-auto space-y-5 flex-1">
              
              {/* Nama & NIK */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InputField label="Nama Lengkap Pasien" value={formData.nama} onChange={(val) => handleInputChange('nama', val)} placeholder="Budi Santoso" />
                <InputField label="Nomor NIK (KTP - 16 Digit)" value={formData.nik} onChange={(val) => handleInputChange('nik', val)} placeholder="3519xxxxxxxxxxxx" type="number" />
              </div>

              {/* No HP & Umur & Gol Darah */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <InputField label="Nomor Kontak/HP" value={formData.nomor_hp} onChange={(val) => handleInputChange('nomor_hp', val)} placeholder="081234567xxx" icon={<Phone size={16} />} />
                <InputField label="Umur (Tahun)" type="number" value={formData.umur} onChange={(val) => handleInputChange('umur', val)} placeholder="Thn" />
                <SelectField label="Gol. Darah" value={formData.gol_darah} options={['A', 'B', 'AB', 'O']} onChange={(val) => handleInputChange('gol_darah', val)} />
              </div>

              {/* Tinggi & Berat & Tanggal Masuk */}
              <div className="grid grid-cols-3 gap-4">
                <InputField label="Tinggi (Cm)" type="number" value={formData.tinggi} onChange={(val) => handleInputChange('tinggi', val)} placeholder="Cm" />
                <InputField label="Berat (Kg)" type="number" value={formData.berat} onChange={(val) => handleInputChange('berat', val)} placeholder="Kg" />
                <InputField label="Tanggal Masuk RS" type="date" value={formData.tanggal_input} onChange={(val) => handleInputChange('tanggal_input', val)} icon={<Calendar size={16} />} />
              </div>

              {/* Tanda Vital Pasien */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-3">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tanda Vital Klinis Pasien</h4>
                <div className="grid grid-cols-3 gap-4">
                  <InputField label="Suhu Tubuh (°C)" value={formData.suhu} onChange={(val) => handleInputChange('suhu', val)} placeholder="Contoh: 36.8" />
                  <InputField label="Tekanan Darah" value={formData.tensi} onChange={(val) => handleInputChange('tensi', val)} placeholder="Contoh: 120/80" />
                  <InputField label="Denyut Nadi (bpm)" value={formData.nadi} onChange={(val) => handleInputChange('nadi', val)} placeholder="Contoh: 82" />
                </div>
              </div>

              {/* Rujukan & Bangsal & Diagnosa */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <SelectField 
                  label="Wilayah Rujukan (Kecamatan)" 
                  value={formData.wilayah_id} 
                  options={daftarKecamatan.length > 0 ? daftarKecamatan : ['Balerejo', 'Dagangan', 'Dolopo', 'Geger', 'Gemarang', 'Jiwan', 'Kare', 'Kebonsari', 'Madiun', 'Mejayan', 'Pilangkenceng', 'Saradan', 'Sawahan', 'Wonoasri', 'Wungu']} 
                  onChange={(val) => handleInputChange('wilayah_id', val)} 
                />
                <SelectField 
                  label="Kamar / Bangsal Perawatan" 
                  value={formData.kamar} 
                  options={['Bangsal Melati', 'Bangsal Dahlia', 'Bangsal ICU', 'Unit Gawat Darurat (IGD)', 'Rawat Jalan']} 
                  onChange={(val) => handleInputChange('kamar', val)} 
                />
                <SelectField 
                  label="Diagnosa Utama" 
                  value={formData.penyakit_id} 
                  options={dataPenyakit.length > 0 ? dataPenyakit.map(p => p.nama || p.id) : ['DBD', 'Pneumonia', 'Influenza', 'Typhoid', 'Diabetes Mellitus', 'Hipertensi']} 
                  onChange={(val) => handleInputChange('penyakit_id', val)} 
                />
              </div>

              {/* Status & Keluhan */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-1">
                  <SelectField 
                    label="Status Pasien" 
                    value={formData.status} 
                    options={['Rawat Inap', 'Rawat Jalan', 'ICU', 'Sembuh', 'Dirujuk', 'Meninggal']} 
                    onChange={(val) => handleInputChange('status', val)} 
                  />
                </div>
                <div className="sm:col-span-2">
                  <InputField label="Keluhan Utama / Gejala" value={formData.keluhan} onChange={(val) => handleInputChange('keluhan', val)} placeholder="Contoh: Demam naik turun 3 hari disertai mual" />
                </div>
              </div>

              {/* Alamat lengkap */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Alamat Domisili Lengkap</label>
                <textarea 
                  rows="2" 
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3 text-sm font-bold outline-none focus:ring-4 focus:ring-indigo-50 resize-none transition-all placeholder:text-slate-300" 
                  value={formData.alamat} 
                  onChange={(e) => handleInputChange('alamat', e.target.value)} 
                  placeholder="Nama jalan, RT/RW, kelurahan..." 
                  required 
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-4 border-t border-slate-100">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-6 py-4 rounded-2xl font-bold text-slate-500 hover:bg-slate-100 transition-all active:scale-95 text-xs uppercase tracking-wider">
                  Batal
                </button>
                <button type="submit" className="flex-1 bg-indigo-600 text-white px-6 py-4 rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 active:scale-95 flex items-center justify-center gap-2 text-xs uppercase tracking-wider">
                  Simpan Rekam Medis
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};

/* HELPER COMPONENTS */
const InputField = ({ label, type = "text", value, onChange, placeholder, icon }) => (
  <div className="space-y-2 w-full">
    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{label}</label>
    <div className="relative">
      {icon && <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">{icon}</div>}
      <input 
        type={type} 
        value={value} 
        onChange={(e) => onChange(e.target.value)} 
        placeholder={placeholder} 
        className={`w-full bg-slate-50 border border-slate-100 rounded-2xl ${icon ? 'pl-12' : 'px-5'} py-3.5 text-xs font-bold outline-none focus:ring-4 focus:ring-indigo-50 transition-all placeholder:text-slate-300`} 
        required 
      />
    </div>
  </div>
);

const SelectField = ({ label, value, options, onChange, placeholder }) => (
  <div className="space-y-2 w-full">
    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{label}</label>
    <select 
      value={value || ''} 
      onChange={(e) => onChange(e.target.value)} 
      className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3.5 text-xs font-bold outline-none focus:ring-4 focus:ring-indigo-50 transition-all appearance-none text-slate-700" 
      required
    >
      {placeholder && <option value="" disabled hidden>{placeholder}</option>}
      {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
    </select>
  </div>
);

export default RekamMedis;
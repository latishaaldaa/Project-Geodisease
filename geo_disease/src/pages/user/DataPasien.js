import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import API_BASE_URL from '../../config/api';
import { 
  FileDown, 
  FileUp, 
  UserPlus, 
  Search, 
  Trash2, 
  Edit3, 
  X, 
  CheckCircle2,
  MapPin,
  Stethoscope,
  Phone,
  Calendar,
  ClipboardList,
  User,
  Microscope,
  Hospital,
  Cigarette,
  Beer
} from 'lucide-react'; 
import { exportToExcel, readExcel } from '../../utils/excelHelper';

// ==========================================
// FUNGSI TAMBAHAN UNTUK KONVERSI TANGGAL EXCEL
// ==========================================
const convertExcelDate = (dateSource) => {
  if (!dateSource) return new Date().toISOString().split('T')[0];

  // Jika pustaka excel membaca langsung sebagai objek Date JavaScript
  if (dateSource instanceof Date && !isNaN(dateSource)) {
    return dateSource.toISOString().split('T')[0];
  }

  // Jika dibaca sebagai string "DD/MM/YYYY" atau "DD-MM-YYYY"
  const dateStr = String(dateSource).trim();
  const parts = dateStr.split(/[-/]/); 
  
  if (parts.length === 3) {
    const day = parts[0].padStart(2, '0');
    const month = parts[1].padStart(2, '0');
    const year = parts[2];
    
    // Menggabungkan kembali menjadi format YYYY-MM-DD yang dikenali <input type="date">
    return `${year}-${month}-${day}`;
  }

  // Jika format tidak dikenali, fallback ke tanggal hari ini
  return new Date().toISOString().split('T')[0];
};

const DataPasien = ({ dataPenyakit = [], daftarKecamatan = [], refreshData, role, addLog }) => {
  const [dataPasien, setDataPasien] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPasien, setSelectedPasien] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const fileInputRef = useRef(null);

  const fetchPasien = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/api/pasien`);
      console.log('Fetched pasien data from API:', response.data);
      if (response.data.length > 0) {
        console.log('Sample first patient data:', response.data[0]);
        console.log('Sample first patient boolean fields:', {
          riwayat_dm: response.data[0].riwayat_dm,
          riwayat_hipertensi: response.data[0].riwayat_hipertensi,
          riwayat_jantung: response.data[0].riwayat_jantung,
          riwayat_kanker: response.data[0].riwayat_kanker,
          riwayat_stroke: response.data[0].riwayat_stroke
        });
      }
      setDataPasien(response.data);
    } catch (error) {
      console.error("Gagal mengambil data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPasien();
  }, []);

  const [formData, setFormData] = useState({
    // Data Registrasi & Identitas
    nomor_registrasi: '',
    nama: '',
    nik: '',
    nomor_hp: '',
    umur: '',
    jenis_kelamin: '',
    gol_darah: 'A',
    
    // Data Antropometri & Vital Sign
    tinggi: '',
    berat: '',
    imt_skor: '',
    status_gizi: '',
    sistole: '',
    diastole: '',
    tekanan_darah: '',
    gula_darah: '',
    
    // Data Geografis
    wilayah_id: '',
    alamat: '',
    latitude: '',
    longitude: '',
    
    // Data Diagnosis & Status
    penyakit_id: '',
    status: 'Perawatan',
    tanggal_input: new Date().toISOString().split('T')[0],
    
    // Data Skrining & Riwayat
    riwayat_dm: false,
    riwayat_hipertensi: false,
    riwayat_jantung: false,
    riwayat_kanker: false,
    riwayat_stroke: false,
    merokok: false,
    konsumsi_alkohol: false,
    kurang_olahraga: false,
    pola_makan_tidak_sehat: false,
    riwayat_pribadi: ''
  });

  const openAddModal = () => {
    setIsEditMode(false);
    setSelectedPasien(null);
    setFormData({
      nomor_registrasi: `CKG-${Date.now().toString(36).toUpperCase()}`,
      nama: '',
      nik: '',
      nomor_hp: '',
      umur: '',
      jenis_kelamin: '',
      gol_darah: 'A',
      tinggi: '',
      berat: '',
      imt_skor: '',
      status_gizi: '',
      sistole: '',
      diastole: '',
      tekanan_darah: '',
      gula_darah: '',
      wilayah_id: '',
      alamat: '',
      latitude: '',
      longitude: '',
      penyakit_id: '',
      status: 'Perawatan',
      tanggal_input: new Date().toISOString().split('T')[0],
      riwayat_dm: false,
      riwayat_hipertensi: false,
      riwayat_jantung: false,
      riwayat_kanker: false,
      riwayat_stroke: false,
      merokok: false,
      konsumsi_alkohol: false,
      kurang_olahraga: false,
      pola_makan_tidak_sehat: false,
      riwayat_pribadi: ''
    });
    setIsModalOpen(true);
  };

  const openEditModal = (pasien) => {
    setIsEditMode(true);
    setSelectedPasien(pasien);
    
    // Debug: Log data pasien dari API
    console.log('Opening edit modal with pasien data:', pasien);
    console.log('Boolean fields:', {
      riwayat_dm: pasien.riwayat_dm,
      riwayat_hipertensi: pasien.riwayat_hipertensi,
      riwayat_jantung: pasien.riwayat_jantung,
      riwayat_kanker: pasien.riwayat_kanker,
      riwayat_stroke: pasien.riwayat_stroke
    });
    
    setFormData({
      nomor_registrasi: pasien.nomor_registrasi || '',
      nama: pasien.nama || '',
      nik: pasien.nik || '',
      nomor_hp: pasien.nomor_hp || '',
      umur: pasien.umur || '',
      jenis_kelamin: pasien.jenis_kelamin || '',
      gol_darah: pasien.gol_darah || 'A',
      tinggi: pasien.tinggi || '',
      berat: pasien.berat || '',
      imt_skor: pasien.imt_skor || '',
      status_gizi: pasien.status_gizi || '',
      sistole: pasien.sistole || '',
      diastole: pasien.diastole || '',
      tekanan_darah: pasien.tekanan_darah || '',
      gula_darah: pasien.gula_darah || '',
      wilayah_id: pasien.wilayah_id || '',
      alamat: pasien.alamat || '',
      latitude: pasien.latitude || '',
      longitude: pasien.longitude || '',
      penyakit_id: pasien.penyakit_id || '',
      status: pasien.status || 'Perawatan',
      tanggal_input: pasien.tanggal_input || new Date().toISOString().split('T')[0],
      riwayat_dm: Boolean(pasien.riwayat_dm),
      riwayat_hipertensi: Boolean(pasien.riwayat_hipertensi),
      riwayat_jantung: Boolean(pasien.riwayat_jantung),
      riwayat_kanker: Boolean(pasien.riwayat_kanker),
      riwayat_stroke: Boolean(pasien.riwayat_stroke),
      merokok: Boolean(pasien.merokok),
      konsumsi_alkohol: Boolean(pasien.konsumsi_alkohol),
      kurang_olahraga: Boolean(pasien.kurang_olahraga),
      pola_makan_tidak_sehat: Boolean(pasien.pola_makan_tidak_sehat),
      riwayat_pribadi: pasien.riwayat_pribadi || ''
    });
    setIsModalOpen(true);
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditMode && selectedPasien) {
        await axios.put(`${API_BASE_URL}/api/pasien/${selectedPasien.id}`, formData);
        if (addLog) addLog("Perbarui Pasien", `Mengubah data klinis pasien atas nama ${formData.nama}`);
      } else {
        await axios.post(`${API_BASE_URL}/api/pasien`, formData);
        if (addLog) addLog("Tambah Pasien", `Berhasil mendaftarkan pasien baru atas nama ${formData.nama}`);
      }
      fetchPasien();
      if (refreshData) refreshData();
      setIsModalOpen(false);
    } catch (error) {
      console.error("Gagal menyimpan data:", error);
      alert("Terjadi kesalahan saat menyimpan data pasien.");
    }
  };

  const handleDelete = async (id) => {
    const pasienTarget = dataPasien.find(p => p.id === id);
    const namaPasien = pasienTarget ? pasienTarget.nama : id;

    if (window.confirm(`Apakah Anda yakin ingin menghapus data pasien ${namaPasien} secara permanen?`)) {
      try {
        await axios.delete(`${API_BASE_URL}/api/pasien/${id}`);
        if (addLog) addLog("Hapus Pasien", `Menghapus data rekam medis pasien atas nama ${namaPasien}`);
        fetchPasien();
        if (refreshData) refreshData();
      } catch (error) {
        console.error("Gagal menghapus data:", error);
        alert("Gagal menghapus data pasien.");
      }
    }
  };

  const handleImportExcel = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    try {
      const parsedData = await readExcel(file);
      
      // Debug: Log parsed data
      console.log('Parsed Excel Data:', parsedData);
      console.log('Total rows:', parsedData.length);
      
      if (!parsedData || parsedData.length === 0) {
        alert("File Excel kosong atau tidak memiliki data yang valid.");
        return;
      }
      
      // Debug: Log first row to check column names
      if (parsedData.length > 0) {
        console.log('First row keys:', Object.keys(parsedData[0]));
        console.log('First row data:', parsedData[0]);
      }
      
      let successCount = 0;
      let errorCount = 0;
      
      for (const row of parsedData) {
        try {
          // Skip empty rows
          if (!row['Nama Lengkap Pasien'] && !row['nama'] && !row['nama_lengkap']) {
            console.log('Skipping empty row');
            continue;
          }
          
          // Helper function to check boolean values from Excel
          const checkBoolean = (value) => {
            // Log untuk debugging
            if (value !== undefined && value !== null && value !== '' && value !== 'Tidak' && value !== 'tidak') {
              console.log('Boolean value detected:', value, 'Type:', typeof value);
            }
            
            // Handle various true values
            if (value === true || value === 1 || value === '1') return true;
            if (typeof value === 'string') {
              const lowerValue = value.toLowerCase().trim();
              if (lowerValue === 'ya' || lowerValue === 'yes' || lowerValue === 'true') return true;
            }
            
            // Everything else is false (including 'Tidak', 'tidak', 'No', 'no', 0, '0', false, null, undefined, '')
            return false;
          };
          
          const pasienData = {
            nomor_registrasi: row['No. Registrasi'] || row['no_registrasi_ckg'] || row['nomor_registrasi'] || `CKG-${Date.now().toString(36).toUpperCase()}`,
            nama: row['Nama Lengkap Pasien'] || row['nama_lengkap'] || row['nama'] || '',
            nik: row['NIK'] || row['nik'] || '',
            nomor_hp: row['Nomor HP / Kontak Keluarga'] || row['no_hp'] || row['nomor_hp'] || '',
            umur: parseInt(row['Umur (Tahun)'] || row['umur'] || 0),
            jenis_kelamin: row['Jenis Kelamin'] || row['jenis_kelamin'] || '',
            gol_darah: row['Gol. Darah'] || row['gol_darah'] || 'A',
            tinggi: parseFloat(row['Tinggi (cm)'] || row['tinggi_cm'] || row['tinggi'] || 0),
            berat: parseFloat(row['Berat (kg)'] || row['berat_kg'] || row['berat'] || 0),
            imt_skor: parseFloat(row['IMT Skor'] || row['imt'] || row['imt_skor'] || 0),
            status_gizi: row['Status Gizi'] || row['status_gizi'] || '',
            sistole: parseFloat(row['Sistole (mmHg)'] || row['sistole'] || 0),
            diastole: parseFloat(row['Diastole (mmHg)'] || row['diastole'] || 0),
            tekanan_darah: row['Tekanan Darah'] || row['tekanan_darah'] || '',
            gula_darah: parseFloat(row['Gula Darah (mg/dL)'] || row['gula_darah'] || 0),
            wilayah_id: row['Wilayah Kecamatan (Kabupaten Madiun)'] || row['kecamatan'] || row['wilayah_id'] || '',
            alamat: row['Alamat Domisili Lengkap'] || row['alamat'] || '',
            latitude: parseFloat(row['Latitude'] || row['latitude'] || 0),
            longitude: parseFloat(row['Longitude'] || row['longitude'] || 0),
            penyakit_id: row['Jenis Penyakit Terdeteksi'] || row['jenis_penyakit'] || row['penyakit_id'] || '',
            status: row['Status Kondisi Klinis'] || row['status_klinis'] || row['status'] || 'Perawatan',
            tanggal_input: convertExcelDate(row['Tanggal Diagnosis Input'] || row['tanggal_input']),
            riwayat_dm: checkBoolean(row['Riwayat DM'] || row['riwayat_diabetes'] || row['riwayat_dm']),
            riwayat_hipertensi: checkBoolean(row['Riwayat Hipertensi'] || row['riwayat_hipertensi']),
            riwayat_jantung: checkBoolean(row['Riwayat Jantung'] || row['riwayat_jantung']),
            riwayat_kanker: checkBoolean(row['Riwayat Kanker'] || row['riwayat_kanker']),
            riwayat_stroke: checkBoolean(row['Riwayat Stroke'] || row['riwayat_stroke']),
            merokok: checkBoolean(row['Merokok'] || row['merokok']),
            konsumsi_alkohol: checkBoolean(row['Konsumsi Alkohol'] || row['konsumsi_alkohol']),
            kurang_olahraga: checkBoolean(row['Kurang Olahraga'] || row['kurang_olahraga']),
            pola_makan_tidak_sehat: checkBoolean(row['Pola Makan Tidak Sehat'] || row['pola_makan_tidak_sehat']),
            riwayat_pribadi: row['Riwayat Penyakit Pribadi'] || row['riwayat_pribadi'] || ''
          };
          
          console.log('=== Row Excel Data ===');
          console.log('Nama:', row['nama_lengkap']);
          console.log('Raw riwayat values from Excel:', {
            riwayat_diabetes: row['riwayat_diabetes'],
            riwayat_hipertensi: row['riwayat_hipertensi'],
            riwayat_jantung: row['riwayat_jantung'],
            riwayat_kanker: row['riwayat_kanker'],
            riwayat_stroke: row['riwayat_stroke'],
            merokok: row['merokok'],
            konsumsi_alkohol: row['konsumsi_alkohol'],
            kurang_olahraga: row['kurang_olahraga'],
            pola_makan_tidak_sehat: row['pola_makan_tidak_sehat']
          });
          console.log('Converted boolean values:', {
            riwayat_dm: pasienData.riwayat_dm,
            riwayat_hipertensi: pasienData.riwayat_hipertensi,
            riwayat_jantung: pasienData.riwayat_jantung,
            riwayat_kanker: pasienData.riwayat_kanker,
            riwayat_stroke: pasienData.riwayat_stroke,
            merokok: pasienData.merokok,
            konsumsi_alkohol: pasienData.konsumsi_alkohol,
            kurang_olahraga: pasienData.kurang_olahraga,
            pola_makan_tidak_sehat: pasienData.pola_makan_tidak_sehat
          });
          console.log('Full posting data:', pasienData);
          console.log('======================');
          await axios.post(`${API_BASE_URL}/api/pasien`, pasienData);
          successCount++;
        } catch (rowError) {
          console.error('Error importing row:', row, rowError);
          errorCount++;
        }
      }
      
      if (addLog) addLog("Import Excel", `Berhasil mengimpor ${successCount} data pasien dari file Excel (${errorCount} gagal)`);
      
      fetchPasien();
      if (refreshData) refreshData();
      
      if (errorCount > 0) {
        alert(`Sukses mengimpor ${successCount} data pasien dari Excel!\n${errorCount} baris gagal diimpor. Lihat console untuk detail.`);
      } else {
        alert(`Sukses mengimpor ${successCount} data pasien dari Excel!`);
      }
    } catch (error) {
      console.error("Gagal mengimpor data:", error);
      alert(`Gagal memproses file Excel: ${error.message}`);
    } finally {
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleExportExcel = () => {
    const mappedData = dataPasien.map((p, index) => ({
      'No': index + 1,
      'No. Registrasi': p.nomor_registrasi || '',
      'Nama Lengkap Pasien': p.nama,
      'NIK': p.nik || '',
      'Nomor HP / Kontak Keluarga': p.nomor_hp || '',
      'Umur (Tahun)': p.umur,
      'Jenis Kelamin': p.jenis_kelamin || '',
      'Gol. Darah': p.gol_darah,
      'Tinggi (cm)': p.tinggi,
      'Berat (kg)': p.berat,
      'IMT Skor': p.imt_skor || '',
      'Status Gizi': p.status_gizi || '',
      'Sistole (mmHg)': p.sistole || '',
      'Diastole (mmHg)': p.diastole || '',
      'Tekanan Darah': p.tekanan_darah || '',
      'Gula Darah (mg/dL)': p.gula_darah || '',
      'Wilayah Kecamatan (Kabupaten Madiun)': p.wilayah_id,
      'Alamat Domisili Lengkap': p.alamat || '',
      'Latitude': p.latitude || '',
      'Longitude': p.longitude || '',
      'Jenis Penyakit Terdeteksi': p.penyakit_id,
      'Status Kondisi Klinis': p.status,
      'Tanggal Diagnosis Input': p.tanggal_input,
      'Riwayat DM': p.riwayat_dm ? 'Ya' : 'Tidak',
      'Riwayat Hipertensi': p.riwayat_hipertensi ? 'Ya' : 'Tidak',
      'Riwayat Jantung': p.riwayat_jantung ? 'Ya' : 'Tidak',
      'Riwayat Kanker': p.riwayat_kanker ? 'Ya' : 'Tidak',
      'Riwayat Stroke': p.riwayat_stroke ? 'Ya' : 'Tidak',
      'Merokok': p.merokok ? 'Ya' : 'Tidak',
      'Konsumsi Alkohol': p.konsumsi_alkohol ? 'Ya' : 'Tidak',
      'Kurang Olahraga': p.kurang_olahraga ? 'Ya' : 'Tidak',
      'Pola Makan Tidak Sehat': p.pola_makan_tidak_sehat ? 'Ya' : 'Tidak',
      'Riwayat Penyakit Pribadi': p.riwayat_pribadi || ''
    }));
    exportToExcel(mappedData, 'Data_Pasien_Surveilans_Lengkap');
  };

  const filteredPasien = dataPasien.filter(p => 
    p.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.penyakit_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.wilayah_id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-white p-6 rounded-[2.5rem] shadow-xl border border-slate-100 space-y-6 antialiased">
      
      {/* HEADER CONTROL PANEL */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-50 pb-5">
        <div>
          <h1 className="text-base font-black text-slate-800 tracking-tight">Manajemen Registrasi Pasien</h1>
          <p className="text-xs text-slate-400 font-medium">Data Demografi & Rekam Epidemiologi Wilayah</p>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:flex-initial">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="Cari nama, penyakit, wilayah..." 
              className="w-full md:w-64 bg-slate-50 border border-slate-100 rounded-2xl pl-11 pr-5 py-2.5 text-xs font-bold text-slate-700 outline-none focus:ring-4 focus:ring-indigo-50 placeholder:text-slate-400 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <button onClick={openAddModal} className="bg-indigo-600 text-white text-xs font-bold px-4 py-3 rounded-2xl hover:bg-indigo-700 transition-all shadow-md shadow-indigo-200 active:scale-95 flex items-center gap-2">
            <UserPlus size={16} /> Tambah Pasien
          </button>

          <button onClick={handleExportExcel} className="bg-emerald-50 text-emerald-700 border border-emerald-100 text-xs font-bold px-4 py-3 rounded-2xl hover:bg-emerald-100 transition-all active:scale-95 flex items-center gap-2">
            <FileDown size={16} /> Export
          </button>

          <input type="file" ref={fileInputRef} onChange={handleImportExcel} accept=".xlsx, .xls" className="hidden" />
          <button onClick={() => fileInputRef.current.click()} className="bg-slate-50 text-slate-600 border border-slate-100 text-xs font-bold px-4 py-3 rounded-2xl hover:bg-slate-100 transition-all active:scale-95 flex items-center gap-2">
            <FileUp size={16} /> Import
          </button>
        </div>
      </div>

      {/* DATA TABLE */}
      <div className="overflow-x-auto rounded-3xl border border-slate-100 shadow-sm">
        <table className="w-full text-left border-collapse bg-white">
          <thead>
            <tr className="bg-slate-50/70 border-b border-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-400">
              <th className="px-5 py-4">Identitas Pasien</th>
              <th className="px-5 py-4">Data Fisik & Vital Sign</th>
              <th className="px-5 py-4">Wilayah & Alamat</th>
              <th className="px-5 py-4">Diagnosis</th>
              <th className="px-5 py-4">Riwayat Kesehatan</th>
              <th className="px-5 py-4 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50 text-xs font-medium text-slate-700">
            {loading ? (
              <tr>
                <td colSpan="6" className="text-center py-12 text-slate-400 font-bold">Memuat basis data pasien surveilans...</td>
              </tr>
            ) : filteredPasien.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center py-12 text-slate-400 font-bold">Tidak ada data pasien yang cocok.</td>
              </tr>
            ) : (
              filteredPasien.map((pasien) => (
                <tr key={pasien.id} className="hover:bg-slate-50/50 transition-colors">
                  {/* IDENTITAS PASIEN */}
                  <td className="px-5 py-4">
                    <div className="font-black text-slate-800 text-sm mb-1">{pasien.nama}</div>
                    {pasien.nik && (
                      <div className="text-[10px] text-slate-400 font-mono mb-1">NIK: {pasien.nik}</div>
                    )}
                    <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
                      <Phone size={11} className="text-slate-400" /> {pasien.nomor_hp || '-'}
                    </div>
                    <div className="mt-1.5 flex items-center gap-2">
                      {pasien.jenis_kelamin && (
                        <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-[10px] font-bold">
                          <User size={12} className="inline" /> {pasien.jenis_kelamin}
                        </span>
                      )}
                      <span className="bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded text-[10px] font-bold">
                        {pasien.umur} Thn
                      </span>
                      <span className="bg-rose-50 text-rose-700 px-2 py-0.5 rounded text-[10px] font-bold">
                        Gol. {pasien.gol_darah}
                      </span>
                    </div>
                  </td>

                  {/* DATA FISIK & VITAL SIGN */}
                  <td className="px-5 py-4">
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-slate-400 font-semibold">TB/BB:</span>
                        <span className="text-[11px] text-slate-800 font-bold">{pasien.tinggi || '-'}cm / {pasien.berat || '-'}kg</span>
                      </div>
                      {pasien.imt_skor && (
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] text-slate-400 font-semibold">IMT:</span>
                          <div className="flex items-center gap-1.5">
                            <span className="text-[11px] text-slate-800 font-bold">{pasien.imt_skor}</span>
                            {pasien.status_gizi && (
                              <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${
                                pasien.status_gizi.includes('Obesitas') || pasien.status_gizi.includes('Gizi Lebih') ? 'bg-red-50 text-red-600' :
                                pasien.status_gizi.includes('Kurus') || pasien.status_gizi.includes('Kurang') ? 'bg-amber-50 text-amber-600' :
                                'bg-emerald-50 text-emerald-600'
                              }`}>
                                {pasien.status_gizi}
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                      {pasien.tekanan_darah && (
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] text-slate-400 font-semibold">TD:</span>
                          <span className="text-[11px] text-rose-600 font-bold">{pasien.tekanan_darah} mmHg</span>
                        </div>
                      )}
                      {pasien.gula_darah && (
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] text-slate-400 font-semibold">GDS:</span>
                          <span className="text-[11px] text-amber-600 font-bold">{pasien.gula_darah} mg/dL</span>
                        </div>
                      )}
                    </div>
                  </td>

                  {/* WILAYAH & ALAMAT */}
                  <td className="px-5 py-4 max-w-[200px]">
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <MapPin size={12} className="text-rose-500 shrink-0" />
                      <span className="font-bold text-slate-700 text-[11px]">Kec. {pasien.wilayah_id}</span>
                    </div>
                    <div className="text-slate-500 text-[10px] leading-relaxed line-clamp-2">
                      {pasien.alamat || '-'}
                    </div>
                  </td>

                  {/* DIAGNOSIS */}
                  <td className="px-5 py-4 align-top min-w-[180px]">
                    <div className="space-y-2">
                      <div className="flex items-center gap-1.5 bg-indigo-50 px-2.5 py-1.5 rounded-lg border border-indigo-100">
                        <Stethoscope size={12} className="text-indigo-600 shrink-0" />
                        <span className="text-[11px] font-bold text-indigo-700 line-clamp-1">{pasien.penyakit_id}</span>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className={`inline-block text-[9px] font-black uppercase tracking-wider px-2 py-1 rounded-md w-fit ${
                          pasien.status === 'Sembuh' ? 'bg-emerald-50 text-emerald-600' : 
                          pasien.status === 'Rujukan' ? 'bg-red-50 text-red-600' :
                          pasien.status === 'Isolasi Mandiri' ? 'bg-blue-50 text-blue-600' :
                          'bg-amber-50 text-amber-600'
                        }`}>
                          {pasien.status}
                        </span>
                        {pasien.tanggal_input && (
                          <div className="text-[10px] text-slate-400 flex items-center gap-1">
                            <Calendar size={9} /> {pasien.tanggal_input}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* RIWAYAT KESEHATAN */}
                  <td className="px-5 py-4 align-top min-w-[220px]">
                    <div className="space-y-2 text-[10px]">
                      {/* Riwayat Penyakit Keluarga */}
                      {(pasien.riwayat_dm || pasien.riwayat_hipertensi || pasien.riwayat_jantung || pasien.riwayat_kanker || pasien.riwayat_stroke) && (
                        <div>
                          <div className="text-slate-400 font-bold mb-1.5 uppercase tracking-wide text-[9px]">Riwayat Keluarga</div>
                          <div className="flex flex-wrap gap-1">
                            {pasien.riwayat_dm && <span className="bg-rose-50 text-rose-600 px-2 py-0.5 rounded font-bold text-[9px]">DM</span>}
                            {pasien.riwayat_hipertensi && <span className="bg-rose-50 text-rose-600 px-2 py-0.5 rounded font-bold text-[9px]">Hipertensi</span>}
                            {pasien.riwayat_jantung && <span className="bg-rose-50 text-rose-600 px-2 py-0.5 rounded font-bold text-[9px]">Jantung</span>}
                            {pasien.riwayat_kanker && <span className="bg-rose-50 text-rose-600 px-2 py-0.5 rounded font-bold text-[9px]">Kanker</span>}
                            {pasien.riwayat_stroke && <span className="bg-rose-50 text-rose-600 px-2 py-0.5 rounded font-bold text-[9px]">Stroke</span>}
                          </div>
                        </div>
                      )}
                      
                      {/* Faktor Risiko Gaya Hidup */}
                      {(pasien.merokok || pasien.konsumsi_alkohol || pasien.kurang_olahraga || pasien.pola_makan_tidak_sehat) && (
                        <div>
                          <div className="text-slate-400 font-bold mb-1.5 uppercase tracking-wide text-[9px]">Gaya Hidup</div>
                          <div className="flex flex-wrap gap-1">
                            {pasien.merokok && <span className="bg-amber-50 text-amber-600 px-2 py-0.5 rounded font-bold text-[9px] flex items-center gap-1"><Cigarette size={10} /> Merokok</span>}
                            {pasien.konsumsi_alkohol && <span className="bg-amber-50 text-amber-600 px-2 py-0.5 rounded font-bold text-[9px] flex items-center gap-1"><Beer size={10} /> Alkohol</span>}
                            {pasien.kurang_olahraga && <span className="bg-amber-50 text-amber-600 px-2 py-0.5 rounded font-bold text-[9px]">Kurang OR</span>}
                            {pasien.pola_makan_tidak_sehat && <span className="bg-amber-50 text-amber-600 px-2 py-0.5 rounded font-bold text-[9px]">Diet Buruk</span>}
                          </div>
                        </div>
                      )}

                      {/* Riwayat Pribadi */}
                      {pasien.riwayat_pribadi && (
                        <div className="pt-2 border-t border-slate-100">
                          <div className="text-slate-400 font-bold mb-1 uppercase tracking-wide text-[9px]">Catatan</div>
                          <div className="text-slate-500 text-[10px] leading-relaxed line-clamp-2">
                            {pasien.riwayat_pribadi}
                          </div>
                        </div>
                      )}

                      {/* Jika tidak ada riwayat sama sekali */}
                      {!pasien.riwayat_dm && !pasien.riwayat_hipertensi && !pasien.riwayat_jantung && !pasien.riwayat_kanker && !pasien.riwayat_stroke && !pasien.merokok && !pasien.konsumsi_alkohol && !pasien.kurang_olahraga && !pasien.pola_makan_tidak_sehat && !pasien.riwayat_pribadi && (
                        <div className="text-slate-300 text-center py-3 text-[10px] italic">
                          Tidak ada riwayat kesehatan
                        </div>
                      )}
                    </div>
                  </td>

                  {/* AKSI */}
                  <td className="px-5 py-4 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <button onClick={() => openEditModal(pasien)} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all" title="Edit Data">
                        <Edit3 size={14} />
                      </button>
                      <button onClick={() => handleDelete(pasien.id)} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all" title="Hapus Data">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* REGISTER/EDIT MODAL DIALOG */}
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
                    {isEditMode ? 'Perbarui Rekam Pasien' : 'Registrasi Pasien Baru'}
                  </h2>
                  <p className="text-[10px] text-slate-400 font-medium">Lengkapi variabel demografi epidemiologi daerah</p>
                </div>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X size={18} /></button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 overflow-y-auto space-y-6 flex-1">
              
              {/* SECTION 1: REGISTRASI & IDENTITAS */}
              <div className="space-y-4">
                <h3 className="text-xs font-black text-indigo-600 uppercase tracking-wider border-b border-indigo-100 pb-2 flex items-center gap-1.5"><ClipboardList size={14} /> Data Registrasi & Identitas</h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <InputField label="No. Registrasi CKG" value={formData.nomor_registrasi} onChange={(val) => handleInputChange('nomor_registrasi', val)} placeholder="Auto-generate" />
                  <InputField label="NIK (16 Digit)" value={formData.nik} onChange={(val) => handleInputChange('nik', val)} placeholder="3500010101990001" maxLength="16" />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <InputField label="Nama Lengkap Pasien" value={formData.nama} onChange={(val) => handleInputChange('nama', val)} placeholder="Contoh: Budi Santoso" />
                  <InputField label="Nomor HP / Kontak Keluarga" value={formData.nomor_hp} onChange={(val) => handleInputChange('nomor_hp', val)} placeholder="Contoh: 08123456xxx" icon={<Phone size={16} />} />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <InputField label="Umur (Tahun)" type="number" value={formData.umur} onChange={(val) => handleInputChange('umur', val)} placeholder="Thn" />
                  <SelectField label="Jenis Kelamin" value={formData.jenis_kelamin} options={['Laki-laki', 'Perempuan']} onChange={(val) => handleInputChange('jenis_kelamin', val)} placeholder="Pilih" />
                  <SelectField label="Gol. Darah" value={formData.gol_darah} options={['A', 'B', 'AB', 'O']} onChange={(val) => handleInputChange('gol_darah', val)} />
                  <InputField label="Tanggal Input" type="date" value={formData.tanggal_input} onChange={(val) => handleInputChange('tanggal_input', val)} icon={<Calendar size={16} />} />
                </div>
              </div>

              {/* SECTION 2: PEMERIKSAAN FISIK & VITAL SIGN */}
              <div className="space-y-4">
                <h3 className="text-xs font-black text-emerald-600 uppercase tracking-wider border-b border-emerald-100 pb-2">🩺 Pemeriksaan Fisik & Vital Sign</h3>
                
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <InputField label="Tinggi (cm)" type="number" value={formData.tinggi} onChange={(val) => handleInputChange('tinggi', val)} placeholder="165" />
                  <InputField label="Berat (kg)" type="number" value={formData.berat} onChange={(val) => handleInputChange('berat', val)} placeholder="60" />
                  <InputField label="IMT Skor" type="number" step="0.1" value={formData.imt_skor} onChange={(val) => handleInputChange('imt_skor', val)} placeholder="Auto" />
                  <InputField label="Status Gizi" value={formData.status_gizi} onChange={(val) => handleInputChange('status_gizi', val)} placeholder="Normal/Obesitas" />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <InputField label="Sistole (mmHg)" type="number" value={formData.sistole} onChange={(val) => handleInputChange('sistole', val)} placeholder="120" />
                  <InputField label="Diastole (mmHg)" type="number" value={formData.diastole} onChange={(val) => handleInputChange('diastole', val)} placeholder="80" />
                  <InputField label="Tekanan Darah" value={formData.tekanan_darah} onChange={(val) => handleInputChange('tekanan_darah', val)} placeholder="120/80" />
                  <InputField label="Gula Darah (mg/dL)" type="number" value={formData.gula_darah} onChange={(val) => handleInputChange('gula_darah', val)} placeholder="110" />
                </div>
              </div>

              {/* SECTION 3: DATA GEOGRAFIS */}
              <div className="space-y-4">
                <h3 className="text-xs font-black text-rose-600 uppercase tracking-wider border-b border-rose-100 pb-2 flex items-center gap-1.5"><MapPin size={14} /> Data Geografis & Wilayah</h3>
                
                <div className="grid grid-cols-1 gap-4">
                  <SelectField 
                    label="Wilayah Kecamatan (Madiun)" 
                    value={formData.wilayah_id} 
                    options={daftarKecamatan} 
                    placeholder="Pilih Kecamatan"
                    onChange={(val) => handleInputChange('wilayah_id', val)} 
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Alamat Domisili Lengkap</label>
                  <textarea rows="2" className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-sm font-bold outline-none focus:ring-4 focus:ring-indigo-50 resize-none transition-all placeholder:text-slate-300" value={formData.alamat} onChange={(e) => handleInputChange('alamat', e.target.value)} placeholder="Tuliskan nama jalan, RT/RW, dan kelurahan tinggal..." required />
                </div>
              </div>

              {/* SECTION 4: DIAGNOSIS & STATUS */}
              <div className="space-y-4">
                <h3 className="text-xs font-black text-amber-600 uppercase tracking-wider border-b border-amber-100 pb-2 flex items-center gap-1.5"><Microscope size={14} /> Diagnosis & Status Klinis</h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <InputField label="Jenis Penyakit Terdeteksi" value={formData.penyakit_id} onChange={(val) => handleInputChange('penyakit_id', val)} placeholder="DBD, Influenza, Hipertensi, dll" icon={<Stethoscope size={16} />} />
                  <SelectField label="Status Kondisi Klinis" value={formData.status} options={['Perawatan', 'Sembuh', 'Isolasi Mandiri', 'Rujukan', 'Meninggal']} onChange={(val) => handleInputChange('status', val)} />
                </div>
              </div>

              {/* SECTION 5: SKRINING & RIWAYAT */}
              <div className="space-y-4">
                <h3 className="text-xs font-black text-purple-600 uppercase tracking-wider border-b border-purple-100 pb-2 flex items-center gap-1.5"><Hospital size={14} /> Skrining & Riwayat Penyakit</h3>
                
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Riwayat Penyakit Keluarga</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    <CheckboxField label="Diabetes (DM)" checked={formData.riwayat_dm} onChange={(val) => handleInputChange('riwayat_dm', val)} />
                    <CheckboxField label="Hipertensi" checked={formData.riwayat_hipertensi} onChange={(val) => handleInputChange('riwayat_hipertensi', val)} />
                    <CheckboxField label="Penyakit Jantung" checked={formData.riwayat_jantung} onChange={(val) => handleInputChange('riwayat_jantung', val)} />
                    <CheckboxField label="Kanker" checked={formData.riwayat_kanker} onChange={(val) => handleInputChange('riwayat_kanker', val)} />
                    <CheckboxField label="Stroke" checked={formData.riwayat_stroke} onChange={(val) => handleInputChange('riwayat_stroke', val)} />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Faktor Risiko & Gaya Hidup</label>
                  <div className="grid grid-cols-2 sm:grid-cols-2 gap-2">
                    <CheckboxField label="Merokok" checked={formData.merokok} onChange={(val) => handleInputChange('merokok', val)} />
                    <CheckboxField label="Konsumsi Alkohol" checked={formData.konsumsi_alkohol} onChange={(val) => handleInputChange('konsumsi_alkohol', val)} />
                    <CheckboxField label="Kurang Olahraga" checked={formData.kurang_olahraga} onChange={(val) => handleInputChange('kurang_olahraga', val)} />
                    <CheckboxField label="Pola Makan Tidak Sehat" checked={formData.pola_makan_tidak_sehat} onChange={(val) => handleInputChange('pola_makan_tidak_sehat', val)} />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Riwayat Penyakit Pribadi</label>
                  <textarea rows="2" className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-sm font-bold outline-none focus:ring-4 focus:ring-indigo-50 resize-none transition-all placeholder:text-slate-300" value={formData.riwayat_pribadi} onChange={(e) => handleInputChange('riwayat_pribadi', e.target.value)} placeholder="Contoh: Pernah dirawat karena DBD tahun 2023, Asma sejak kecil..." />
                </div>
              </div>

              <div className="flex gap-4 pt-4 border-t border-slate-100">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-6 py-4 rounded-2xl font-bold text-slate-500 hover:bg-slate-100 transition-all active:scale-95 text-xs uppercase tracking-wider">Batal</button>
                <button type="submit" className="flex-1 bg-indigo-600 text-white px-6 py-4 rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 active:scale-95 flex items-center justify-center gap-2 text-xs uppercase tracking-wider">
                  <CheckCircle2 size={16} /> Simpan Data Pasien
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
const InputField = ({ label, type = "text", value, onChange, placeholder, icon, maxLength, step }) => (
  <div className="space-y-2 w-full">
    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{label}</label>
    <div className="relative">
      {icon && <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">{icon}</div>}
      <input 
        type={type} 
        value={value} 
        onChange={(e) => onChange(e.target.value)} 
        placeholder={placeholder} 
        maxLength={maxLength}
        step={step}
        className={`w-full bg-slate-50 border border-slate-100 rounded-2xl ${icon ? 'pl-12' : 'px-5'} py-4 text-sm font-bold outline-none focus:ring-4 focus:ring-indigo-50 transition-all placeholder:text-slate-300`} 
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
      className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-sm font-bold outline-none focus:ring-4 focus:ring-indigo-50 transition-all appearance-none text-slate-700" 
      required
    >
      {placeholder && <option value="" disabled hidden>{placeholder}</option>}
      {placeholder && <option value="">-- {placeholder} --</option>}
      {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
    </select>
  </div>
);

const CheckboxField = ({ label, checked, onChange }) => (
  <label className={`flex items-center p-2.5 rounded-xl border transition-all cursor-pointer ${
    checked ? 'border-indigo-300 bg-indigo-50/50' : 'border-slate-200 bg-white hover:border-slate-300'
  }`}>
    <input 
      type="checkbox" 
      checked={checked} 
      onChange={(e) => onChange(e.target.checked)} 
      className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500" 
    />
    <span className="ml-2 text-xs font-semibold text-slate-700">{label}</span>
  </label>
);

export default DataPasien;
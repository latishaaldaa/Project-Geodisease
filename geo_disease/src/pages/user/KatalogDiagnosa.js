import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Plus, 
  Edit3, 
  Trash2, 
  BookOpen, 
  Stethoscope,
  Info,
  ExternalLink,
  Loader2,
  AlertTriangle,
  ClipboardList,
  History,
  Activity,
  CheckCircle2,
  TrendingUp,
  Users,
  Target,
  Award,
  Calendar,
  UserCheck,
  FileDown,
  Download,
  UserPlus,
  Save,
  Camera,
  MapPin,
  Clock,
  FileText,
  Eye,
  CheckCircle,
  XCircle
} from 'lucide-react';
import axios from 'axios';

const KatalogDiagnosa = ({ dataPenyakit = [], refreshData }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoadingMetadata, setIsLoadingMetadata] = useState(false);
  
  const [dmftData, setDmftData] = useState({});
  const [rekomendasiWilayah, setRekomendasiWilayah] = useState("Memuat analisis kesehatan gigi wilayah...");

  // STATE: Program Intervensi CKG
  const [programIntervensi, setProgramIntervensi] = useState([]);
  const [isLoadingProgram, setIsLoadingProgram] = useState(false);

  // STATE: Aktivitas Tim Kesehatan
  const [aktivitasTim, setAktivitasTim] = useState([]);
  const [isLoadingAktivitas, setIsLoadingAktivitas] = useState(false);

  // DATA PEMETAAN: Daftar kontak koordinator program kesehatan gigi wilayah (Puskesmas)
  // Gunakan format kode negara '62' di depan nomor tanpa menggunakan tanda '+' atau angka '0'
  const daftarKontakPuskesmas = {
    "Puskesmas Madiun Kota": "628112345678",
    "Puskesmas Taman": "628122334455",
    "Puskesmas Kartoharjo": "628133445566",
    "Puskesmas Manguharjo": "628144556677",
    "Puskesmas Oro-Oro Ombo": "628155667788"
  };

  // STATE PERBAIKAN: Mengembalikan deklarasi objek currentPenyakit yang sempat hilang
  const [currentPenyakit, setCurrentPenyakit] = useState({ 
    id: '', 
    nama: '', 
    kategori: '', 
    deskripsi: '', 
    gambarUrl: '',
    linkArtikel: '',
    kode_icd: '',
    tingkat_urgensi: 'Normal',
    tindakan_medis: ''
  });

  // STATE BARU: Mengontrol filter cepat berdasarkan tingkat urgensi penyakit
  const [filterUrgensi, setFilterUrgensi] = useState('Semua'); // Pilihan: 'Semua', 'Wabah', 'Normal'

  // STATE BARU: Form Input Data Pemeriksaan Gigi Real-time
  const [isModalPemeriksaanOpen, setIsModalPemeriksaanOpen] = useState(false);
  const [dataPemeriksaan, setDataPemeriksaan] = useState([]);
  const [isViewDataPemeriksaan, setIsViewDataPemeriksaan] = useState(false);
  const [currentPemeriksaan, setCurrentPemeriksaan] = useState({
    id: '',
    nik: '',
    nama_lengkap: '',
    tanggal_lahir: '',
    jenis_kelamin: 'L',
    alamat: '',
    rt: '',
    rw: '',
    kelurahan: '',
    kecamatan: '',
    tanggal_pemeriksaan: new Date().toISOString().split('T')[0],
    jumlah_gigi_karies: 0,
    jumlah_gigi_hilang: 0,
    jumlah_gigi_ditambal: 0,
    dmft_index: 0,
    diagnosis: '',
    tindakan_medis: '',
    petugas_nama: '',
    puskesmas: 'Puskesmas Kartoharjo',
    lokasi_pemeriksaan: '',
    status_verifikasi: 'draft',
    foto_dokumentasi: ''
  });

  // FUNGSI: Mengambil data program intervensi CKG dari API (dengan fallback data dummy)
  const fetchProgramIntervensi = async () => {
    try {
      setIsLoadingProgram(true);
      const response = await axios.get('http://127.0.0.1:5000/api/program-ckg');
      if (response.data && Array.isArray(response.data)) {
        setProgramIntervensi(response.data);
      }
    } catch (error) {
      console.error("Gagal memuat data program intervensi CKG dari API, menggunakan data dummy standar Indonesia:", error);
      // DATA DUMMY STANDAR CKG INDONESIA (Sesuai Pedoman Kemenkes RI) - DIPERBANYAK!
      setProgramIntervensi([
        {
          id: 1,
          nama_program: 'Program UKGS (Usaha Kesehatan Gigi Sekolah)',
          wilayah_target: 'Kecamatan Kartoharjo',
          status: 'Berjalan',
          tanggal_mulai: '2026-01-15',
          target_dmft: '< 3.0',
          deskripsi: 'Skrining gigi anak SD/MI, sikat gigi massal, dan edukasi kesehatan gigi'
        },
        {
          id: 2,
          nama_program: 'Aplikasi Fluor & Pit Fissure Sealant',
          wilayah_target: 'Kecamatan Taman',
          status: 'Berjalan',
          tanggal_mulai: '2026-02-10',
          target_dmft: '< 2.5',
          deskripsi: 'Pencegahan karies dengan aplikasi fluor dan pit fissure sealant pada anak usia sekolah'
        },
        {
          id: 3,
          nama_program: 'Penyuluhan Kesehatan Gigi Ibu Hamil',
          wilayah_target: 'Kecamatan Manguharjo',
          status: 'Berjalan',
          tanggal_mulai: '2026-03-01',
          target_dmft: '< 4.0',
          deskripsi: 'Edukasi ibu hamil tentang kesehatan gigi dan pencegahan karies pada balita'
        },
        {
          id: 4,
          nama_program: 'Pos Pelayanan Terpadu (Posyandu) Gigi',
          wilayah_target: 'Kecamatan Madiun Kota',
          status: 'Perencanaan',
          tanggal_mulai: '2026-07-15',
          target_dmft: '< 3.5',
          deskripsi: 'Pelayanan kesehatan gigi gratis di posyandu untuk balita dan lansia'
        },
        {
          id: 5,
          nama_program: 'Sikat Gigi Bersama & Pembagian Pasta Gigi',
          wilayah_target: 'Kecamatan Oro-Oro Ombo',
          status: 'Berjalan',
          tanggal_mulai: '2026-01-20',
          target_dmft: '< 2.8',
          deskripsi: 'Program sikat gigi massal di TK/PAUD dengan pembagian sikat dan pasta gigi gratis'
        },
        {
          id: 6,
          nama_program: 'Edukasi Kesehatan Gigi di Sekolah Dasar',
          wilayah_target: 'Kecamatan Kartoharjo',
          status: 'Berjalan',
          tanggal_mulai: '2026-03-10',
          target_dmft: '< 3.2',
          deskripsi: 'Program sosialisasi cara sikat gigi yang benar dan pemeriksaan gigi berkala'
        },
        {
          id: 7,
          nama_program: 'Screening Gigi Gratis untuk Lansia',
          wilayah_target: 'Kecamatan Taman',
          status: 'Berjalan',
          tanggal_mulai: '2026-04-01',
          target_dmft: '< 5.0',
          deskripsi: 'Pemeriksaan kesehatan gigi dan mulut untuk lansia di posyandu lansia'
        },
        {
          id: 8,
          nama_program: 'Kampanye Anti Karies untuk Anak Balita',
          wilayah_target: 'Kecamatan Manguharjo',
          status: 'Berjalan',
          tanggal_mulai: '2026-02-20',
          target_dmft: '< 2.0',
          deskripsi: 'Edukasi orang tua tentang pencegahan karies pada anak balita'
        },
        {
          id: 9,
          nama_program: 'Program Tambal Gigi Gratis',
          wilayah_target: 'Kecamatan Madiun Kota',
          status: 'Berjalan',
          tanggal_mulai: '2026-05-15',
          target_dmft: '< 3.8',
          deskripsi: 'Layanan tambal gigi gratis untuk masyarakat kurang mampu'
        },
        {
          id: 10,
          nama_program: 'Workshop Kesehatan Gigi untuk Guru',
          wilayah_target: 'Kecamatan Oro-Oro Ombo',
          status: 'Perencanaan',
          tanggal_mulai: '2026-08-01',
          target_dmft: '< 2.5',
          deskripsi: 'Pelatihan guru sebagai agen perubahan kesehatan gigi di sekolah'
        }
      ]);
    } finally {
      setIsLoadingProgram(false);
    }
  };

  // FUNGSI BARU: Load Data Pemeriksaan dari LocalStorage
  const loadDataPemeriksaan = () => {
    try {
      const storedData = localStorage.getItem('dataPemeriksaanCKG');
      if (storedData) {
        const parsed = JSON.parse(storedData);
        setDataPemeriksaan(parsed);
        
        // Update DMF-T data berdasarkan data pemeriksaan real
        updateDMFTFromPemeriksaan(parsed);
      }
    } catch (error) {
      console.error("Gagal memuat data pemeriksaan dari localStorage:", error);
    }
  };

  // FUNGSI BARU: Update DMF-T berdasarkan data pemeriksaan real
  const updateDMFTFromPemeriksaan = (dataPemeriksaan) => {
    const dmftByPuskesmas = {};
    
    dataPemeriksaan.forEach(item => {
      if (!dmftByPuskesmas[item.puskesmas]) {
        dmftByPuskesmas[item.puskesmas] = {
          total_karies: 0,
          total_hilang: 0,
          total_tambal: 0,
          total_pasien: 0
        };
      }
      
      dmftByPuskesmas[item.puskesmas].total_karies += parseFloat(item.jumlah_gigi_karies) || 0;
      dmftByPuskesmas[item.puskesmas].total_hilang += parseFloat(item.jumlah_gigi_hilang) || 0;
      dmftByPuskesmas[item.puskesmas].total_tambal += parseFloat(item.jumlah_gigi_ditambal) || 0;
      dmftByPuskesmas[item.puskesmas].total_pasien += 1;
    });

    const dmftCalculated = {};
    Object.entries(dmftByPuskesmas).forEach(([puskesmas, data]) => {
      const avgKaries = data.total_karies / data.total_pasien;
      const avgHilang = data.total_hilang / data.total_pasien;
      const avgTambal = data.total_tambal / data.total_pasien;
      const dmftIndex = avgKaries + avgHilang + avgTambal;
      
      let kategori = 'Normal';
      if (dmftIndex < 1.2) kategori = 'Sangat Rendah';
      else if (dmftIndex < 2.7) kategori = 'Rendah';
      else if (dmftIndex < 4.5) kategori = 'Sedang';
      else if (dmftIndex < 6.6) kategori = 'Tinggi';
      else kategori = 'Sangat Tinggi';

      dmftCalculated[puskesmas] = {
        dmft_index: dmftIndex,
        kategori: kategori,
        jumlah_pasien: data.total_pasien,
        decayed: avgKaries,
        missing: avgHilang,
        filled: avgTambal
      };
    });

    if (Object.keys(dmftCalculated).length > 0) {
      setDmftData(dmftCalculated);
      
      // Update rekomendasi
      let wilayahTerbaik = "";
      let dmftTerendah = 999;
      Object.entries(dmftCalculated).forEach(([wilayah, data]) => {
        if (data.dmft_index < dmftTerendah) {
          dmftTerendah = data.dmft_index;
          wilayahTerbaik = wilayah;
        }
      });
      
      setRekomendasiWilayah(`${wilayahTerbaik} memiliki indeks DMF-T terendah (${dmftTerendah.toFixed(2)}) - Model program terbaik`);
    }
  };

  // FUNGSI BARU: Validasi NIK (Cek Duplikasi)
  const validateNIK = (nik) => {
    if (nik.length !== 16) {
      return { valid: false, message: 'NIK harus 16 digit' };
    }
    
    const isDuplicate = dataPemeriksaan.some(item => 
      item.nik === nik && item.id !== currentPemeriksaan.id
    );
    
    if (isDuplicate) {
      return { valid: false, message: 'NIK sudah terdaftar! Pasien sudah pernah diperiksa.' };
    }
    
    return { valid: true, message: 'NIK valid' };
  };

  // FUNGSI BARU: Hitung DMF-T Otomatis
  const hitungDMFT = (karies, hilang, tambal) => {
    const d = parseFloat(karies) || 0;
    const m = parseFloat(hilang) || 0;
    const f = parseFloat(tambal) || 0;
    return (d + m + f).toFixed(2);
  };

  // FUNGSI BARU: Simpan Data Pemeriksaan
  const handleSavePemeriksaan = (e) => {
    e.preventDefault();
    
    // Validasi NIK
    const nikValidation = validateNIK(currentPemeriksaan.nik);
    if (!nikValidation.valid) {
      alert('❌ ' + nikValidation.message);
      return;
    }

    // Hitung DMF-T
    const dmftIndex = hitungDMFT(
      currentPemeriksaan.jumlah_gigi_karies,
      currentPemeriksaan.jumlah_gigi_hilang,
      currentPemeriksaan.jumlah_gigi_ditambal
    );

    const dataBaru = {
      ...currentPemeriksaan,
      dmft_index: parseFloat(dmftIndex),
      id: currentPemeriksaan.id || Date.now().toString(),
      created_at: currentPemeriksaan.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    let updatedData;
    if (currentPemeriksaan.id && dataPemeriksaan.some(item => item.id === currentPemeriksaan.id)) {
      // Update existing
      updatedData = dataPemeriksaan.map(item => 
        item.id === currentPemeriksaan.id ? dataBaru : item
      );
    } else {
      // Add new
      updatedData = [...dataPemeriksaan, dataBaru];
    }

    // Simpan ke localStorage
    localStorage.setItem('dataPemeriksaanCKG', JSON.stringify(updatedData));
    setDataPemeriksaan(updatedData);
    
    // Update DMF-T
    updateDMFTFromPemeriksaan(updatedData);
    
    // Reset form
    setCurrentPemeriksaan({
      id: '',
      nik: '',
      nama_lengkap: '',
      tanggal_lahir: '',
      jenis_kelamin: 'L',
      alamat: '',
      rt: '',
      rw: '',
      kelurahan: '',
      kecamatan: '',
      tanggal_pemeriksaan: new Date().toISOString().split('T')[0],
      jumlah_gigi_karies: 0,
      jumlah_gigi_hilang: 0,
      jumlah_gigi_ditambal: 0,
      dmft_index: 0,
      diagnosis: '',
      tindakan_medis: '',
      petugas_nama: '',
      puskesmas: 'Puskesmas Kartoharjo',
      lokasi_pemeriksaan: '',
      status_verifikasi: 'draft',
      foto_dokumentasi: ''
    });
    
    setIsModalPemeriksaanOpen(false);
    alert('✅ Data pemeriksaan berhasil disimpan!');
  };

  // FUNGSI BARU: Hapus Data Pemeriksaan
  const handleDeletePemeriksaan = (id) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus data pemeriksaan ini?')) {
      const updatedData = dataPemeriksaan.filter(item => item.id !== id);
      localStorage.setItem('dataPemeriksaanCKG', JSON.stringify(updatedData));
      setDataPemeriksaan(updatedData);
      updateDMFTFromPemeriksaan(updatedData);
      alert('✅ Data pemeriksaan berhasil dihapus!');
    }
  };

  // FUNGSI BARU: Update Status Verifikasi
  const handleUpdateStatus = (id, newStatus) => {
    const updatedData = dataPemeriksaan.map(item => 
      item.id === id ? { ...item, status_verifikasi: newStatus } : item
    );
    localStorage.setItem('dataPemeriksaanCKG', JSON.stringify(updatedData));
    setDataPemeriksaan(updatedData);
    alert(`✅ Status berhasil diubah menjadi: ${newStatus}`);
  };

  // FUNGSI BARU: Export Data Pemeriksaan ke CSV
  const handleExportDataPemeriksaan = () => {
    if (dataPemeriksaan.length === 0) {
      alert('⚠️ Tidak ada data pemeriksaan untuk diekspor!');
      return;
    }

    try {
      let csvContent = "data:text/csv;charset=utf-8,";
      
      csvContent += "LAPORAN DATA PEMERIKSAAN KESEHATAN GIGI (CKG)\n";
      csvContent += `Tanggal Ekspor: ${new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}\n`;
      csvContent += `Total Data: ${dataPemeriksaan.length} Pemeriksaan\n\n`;
      
      csvContent += "NIK,Nama Lengkap,Tanggal Lahir,Jenis Kelamin,Alamat,RT,RW,Kelurahan,Kecamatan,Tanggal Pemeriksaan,";
      csvContent += "Gigi Karies (D),Gigi Hilang (M),Gigi Ditambal (F),Indeks DMF-T,Diagnosis,Tindakan Medis,";
      csvContent += "Petugas,Puskesmas,Lokasi Pemeriksaan,Status Verifikasi\n";
      
      dataPemeriksaan.forEach(item => {
        csvContent += `${item.nik},"${item.nama_lengkap}",${item.tanggal_lahir},${item.jenis_kelamin},"${item.alamat}",`;
        csvContent += `${item.rt},${item.rw},"${item.kelurahan}","${item.kecamatan}",${item.tanggal_pemeriksaan},`;
        csvContent += `${item.jumlah_gigi_karies},${item.jumlah_gigi_hilang},${item.jumlah_gigi_ditambal},${item.dmft_index},`;
        csvContent += `"${item.diagnosis}","${item.tindakan_medis}","${item.petugas_nama}","${item.puskesmas}",`;
        csvContent += `"${item.lokasi_pemeriksaan}",${item.status_verifikasi}\n`;
      });
      
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `Data_Pemeriksaan_CKG_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      alert('✅ Data pemeriksaan berhasil diekspor!');
    } catch (error) {
      console.error("Gagal mengekspor data pemeriksaan:", error);
      alert('❌ Gagal mengekspor data. Silakan coba lagi.');
    }
  };

  // FUNGSI: Mengambil aktivitas tim kesehatan dari API (dengan fallback data dummy)
  const fetchAktivitasTim = async () => {
    try {
      setIsLoadingAktivitas(true);
      const response = await axios.get('http://127.0.0.1:5000/api/aktivitas-tim');
      if (response.data && Array.isArray(response.data)) {
        setAktivitasTim(response.data);
      }
    } catch (error) {
      console.error("Gagal memuat aktivitas tim kesehatan dari API, menggunakan data dummy standar:", error);
      // DATA DUMMY AKTIVITAS TIM KESEHATAN GIGI (Real-time Simulation) - DIPERBANYAK!
      const waktuSekarang = new Date();
      setAktivitasTim([
        {
          id: 1,
          tim: 'Tim CKG Puskesmas Kartoharjo',
          kegiatan: 'Skrining kesehatan gigi anak SD Negeri 1 Kartoharjo',
          waktu: `${waktuSekarang.getHours()}:${String(waktuSekarang.getMinutes()).padStart(2, '0')}`,
          jumlah_pasien: 45,
          lokasi: 'SD Negeri 1 Kartoharjo'
        },
        {
          id: 2,
          tim: 'Tim CKG Puskesmas Taman',
          kegiatan: 'Aplikasi fluor dan edukasi sikat gigi yang benar',
          waktu: `${waktuSekarang.getHours() - 1}:30`,
          jumlah_pasien: 32,
          lokasi: 'TK Aisyiyah Bustanul Athfal'
        },
        {
          id: 3,
          tim: 'Tim CKG Puskesmas Manguharjo',
          kegiatan: 'Penyuluhan kesehatan gigi untuk ibu hamil di Posyandu',
          waktu: `${waktuSekarang.getHours() - 2}:15`,
          jumlah_pasien: 18,
          lokasi: 'Posyandu Melati RW 05'
        },
        {
          id: 4,
          tim: 'Tim CKG Mobile Dinas Kesehatan',
          kegiatan: 'Pemeriksaan gigi gratis warga di lapangan desa',
          waktu: `${waktuSekarang.getHours() - 3}:00`,
          jumlah_pasien: 67,
          lokasi: 'Lapangan Desa Oro-Oro Ombo'
        },
        {
          id: 5,
          tim: 'Tim CKG Puskesmas Kartoharjo',
          kegiatan: 'Workshop cara sikat gigi yang benar untuk siswa kelas 1-3',
          waktu: `${waktuSekarang.getHours() - 1}:00`,
          jumlah_pasien: 52,
          lokasi: 'SD Negeri 2 Kartoharjo'
        },
        {
          id: 6,
          tim: 'Tim CKG Puskesmas Taman',
          kegiatan: 'Pemeriksaan gigi dan pembagian sikat gigi gratis',
          waktu: `${waktuSekarang.getHours() - 2}:45`,
          jumlah_pasien: 38,
          lokasi: 'TK Melati Taman'
        },
        {
          id: 7,
          tim: 'Tim CKG Puskesmas Manguharjo',
          kegiatan: 'Kampanye anti karies dan pemberian pasta gigi fluoride',
          waktu: `${waktuSekarang.getHours() - 4}:20`,
          jumlah_pasien: 41,
          lokasi: 'Posyandu Mawar RW 03'
        },
        {
          id: 8,
          tim: 'Tim CKG Puskesmas Madiun Kota',
          kegiatan: 'Screening kesehatan gigi lansia di Panti Werdha',
          waktu: `${waktuSekarang.getHours() - 3}:30`,
          jumlah_pasien: 24,
          lokasi: 'Panti Werdha Harapan Jaya'
        },
        {
          id: 9,
          tim: 'Tim CKG Puskesmas Oro-Oro Ombo',
          kegiatan: 'Sikat gigi massal dan edukasi kesehatan mulut anak PAUD',
          waktu: `${waktuSekarang.getHours() - 1}:15`,
          jumlah_pasien: 29,
          lokasi: 'PAUD Ceria Oro-Oro Ombo'
        },
        {
          id: 10,
          tim: 'Tim CKG Mobile Dinas Kesehatan',
          kegiatan: 'Pelayanan tambal gigi gratis untuk masyarakat kurang mampu',
          waktu: `${waktuSekarang.getHours() - 4}:00`,
          jumlah_pasien: 15,
          lokasi: 'Balai Desa Pandean'
        }
      ]);
    } finally {
      setIsLoadingAktivitas(false);
    }
  };

  const fetchDMFTData = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:5000/api/dmft');
      
      if (response.data && typeof response.data === 'object') {
        setDmftData(response.data);
        
        let wilayahTerbaikNama = "";
        let dmftTerendah = 999;
        
        Object.entries(response.data).forEach(([namaWilayah, data]) => {
          const rataRataDMFT = data.dmft_index;
          if (rataRataDMFT < dmftTerendah) {
            dmftTerendah = rataRataDMFT;
            wilayahTerbaikNama = namaWilayah;
          }
        });
        
        if (wilayahTerbaikNama) {
          setRekomendasiWilayah(`${wilayahTerbaikNama} memiliki indeks DMF-T terendah (${dmftTerendah.toFixed(2)}) - Model program terbaik`);
        } else {
          setRekomendasiWilayah("Belum ada data DMF-T tersedia dari wilayah manapun");
        }
      }
    } catch (error) {
      console.error("Gagal memuat data DMF-T dari API, menggunakan data dummy standar Indonesia:", error);
      // DATA DUMMY DMF-T STANDAR INDONESIA (Sesuai Kategori WHO & Kemenkes RI) - DIPERBANYAK!
      // Kategori DMF-T: Sangat Rendah (<1.2), Rendah (1.2-2.6), Sedang (2.7-4.4), Tinggi (4.5-6.5), Sangat Tinggi (>6.5)
      const dummyDMFT = {
        "Puskesmas Kartoharjo": {
          dmft_index: 3.2,
          kategori: "Sedang",
          jumlah_pasien: 156,
          decayed: 1.8,
          missing: 0.7,
          filled: 0.7
        },
        "Puskesmas Taman": {
          dmft_index: 2.4,
          kategori: "Rendah",
          jumlah_pasien: 142,
          decayed: 1.3,
          missing: 0.5,
          filled: 0.6
        },
        "Puskesmas Manguharjo": {
          dmft_index: 4.8,
          kategori: "Tinggi",
          jumlah_pasien: 189,
          decayed: 2.5,
          missing: 1.4,
          filled: 0.9
        },
        "Puskesmas Madiun Kota": {
          dmft_index: 3.6,
          kategori: "Sedang",
          jumlah_pasien: 178,
          decayed: 2.1,
          missing: 0.8,
          filled: 0.7
        },
        "Puskesmas Oro-Oro Ombo": {
          dmft_index: 2.8,
          kategori: "Sedang",
          jumlah_pasien: 134,
          decayed: 1.6,
          missing: 0.6,
          filled: 0.6
        },
        "Puskesmas Kanigoro": {
          dmft_index: 2.1,
          kategori: "Rendah",
          jumlah_pasien: 98,
          decayed: 1.1,
          missing: 0.4,
          filled: 0.6
        },
        "Puskesmas Demangan": {
          dmft_index: 3.9,
          kategori: "Sedang",
          jumlah_pasien: 165,
          decayed: 2.3,
          missing: 0.9,
          filled: 0.7
        },
        "Puskesmas Pandean": {
          dmft_index: 5.2,
          kategori: "Tinggi",
          jumlah_pasien: 203,
          decayed: 3.1,
          missing: 1.5,
          filled: 0.6
        }
      };
      
      setDmftData(dummyDMFT);
      
      // Cari wilayah terbaik dari dummy data
      let wilayahTerbaikNama = "";
      let dmftTerendah = 999;
      
      Object.entries(dummyDMFT).forEach(([namaWilayah, data]) => {
        if (data.dmft_index < dmftTerendah) {
          dmftTerendah = data.dmft_index;
          wilayahTerbaikNama = namaWilayah;
        }
      });
      
      setRekomendasiWilayah(`${wilayahTerbaikNama} memiliki indeks DMF-T terendah (${dmftTerendah.toFixed(2)}) - Model program terbaik`);
    }
  };

  // Memuat data DMF-T, Program Intervensi, dan Aktivitas Tim secara berkala
  useEffect(() => {
    fetchDMFTData();
    fetchProgramIntervensi();
    fetchAktivitasTim();
    loadDataPemeriksaan(); // Load data pemeriksaan dari localStorage
    
    const intervalDMFT = setInterval(fetchDMFTData, 10000); // Realtime update tiap 10 detik
    const intervalProgram = setInterval(fetchProgramIntervensi, 15000); // Update tiap 15 detik
    const intervalAktivitas = setInterval(fetchAktivitasTim, 15000); // Update tiap 15 detik
    
    return () => {
      clearInterval(intervalDMFT);
      clearInterval(intervalProgram);
      clearInterval(intervalAktivitas);
    };
  }, []);

  // LOGIKA FILTER DAN PENCARIAN TERPADU: Menyaring berdasarkan tab filter terpilih kemudian mencocokkan kata kunci
  const filteredPenyakit = dataPenyakit.filter(p => {
    // 1. Penyaringan berdasarkan tab filter tingkat urgensi
    if (filterUrgensi === 'Wabah' && p.tingkat_urgensi !== 'Wabah') return false;
    if (filterUrgensi === 'Normal' && p.tingkat_urgensi !== 'Normal') return false;
    
    // 2. Penyaringan berdasarkan kata kunci pencarian (nama atau kode ICD)
    const matchesSearch = p.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (p.kode_icd && p.kode_icd.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesSearch;
  });

  // FUNGSI AKSI: Kontak Cepat Koordinator Program Kesehatan Gigi Puskesmas via WhatsApp
  const handleHubungiPuskesmas = (namaWilayah, dmftIndex, kategori) => {
    const nomorPuskesmas = daftarKontakPuskesmas[namaWilayah];
    if (!nomorPuskesmas) {
      alert(`Nomor kontak koordinator untuk ${namaWilayah} belum dikonfigurasi di dalam daftar kontak.`);
      return;
    }

    const pesanKoordinasi = 
      `Halo Koordinator Program *${namaWilayah}*,\n\n` +
      `Kami dari *Command Center Dinas Kesehatan* memantau bahwa Indeks DMF-T wilayah Anda saat ini berada pada kategori *${kategori}* dengan nilai *${dmftIndex}*.\n\n` +
      `Mohon konfirmasi program intervensi kesehatan gigi dan mulut yang sedang berjalan serta rencana peningkatan edukasi masyarakat. Terima kasih.`;

    const urlKoordinasiPuskesmas = `https://api.whatsapp.com/send?phone=${nomorPuskesmas}&text=${encodeURIComponent(pesanKoordinasi)}`;
    window.open(urlKoordinasiPuskesmas, '_blank');
  };

  // FUNGSI EKSPOR: Export Laporan CKG ke Excel/CSV
  const handleExportLaporanCKG = () => {
    try {
      // Persiapan data untuk ekspor
      let csvContent = "data:text/csv;charset=utf-8,";
      
      // Header CSV
      csvContent += "LAPORAN PROGRAM CAKUPAN KESEHATAN GIGI (CKG) - DINAS KESEHATAN\n";
      csvContent += `Tanggal Ekspor: ${new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}\n\n`;
      
      // Bagian 1: Indeks DMF-T per Wilayah
      csvContent += "=== INDEKS DMF-T PER WILAYAH ===\n";
      csvContent += "Wilayah,Indeks DMF-T,Kategori,Jumlah Pasien,D (Karies),M (Hilang),F (Tambal)\n";
      
      Object.entries(dmftData).forEach(([wilayah, data]) => {
        csvContent += `${wilayah},${data.dmft_index.toFixed(2)},${data.kategori},${data.jumlah_pasien},${data.decayed.toFixed(2)},${data.missing.toFixed(2)},${data.filled.toFixed(2)}\n`;
      });
      
      csvContent += "\n";
      
      // Bagian 2: Program Intervensi CKG
      csvContent += "=== PROGRAM INTERVENSI CKG AKTIF ===\n";
      csvContent += "Nama Program,Wilayah Target,Status,Tanggal Mulai,Target DMF-T\n";
      
      programIntervensi.forEach(program => {
        csvContent += `"${program.nama_program}",${program.wilayah_target},${program.status},${program.tanggal_mulai},${program.target_dmft}\n`;
      });
      
      csvContent += "\n";
      
      // Bagian 3: Aktivitas Tim Kesehatan
      csvContent += "=== AKTIVITAS TIM KESEHATAN GIGI ===\n";
      csvContent += "Tim,Kegiatan,Waktu,Jumlah Pasien Diperiksa\n";
      
      aktivitasTim.forEach(aktivitas => {
        csvContent += `"${aktivitas.tim}","${aktivitas.kegiatan}",${aktivitas.waktu},${aktivitas.jumlah_pasien}\n`;
      });
      
      csvContent += "\n";
      csvContent += "=== REKOMENDASI ===\n";
      csvContent += `${rekomendasiWilayah}\n`;
      
      // Download file
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `Laporan_CKG_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      alert('✅ Laporan CKG berhasil diekspor!');
    } catch (error) {
      console.error("Gagal mengekspor laporan CKG:", error);
      alert('❌ Gagal mengekspor laporan. Silakan coba lagi.');
    }
  };

  const handleUrlBlur = async (url) => {
    if (!url) return; 
    try {
      setIsLoadingMetadata(true);
      const response = await axios.post('http://127.0.0.1:5000/api/fetch-metadata', { url });
      if (response.data) {
        setCurrentPenyakit(prev => ({
          ...prev,
          nama: prev.nama || response.data.title || '',
          deskripsi: response.data.description || response.data.title || prev.deskripsi || '', 
          gambarUrl: response.data.image || prev.gambarUrl || '' 
        }));
      }
    } catch (error) {
      console.error("Gagal memuat metadata artikel:", error);
    } finally {
      setIsLoadingMetadata(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsLoadingMetadata(true);
      if (currentPenyakit.id) {
        await axios.put(`http://127.0.0.1:5000/api/penyakit/${currentPenyakit.id}`, currentPenyakit);
      } else {
        await axios.post('http://127.0.0.1:5000/api/penyakit', currentPenyakit);
      }
      refreshData();
      
      // Refresh DMF-T data setelah CRUD untuk realtime update
      fetchDMFTData();
      
      setIsModalOpen(false);
    } catch (error) {
      console.error("Gagal menyimpan referensi penyakit:", error);
    } finally {
      setIsLoadingMetadata(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus referensi penyakit ini dari katalog?")) {
      try {
        await axios.delete(`http://127.0.0.1:5000/api/penyakit/${id}`);
        refreshData();
        
        // Refresh DMF-T data setelah delete untuk realtime update
        fetchDMFTData();
        
      } catch (error) {
        console.error("Gagal menghapus penyakit:", error);
      }
    }
  };

  return (
    <div className="space-y-6 antialiased p-1">
      
      {/* TOMBOL AKSI UTAMA: Input Data Pemeriksaan & Lihat Data */}
      <div className="flex flex-col lg:flex-row gap-3">
        <button 
          onClick={() => {
            setCurrentPemeriksaan({
              id: '',
              nik: '',
              nama_lengkap: '',
              tanggal_lahir: '',
              jenis_kelamin: 'L',
              alamat: '',
              rt: '',
              rw: '',
              kelurahan: '',
              kecamatan: '',
              tanggal_pemeriksaan: new Date().toISOString().split('T')[0],
              jumlah_gigi_karies: 0,
              jumlah_gigi_hilang: 0,
              jumlah_gigi_ditambal: 0,
              dmft_index: 0,
              diagnosis: '',
              tindakan_medis: '',
              petugas_nama: '',
              puskesmas: 'Puskesmas Kartoharjo',
              lokasi_pemeriksaan: '',
              status_verifikasi: 'draft',
              foto_dokumentasi: ''
            });
            setIsModalPemeriksaanOpen(true);
          }}
          className="flex-1 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white px-6 py-4 rounded-2xl font-bold text-sm hover:from-emerald-700 hover:to-emerald-800 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-3 border border-emerald-500"
        >
          <UserPlus size={20} /> Input Data Pemeriksaan Gigi Real-time
        </button>
        
        <button 
          onClick={() => setIsViewDataPemeriksaan(!isViewDataPemeriksaan)}
          className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-4 rounded-2xl font-bold text-sm hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-3 border border-blue-500"
        >
          <Eye size={20} /> {isViewDataPemeriksaan ? 'Sembunyikan' : 'Lihat'} Data Pemeriksaan ({dataPemeriksaan.length})
        </button>

        <button 
          onClick={handleExportDataPemeriksaan}
          className="bg-gradient-to-r from-purple-600 to-purple-700 text-white px-6 py-4 rounded-2xl font-bold text-sm hover:from-purple-700 hover:to-purple-800 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-3 border border-purple-500"
        >
          <Download size={20} /> Export Data Pemeriksaan
        </button>
      </div>

      {/* TABEL DATA PEMERIKSAAN */}
      {isViewDataPemeriksaan && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-5 pb-4 border-b border-slate-200">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl border border-blue-100">
                <FileText size={20} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-800 tracking-tight">Data Pemeriksaan Kesehatan Gigi</h2>
                <p className="text-xs text-slate-400 font-medium mt-1">Total: {dataPemeriksaan.length} Pemeriksaan</p>
              </div>
            </div>
          </div>

          {dataPemeriksaan.length === 0 ? (
            <div className="text-center py-12 text-slate-400 border border-dashed border-slate-200 rounded-2xl">
              <FileText className="mx-auto text-slate-300 mb-3" size={32} />
              <p className="text-sm font-bold">Belum ada data pemeriksaan</p>
              <p className="text-xs text-slate-400 mt-1">Klik tombol "Input Data Pemeriksaan" untuk menambahkan data baru</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="px-4 py-3 text-left font-bold text-slate-600 uppercase tracking-wider">NIK</th>
                    <th className="px-4 py-3 text-left font-bold text-slate-600 uppercase tracking-wider">Nama Lengkap</th>
                    <th className="px-4 py-3 text-left font-bold text-slate-600 uppercase tracking-wider">Tgl Lahir</th>
                    <th className="px-4 py-3 text-center font-bold text-slate-600 uppercase tracking-wider">L/P</th>
                    <th className="px-4 py-3 text-left font-bold text-slate-600 uppercase tracking-wider">Alamat</th>
                    <th className="px-4 py-3 text-center font-bold text-slate-600 uppercase tracking-wider">D</th>
                    <th className="px-4 py-3 text-center font-bold text-slate-600 uppercase tracking-wider">M</th>
                    <th className="px-4 py-3 text-center font-bold text-slate-600 uppercase tracking-wider">F</th>
                    <th className="px-4 py-3 text-center font-bold text-slate-600 uppercase tracking-wider">DMF-T</th>
                    <th className="px-4 py-3 text-left font-bold text-slate-600 uppercase tracking-wider">Puskesmas</th>
                    <th className="px-4 py-3 text-center font-bold text-slate-600 uppercase tracking-wider">Status</th>
                    <th className="px-4 py-3 text-center font-bold text-slate-600 uppercase tracking-wider">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {dataPemeriksaan.map((item, index) => (
                    <tr key={item.id} className={`border-b border-slate-100 hover:bg-slate-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}`}>
                      <td className="px-4 py-3 font-mono text-slate-700">{item.nik}</td>
                      <td className="px-4 py-3 font-bold text-slate-800">{item.nama_lengkap}</td>
                      <td className="px-4 py-3 text-slate-600">{item.tanggal_lahir}</td>
                      <td className="px-4 py-3 text-center text-slate-600">{item.jenis_kelamin}</td>
                      <td className="px-4 py-3 text-slate-600">{item.kelurahan}, {item.kecamatan}</td>
                      <td className="px-4 py-3 text-center font-bold text-rose-600">{item.jumlah_gigi_karies}</td>
                      <td className="px-4 py-3 text-center font-bold text-amber-600">{item.jumlah_gigi_hilang}</td>
                      <td className="px-4 py-3 text-center font-bold text-emerald-600">{item.jumlah_gigi_ditambal}</td>
                      <td className="px-4 py-3 text-center font-bold text-indigo-600">{item.dmft_index}</td>
                      <td className="px-4 py-3 text-slate-600">{item.puskesmas}</td>
                      <td className="px-4 py-3 text-center">
                        <select 
                          value={item.status_verifikasi}
                          onChange={(e) => handleUpdateStatus(item.id, e.target.value)}
                          className={`text-[10px] font-bold px-2 py-1 rounded-lg border ${
                            item.status_verifikasi === 'approved' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' :
                            item.status_verifikasi === 'verified' ? 'bg-blue-100 text-blue-700 border-blue-200' :
                            item.status_verifikasi === 'pending' ? 'bg-amber-100 text-amber-700 border-amber-200' :
                            'bg-slate-100 text-slate-600 border-slate-200'
                          }`}
                        >
                          <option value="draft">Draft</option>
                          <option value="pending">Pending</option>
                          <option value="verified">Verified</option>
                          <option value="approved">Approved</option>
                        </select>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => {
                              setCurrentPemeriksaan(item);
                              setIsModalPemeriksaanOpen(true);
                            }}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                            title="Edit"
                          >
                            <Edit3 size={14} />
                          </button>
                          <button
                            onClick={() => handleDeletePemeriksaan(item.id)}
                            className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                            title="Hapus"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
      
      {/* 1. LAYER HEAD: DASHBOARD MONITORING CKG */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        
        {/* PANEL KIRI: Program Intervensi CKG Aktif - REFACTORED UI */}
        <div className="bg-gradient-to-br from-slate-50 to-slate-100 p-6 rounded-3xl border border-slate-200 flex flex-col justify-between shadow-sm">
          <div>
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl border border-indigo-100">
                  <Target size={20} />
                </div>
                <div>
                  <h2 className="text-base font-bold tracking-tight text-slate-800">Program Intervensi CKG</h2>
                  <p className="text-[11px] text-slate-500 font-medium mt-0.5">Target Penurunan DMF-T Wilayah</p>
                </div>
              </div>
              <span className="bg-indigo-100 text-indigo-700 border border-indigo-200 text-[10px] px-3 py-1.5 rounded-full font-bold uppercase tracking-wider">
                {programIntervensi.length} Aktif
              </span>
            </div>

            <div className="space-y-4 max-h-[450px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-transparent">
              {isLoadingProgram && programIntervensi.length === 0 ? (
                <div className="flex items-center justify-center py-6 gap-2 text-xs text-slate-500">
                  <Loader2 size={14} className="animate-spin" /> Memuat program...
                </div>
              ) : programIntervensi.length === 0 ? (
                <div className="text-center py-8 text-slate-400 border border-dashed border-slate-200 rounded-xl bg-white">
                  <p className="text-[11px] font-bold uppercase tracking-wider">Belum Ada Program Aktif</p>
                </div>
              ) : (
                programIntervensi.map((program) => (
                  <div key={program.id} className="bg-white border border-slate-200 rounded-xl p-4 hover:border-indigo-300 hover:shadow-sm transition-all">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-bold text-slate-800 leading-tight mb-1">{program.nama_program}</h4>
                        <p className="text-[11px] text-slate-500 mt-1.5 flex items-center gap-1">
                          <MapPin size={11} className="text-slate-400" />
                          <span>{program.wilayah_target}</span>
                        </p>
                      </div>
                      <span className={`text-[9px] font-bold px-2.5 py-1.5 rounded-lg shrink-0 whitespace-nowrap ${
                        program.status === 'Berjalan' 
                          ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' 
                          : 'bg-amber-100 text-amber-700 border border-amber-200'
                      }`}>
                        {program.status}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[10px] pt-3 border-t border-slate-100">
                      <div className="flex items-center gap-1.5 text-slate-500">
                        <Calendar size={11} className="text-slate-400" />
                        <span className="font-medium">{program.tanggal_mulai}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-indigo-600 font-bold">
                        <Award size={11} />
                        <span>Target: {program.target_dmft}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="mt-5 bg-indigo-50 border border-indigo-100 p-4 rounded-xl flex items-center gap-3">
            <Target size={18} className="text-indigo-600 shrink-0" />
            <div className="min-w-0 text-xs">
              <p className="text-indigo-500 font-bold uppercase tracking-wider text-[10px] mb-1">Rekomendasi Best Practice</p>
              <p className="text-slate-700 font-semibold leading-tight">{rekomendasiWilayah}</p>
            </div>
          </div>
        </div>

        {/* PANEL TENGAH: Aktivitas Tim Kesehatan Gigi - REFACTORED TIMELINE */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 flex flex-col justify-between shadow-sm">
          <div>
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100">
                  <UserCheck size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-bold tracking-tight text-slate-800">Aktivitas Tim CKG</h3>
                  <p className="text-[11px] text-slate-500 font-medium mt-0.5">Monitoring Lapangan Real-time</p>
                </div>
              </div>
              <button 
                onClick={fetchAktivitasTim} 
                className="text-[10px] font-bold text-emerald-600 hover:text-emerald-700 transition-colors bg-emerald-50 border border-emerald-100 px-3 py-2 rounded-lg hover:bg-emerald-100"
                title="Refresh aktivitas tim"
              >
                Sync
              </button>
            </div>

            {/* TIMELINE FEED VERTICAL */}
            <div className="space-y-4 max-h-[450px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
              {isLoadingAktivitas && aktivitasTim.length === 0 ? (
                <div className="flex items-center justify-center py-8 gap-2 text-xs text-slate-500">
                  <Loader2 size={14} className="animate-spin" /> Memuat aktivitas...
                </div>
              ) : aktivitasTim.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-[11px] border border-dashed border-slate-200 rounded-xl bg-slate-50">
                  <Clock size={24} className="mx-auto mb-2 text-slate-300" />
                  <p className="font-semibold">Belum ada aktivitas tim hari ini</p>
                </div>
              ) : (
                aktivitasTim.map((aktivitas, index) => (
                  <div key={aktivitas.id} className="relative pl-6">
                    {/* Timeline Line */}
                    {index !== aktivitasTim.length - 1 && (
                      <div className="absolute left-2 top-6 bottom-0 w-0.5 bg-slate-200"></div>
                    )}
                    
                    {/* Timeline Dot */}
                    <div className="absolute left-0 top-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white shadow-sm"></div>
                    
                    {/* Content Card */}
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 hover:border-emerald-200 hover:shadow-sm transition-all">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <h4 className="text-sm font-bold text-slate-800 leading-tight">{aktivitas.tim}</h4>
                        <span className="text-[11px] text-slate-500 font-semibold whitespace-nowrap bg-white px-2 py-1 rounded-md border border-slate-200">
                          {aktivitas.waktu}
                        </span>
                      </div>
                      
                      <p className="text-xs text-slate-600 leading-relaxed mb-3">{aktivitas.kegiatan}</p>
                      
                      <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                          <MapPin size={11} className="text-slate-400" />
                          <span className="font-medium">{aktivitas.lokasi}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-emerald-600 text-[11px] font-bold">
                          <Users size={11} />
                          <span>{aktivitas.jumlah_pasien} pasien</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="mt-5 bg-emerald-50 border border-emerald-100 p-3 rounded-xl flex items-center justify-between text-[11px]">
            <span className="font-bold text-slate-700">Status Tim Lapangan</span>
            <div className="flex items-center gap-1.5 text-emerald-600 font-bold">
              <CheckCircle2 size={12} />
              <span>Aktif</span>
            </div>
          </div>
        </div>

        {/* PANEL KANAN: Indeks DMF-T - REFACTORED CLEAN UI */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 flex flex-col justify-between shadow-sm">
          <div>
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl border border-blue-100">
                  <Activity size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-800">Indeks DMF-T</h3>
                  <p className="text-[11px] text-slate-500 font-medium mt-0.5">Monitoring Kesehatan Gigi</p>
                </div>
              </div>
            </div>

            <div className="space-y-4 max-h-[450px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
              {Object.keys(dmftData).length === 0 ? (
                <div className="flex items-center justify-center py-8 gap-2 text-xs font-medium text-slate-400">
                  <Loader2 size={14} className="animate-spin" /> Menghubungkan ke server...
                </div>
              ) : (
                Object.entries(dmftData).map(([namaWilayah, data]) => {
                  const dmftIndex = data.dmft_index || 0;
                  const kategori = data.kategori || 'Normal';
                  const jumlahPasien = data.jumlah_pasien || 0;
                  const isKritis = kategori === 'Tinggi';
                  const decayed = data.decayed || 0;
                  const missing = data.missing || 0;
                  const filled = data.filled || 0;

                  return (
                    <div key={namaWilayah} className="bg-slate-50 p-4 rounded-2xl border border-slate-200 hover:border-blue-200 transition-all">
                      
                      {/* HEADER: Nama Puskesmas + Badge Status (Pindah ke Atas!) */}
                      <div className="flex items-start justify-between gap-3 mb-4">
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-bold text-slate-800 leading-tight mb-1" title={namaWilayah}>
                            {namaWilayah}
                          </h4>
                          <div className="flex items-center gap-2 text-xs">
                            <Users size={11} className="text-slate-400" />
                            <span className="text-slate-500 font-medium">{jumlahPasien} Pasien</span>
                          </div>
                        </div>
                        
                        {/* BADGE STATUS - POSISI ATAS KANAN */}
                        <div className="flex flex-col items-end gap-2">
                          <span className={`text-[10px] font-bold uppercase px-3 py-1.5 rounded-lg whitespace-nowrap ${
                            isKritis 
                              ? 'bg-rose-100 text-rose-700 border border-rose-200' 
                              : kategori === 'Sedang'
                              ? 'bg-amber-100 text-amber-700 border border-amber-200'
                              : 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                          }`}>
                            {kategori}
                          </span>
                          
                          {/* DMF-T TOTAL - Tebal & Merah jika TINGGI */}
                          <div className="text-right">
                            <p className="text-[10px] text-slate-500 font-medium mb-0.5">DMF-T Index</p>
                            <p className={`text-2xl font-bold ${
                              isKritis ? 'text-rose-600' : 'text-blue-600'
                            }`}>
                              {dmftIndex.toFixed(1)}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* BREAKDOWN D-M-F: Background Abu-abu Netral + Angka Berwarna */}
                      <div className="grid grid-cols-3 gap-2 mb-3">
                        <div className="bg-slate-100 border border-slate-200 rounded-lg p-3 text-center">
                          <p className="text-2xl font-bold text-rose-600">{decayed.toFixed(1)}</p>
                          <p className="text-rose-500 font-semibold text-[10px] mt-1 uppercase tracking-wide">D (Karies)</p>
                        </div>
                        <div className="bg-slate-100 border border-slate-200 rounded-lg p-3 text-center">
                          <p className="text-2xl font-bold text-amber-600">{missing.toFixed(1)}</p>
                          <p className="text-amber-500 font-semibold text-[10px] mt-1 uppercase tracking-wide">M (Hilang)</p>
                        </div>
                        <div className="bg-slate-100 border border-slate-200 rounded-lg p-3 text-center">
                          <p className="text-2xl font-bold text-emerald-600">{filled.toFixed(1)}</p>
                          <p className="text-emerald-500 font-semibold text-[10px] mt-1 uppercase tracking-wide">F (Tambal)</p>
                        </div>
                      </div>

                      {/* TOMBOL KONTAK KOORDINATOR */}
                      <button
                        onClick={() => handleHubungiPuskesmas(namaWilayah, dmftIndex.toFixed(1), kategori)}
                        className={`w-full py-2.5 rounded-lg transition-all flex items-center justify-center gap-2 font-bold text-xs ${
                          isKritis
                            ? 'bg-rose-500 text-white hover:bg-rose-600 border border-rose-600 shadow-md animate-pulse'
                            : 'bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200'
                        }`}
                        title={`Hubungi Koordinator ${namaWilayah}`}
                      >
                        <TrendingUp size={14} />
                        <span>{isKritis ? 'KOORDINASI DARURAT' : 'Hubungi Koordinator'}</span>
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="mt-5 flex items-center justify-between bg-blue-50 px-4 py-3 rounded-xl border border-blue-100 text-[11px] font-bold">
            <span className="text-slate-700">Data Surveilans CKG</span>
            <div className="flex items-center gap-2 text-emerald-600">
              <CheckCircle2 size={12} /> Aktif
            </div>
          </div>
        </div>

      </div>

      {/* 2. CORE CATALOG: DATA DAN GRID REFERENSI UTAMA */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 space-y-6 shadow-sm">
        
        <div className="space-y-5">
          {/* HEADER SECTION */}
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 pb-5 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl border border-indigo-100">
                <BookOpen size={20} />
              </div>
              <div>
                <h1 className="text-lg font-bold text-slate-800 tracking-tight">Katalog Penyakit Terpadu</h1>
                <p className="text-xs text-slate-400 font-medium mt-1">Standardisasi Data Klinis & Intervensi Medis</p>
              </div>
            </div>

            {/* TOMBOL EKSPOR LAPORAN CKG - Posisi Terpisah */}
            <button 
              onClick={handleExportLaporanCKG}
              className="bg-emerald-600 text-white text-xs font-bold px-6 py-3 rounded-xl hover:bg-emerald-700 transition-all active:scale-95 flex items-center justify-center gap-2 border border-emerald-500 shadow-md hover:shadow-lg"
              title="Ekspor Laporan CKG ke CSV"
            >
              <FileDown size={16} /> Ekspor Laporan CKG
            </button>
          </div>

          {/* FILTER & SEARCH SECTION */}
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-4">
            
            {/* TOMBOL FILTER CEPAT (TABS FILTER): Status Urgensi Penyakit */}
            <div className="bg-slate-100 p-1.5 rounded-xl flex items-center gap-1.5">
              {['Semua', 'Wabah', 'Normal'].map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setFilterUrgensi(tab)}
                  className={`px-4 py-2.5 text-xs font-bold rounded-lg transition-all uppercase tracking-wider ${
                    filterUrgensi === tab
                      ? 'bg-white text-indigo-600 shadow-sm'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {tab === 'Semua' ? 'Semua Penyakit' : `Status ${tab}`}
                </button>
              ))}
            </div>

            {/* BAR PENCARIAN */}
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input 
                type="text" 
                placeholder="Cari penyakit atau kode ICD..." 
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-12 pr-4 py-3 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-100 placeholder:text-slate-400/80 transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <button 
              onClick={() => {
                setCurrentPenyakit({ id: '', nama: '', kategori: '', deskripsi: '', gambarUrl: '', linkArtikel: '', kode_icd: '', tingkat_urgensi: 'Normal', tindakan_medis: '' });
                setIsModalOpen(true);
              }} 
              className="bg-indigo-600 text-white text-xs font-bold px-6 py-3 rounded-xl hover:bg-indigo-700 transition-all active:scale-95 flex items-center justify-center gap-2 lg:w-auto shadow-md hover:shadow-lg"
            >
              <Plus size={16} /> Tambah Diagnosa
            </button>
          </div>
        </div>

        {filteredPenyakit.length === 0 ? (
          <div className="text-center py-12 text-slate-400 border border-dashed border-slate-200 rounded-2xl">
            <AlertTriangle className="mx-auto text-amber-400 mb-3" size={26} />
            <p className="text-xs font-bold uppercase tracking-wider">Data Penyakit Tidak Ditemukan</p>
            <p className="text-[11px] text-slate-400 font-medium mt-1">
              Tidak ada data yang cocok dengan kriteria filter & pencarian Anda saat ini.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPenyakit.map((penyakit) => (
              <div key={penyakit.id} className="group bg-white border border-slate-200 rounded-2xl hover:border-slate-300 transition-all duration-300 flex flex-col justify-between overflow-hidden">
                
                {/* AREA GAMBAR */}
                <div className="relative w-full h-44 bg-slate-50 overflow-hidden shrink-0 border-b border-slate-100">
                  {penyakit.gambarUrl ? (
                    <img 
                      src={penyakit.gambarUrl} 
                      alt={penyakit.nama} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-slate-300 gap-2">
                      <BookOpen size={32} className="stroke-[1.5]" />
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400/70">Tidak Ada Ilustrasi</span>
                    </div>
                  )}

                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
                    <span className="text-[10px] font-mono font-bold text-indigo-600 bg-white/95 backdrop-blur-sm px-2.5 py-1 rounded-lg border border-slate-100">
                      {penyakit.kode_icd || 'No ICD'}
                    </span>
                    <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded-lg backdrop-blur-sm ${
                      penyakit.tingkat_urgensi === 'Wabah' || penyakit.tingkat_urgensi === 'Tinggi' 
                        ? 'bg-rose-500/95 text-white border border-rose-600' 
                        : penyakit.tingkat_urgensi === 'Sedang'
                        ? 'bg-amber-500/95 text-white border border-amber-600'
                        : 'bg-white/95 text-slate-500 border border-slate-200'
                    }`}>
                      {penyakit.tingkat_urgensi}
                    </span>
                  </div>
                </div>

                {/* KONTEN INFORMASI */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                  <div className="space-y-2">
                    <h3 className="text-sm font-bold text-slate-800 tracking-tight group-hover:text-indigo-600 transition-colors line-clamp-1">
                      {penyakit.nama}
                    </h3>
                    <p className="text-xs text-slate-400 font-medium line-clamp-3 leading-relaxed">
                      {penyakit.deskripsi || "Belum ada keterangan deskripsi komprehensif dari integrator kesehatan daerah."}
                    </p>
                  </div>

                  {/* Panel SOP */}
                  <div className="bg-slate-50/60 rounded-xl p-2.5 border border-slate-100 space-y-2 text-[11px]">
                    <div className="flex items-start gap-2 text-slate-600">
                      <Stethoscope size={12} className="text-indigo-500 mt-0.5 shrink-0" />
                      <p className="font-bold leading-tight line-clamp-2">
                        <span className="text-slate-400 font-medium">SOP:</span> {penyakit.tindakan_medis || 'Isolasi & faskes rujukan standar'}
                      </p>
                    </div>
                    {penyakit.last_updated_by && (
                      <div className="flex items-center gap-2 text-slate-400 text-[10px] font-medium pt-1 border-t border-slate-100">
                        <History size={10} />
                        <span className="truncate">Oleh: {penyakit.last_updated_by}</span>
                      </div>
                    )}
                  </div>

                  {/* AKSI CRUD */}
                  <div className="flex items-center justify-between pt-2.5 border-t border-slate-100">
                    {penyakit.linkArtikel ? (
                      <a 
                        href={penyakit.linkArtikel} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-indigo-600 hover:text-indigo-700 font-bold text-[11px] flex items-center gap-1 group/link"
                      >
                        Artikel Referensi <ExternalLink size={10} className="group-hover/link:translate-x-0.5 transition-transform" />
                      </a>
                    ) : (
                      <span className="text-[10px] text-slate-300 font-bold italic">No Link External</span>
                    )}

                    <div className="flex items-center gap-1.5">
                      <button 
                        onClick={() => { setCurrentPenyakit(penyakit); setIsModalOpen(true); }}
                        className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                        title="Edit Diagnosa"
                      >
                        <Edit3 size={13} />
                      </button>
                      <button 
                        onClick={() => handleDelete(penyakit.id)}
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                        title="Hapus Referensi"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>

      {/* 3. MODAL COMPONENT */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white w-full max-w-2xl rounded-3xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            
            <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex justify-between items-center">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                  <ClipboardList size={16} />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-800 uppercase tracking-tight">
                    {currentPenyakit.id ? 'Perbarui Referensi Diagnosa' : 'Registrasi Penyakit Baru'}
                  </h2>
                  <p className="text-[10px] text-slate-400 font-medium">Lengkapi parameter klinis penanganan darurat</p>
                </div>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 font-bold text-sm">✕</button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1">
                    Link Artikel Rujukan <Info size={10} className="text-slate-300" />
                  </label>
                  <input 
                    type="url" 
                    placeholder="https://sumber-artikel-kesehatan.com/kondisi-wabah" 
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-100 placeholder:text-slate-300 transition-all"
                    value={currentPenyakit.linkArtikel}
                    onChange={(e) => setCurrentPenyakit({...currentPenyakit, linkArtikel: e.target.value})}
                    onBlur={(e) => handleUrlBlur(e.target.value)}
                  />
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">
                    URL Gambar Artikel (Sampul)
                  </label>
                  <input 
                    type="url" 
                    placeholder="https://sumber-gambar.com/foto-penyakit.jpg" 
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-100 placeholder:text-slate-300 transition-all"
                    value={currentPenyakit.gambarUrl}
                    onChange={(e) => setCurrentPenyakit({...currentPenyakit, gambarUrl: e.target.value})}
                  />
                </div>
              </div>

              <p className="text-[10px] text-indigo-400 font-semibold italic ml-1">
                *Ketik/Paste URL rujukan lalu klik di luar kolom untuk memicu pengisian gambar & deskripsi otomatis.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Nama Diagnosa Penyakit</label>
                  <input 
                    type="text" required placeholder="Contoh: Demam Berdarah Dengue" 
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-100 placeholder:text-slate-300 transition-all"
                    value={currentPenyakit.nama}
                    onChange={(e) => setCurrentPenyakit({...currentPenyakit, nama: e.target.value})}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Kategori Penularan</label>
                  <select 
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-100 text-slate-700 transition-all"
                    value={currentPenyakit.kategori}
                    onChange={(e) => setCurrentPenyakit({...currentPenyakit, kategori: e.target.value})}
                  >
                    <option value="Endemis">Endemis / Tropis</option>
                    <option value="Menular">Infeksi / Menular Langsung</option>
                    <option value="Zoonosis">Zoonosis (Hewan)</option>
                    <option value="Kronis">Penyakit Tidak Menular (Kronis)</option>
                    <option value="Lainnya">Lain-Lain</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Kode Klasifikasi Medis (ICD-10/11)</label>
                  <input 
                    type="text" placeholder="Contoh: A91 / J11" 
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-100 placeholder:text-slate-300 transition-all"
                    value={currentPenyakit.kode_icd}
                    onChange={(e) => setCurrentPenyakit({...currentPenyakit, kode_icd: e.target.value})}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Tingkat Skala Urgensi (Triage)</label>
                  <select 
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-100 text-slate-700 transition-all"
                    value={currentPenyakit.tingkat_urgensi}
                    onChange={(e) => setCurrentPenyakit({...currentPenyakit, tingkat_urgensi: e.target.value})}
                  >
                    <option value="Normal">Normal (Faskes Tingkat I)</option>
                    <option value="Sedang">Sedang (Butuh Pemantauan)</option>
                    <option value="Tinggi">Tinggi / Gawat Darurat</option>
                    <option value="Wabah">Wabah / KLB (EWS Trigger Active)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Protokol Tata Laksana Medis (SOP)</label>
                <input 
                  type="text" placeholder="Contoh: Pemberian cairan intravena kuat dan isolasi faskes sekunder" 
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-100 placeholder:text-slate-300 transition-all"
                  value={currentPenyakit.tindakan_medis}
                  onChange={(e) => setCurrentPenyakit({...currentPenyakit, tindakan_medis: e.target.value})}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Deskripsi Klinis Komprehensif (Otomatis Terisi)</label>
                <textarea 
                  rows="3" 
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-100 resize-none placeholder:text-slate-300 transition-all"
                  value={currentPenyakit.deskripsi} 
                  onChange={(e) => setCurrentPenyakit({...currentPenyakit, deskripsi: e.target.value})} 
                  placeholder="Tuliskan keterangan simtoma klinis dan klasifikasi tingkat bahayanya secara mendalam..." 
                />
              </div>

              <div className="flex gap-3 pt-4 border-t border-slate-200">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)} 
                  className="flex-1 px-5 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-100 transition-all active:scale-95 text-xs uppercase tracking-wider"
                >
                  Batal
                </button>
                <button 
                  type="submit" 
                  disabled={isLoadingMetadata} 
                  className="flex-1 bg-indigo-600 text-white px-5 py-3 rounded-xl font-bold hover:bg-indigo-700 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 text-xs uppercase tracking-wider"
                >
                  {isLoadingMetadata ? (
                    <>
                      <Loader2 size={14} className="animate-spin" /> Sinkronisasi...
                    </>
                  ) : 'Simpan Diagnosa'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* 4. MODAL INPUT DATA PEMERIKSAAN GIGI */}
      {isModalPemeriksaanOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in overflow-y-auto">
          <div className="bg-white w-full max-w-4xl rounded-3xl border border-slate-200 overflow-hidden flex flex-col max-h-[95vh] my-4">
            
            <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 px-6 py-4 border-b border-emerald-500 flex justify-between items-center">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-white/20 text-white rounded-xl">
                  <UserPlus size={18} />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-white uppercase tracking-tight">
                    {currentPemeriksaan.id ? 'Edit Data Pemeriksaan' : 'Form Input Data Pemeriksaan Gigi CKG'}
                  </h2>
                  <p className="text-[10px] text-emerald-100 font-medium">Data Murni Sesuai Standar Kemenkes RI</p>
                </div>
              </div>
              <button onClick={() => setIsModalPemeriksaanOpen(false)} className="text-white hover:text-emerald-100 font-bold text-lg">✕</button>
            </div>

            <form onSubmit={handleSavePemeriksaan} className="p-6 overflow-y-auto space-y-5 flex-1">
              
              {/* SECTION 1: Data Identitas Pasien */}
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200">
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <Users size={14} className="text-indigo-600" /> Data Identitas Pasien
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">NIK (16 Digit) *</label>
                    <input 
                      type="text" 
                      required 
                      maxLength="16"
                      placeholder="Contoh: 3579012345678901" 
                      className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold outline-none focus:ring-2 focus:ring-emerald-200 placeholder:text-slate-300 transition-all"
                      value={currentPemeriksaan.nik}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '');
                        setCurrentPemeriksaan({...currentPemeriksaan, nik: value});
                      }}
                      onBlur={(e) => {
                        const validation = validateNIK(e.target.value);
                        if (!validation.valid && e.target.value.length === 16) {
                          alert('⚠️ ' + validation.message);
                        }
                      }}
                    />
                  </div>
                  
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Nama Lengkap *</label>
                    <input 
                      type="text" 
                      required 
                      placeholder="Nama lengkap sesuai KTP" 
                      className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold outline-none focus:ring-2 focus:ring-emerald-200 placeholder:text-slate-300 transition-all"
                      value={currentPemeriksaan.nama_lengkap}
                      onChange={(e) => setCurrentPemeriksaan({...currentPemeriksaan, nama_lengkap: e.target.value})}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Tanggal Lahir *</label>
                    <input 
                      type="date" 
                      required 
                      className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold outline-none focus:ring-2 focus:ring-emerald-200 transition-all"
                      value={currentPemeriksaan.tanggal_lahir}
                      onChange={(e) => setCurrentPemeriksaan({...currentPemeriksaan, tanggal_lahir: e.target.value})}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Jenis Kelamin *</label>
                    <select 
                      required
                      className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold outline-none focus:ring-2 focus:ring-emerald-200 transition-all"
                      value={currentPemeriksaan.jenis_kelamin}
                      onChange={(e) => setCurrentPemeriksaan({...currentPemeriksaan, jenis_kelamin: e.target.value})}
                    >
                      <option value="L">Laki-laki</option>
                      <option value="P">Perempuan</option>
                    </select>
                  </div>

                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Alamat Lengkap *</label>
                    <input 
                      type="text" 
                      required 
                      placeholder="Jalan, Nomor Rumah" 
                      className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold outline-none focus:ring-2 focus:ring-emerald-200 placeholder:text-slate-300 transition-all"
                      value={currentPemeriksaan.alamat}
                      onChange={(e) => setCurrentPemeriksaan({...currentPemeriksaan, alamat: e.target.value})}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">RT *</label>
                    <input 
                      type="text" 
                      required 
                      placeholder="001" 
                      className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold outline-none focus:ring-2 focus:ring-emerald-200 placeholder:text-slate-300 transition-all"
                      value={currentPemeriksaan.rt}
                      onChange={(e) => setCurrentPemeriksaan({...currentPemeriksaan, rt: e.target.value})}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">RW *</label>
                    <input 
                      type="text" 
                      required 
                      placeholder="005" 
                      className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold outline-none focus:ring-2 focus:ring-emerald-200 placeholder:text-slate-300 transition-all"
                      value={currentPemeriksaan.rw}
                      onChange={(e) => setCurrentPemeriksaan({...currentPemeriksaan, rw: e.target.value})}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Kelurahan/Desa *</label>
                    <input 
                      type="text" 
                      required 
                      placeholder="Nama Kelurahan" 
                      className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold outline-none focus:ring-2 focus:ring-emerald-200 placeholder:text-slate-300 transition-all"
                      value={currentPemeriksaan.kelurahan}
                      onChange={(e) => setCurrentPemeriksaan({...currentPemeriksaan, kelurahan: e.target.value})}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Kecamatan *</label>
                    <input 
                      type="text" 
                      required 
                      placeholder="Nama Kecamatan" 
                      className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold outline-none focus:ring-2 focus:ring-emerald-200 placeholder:text-slate-300 transition-all"
                      value={currentPemeriksaan.kecamatan}
                      onChange={(e) => setCurrentPemeriksaan({...currentPemeriksaan, kecamatan: e.target.value})}
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 2: Data Pemeriksaan Gigi (DMF-T) */}
              <div className="bg-blue-50 p-5 rounded-2xl border border-blue-200">
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <Stethoscope size={14} className="text-blue-600" /> Data Pemeriksaan Kesehatan Gigi (DMF-T Index)
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Tanggal Pemeriksaan *</label>
                    <input 
                      type="date" 
                      required 
                      className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold outline-none focus:ring-2 focus:ring-blue-200 transition-all"
                      value={currentPemeriksaan.tanggal_pemeriksaan}
                      onChange={(e) => setCurrentPemeriksaan({...currentPemeriksaan, tanggal_pemeriksaan: e.target.value})}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Puskesmas Pemeriksa *</label>
                    <select 
                      required
                      className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold outline-none focus:ring-2 focus:ring-blue-200 transition-all"
                      value={currentPemeriksaan.puskesmas}
                      onChange={(e) => setCurrentPemeriksaan({...currentPemeriksaan, puskesmas: e.target.value})}
                    >
                      <option value="Puskesmas Kartoharjo">Puskesmas Kartoharjo</option>
                      <option value="Puskesmas Taman">Puskesmas Taman</option>
                      <option value="Puskesmas Manguharjo">Puskesmas Manguharjo</option>
                      <option value="Puskesmas Madiun Kota">Puskesmas Madiun Kota</option>
                      <option value="Puskesmas Oro-Oro Ombo">Puskesmas Oro-Oro Ombo</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-rose-600 uppercase tracking-widest ml-1 flex items-center gap-1">
                      D - Decayed (Gigi Karies) *
                    </label>
                    <input 
                      type="number" 
                      required 
                      min="0"
                      max="32"
                      placeholder="Jumlah gigi berlubang" 
                      className="w-full bg-white border border-rose-200 rounded-xl px-4 py-2.5 text-sm font-bold outline-none focus:ring-2 focus:ring-rose-200 placeholder:text-slate-300 transition-all"
                      value={currentPemeriksaan.jumlah_gigi_karies}
                      onChange={(e) => setCurrentPemeriksaan({...currentPemeriksaan, jumlah_gigi_karies: e.target.value})}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-amber-600 uppercase tracking-widest ml-1 flex items-center gap-1">
                      M - Missing (Gigi Hilang) *
                    </label>
                    <input 
                      type="number" 
                      required 
                      min="0"
                      max="32"
                      placeholder="Jumlah gigi hilang/cabut" 
                      className="w-full bg-white border border-amber-200 rounded-xl px-4 py-2.5 text-sm font-bold outline-none focus:ring-2 focus:ring-amber-200 placeholder:text-slate-300 transition-all"
                      value={currentPemeriksaan.jumlah_gigi_hilang}
                      onChange={(e) => setCurrentPemeriksaan({...currentPemeriksaan, jumlah_gigi_hilang: e.target.value})}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest ml-1 flex items-center gap-1">
                      F - Filled (Gigi Ditambal) *
                    </label>
                    <input 
                      type="number" 
                      required 
                      min="0"
                      max="32"
                      placeholder="Jumlah gigi sudah ditambal" 
                      className="w-full bg-white border border-emerald-200 rounded-xl px-4 py-2.5 text-sm font-bold outline-none focus:ring-2 focus:ring-emerald-200 placeholder:text-slate-300 transition-all"
                      value={currentPemeriksaan.jumlah_gigi_ditambal}
                      onChange={(e) => setCurrentPemeriksaan({...currentPemeriksaan, jumlah_gigi_ditambal: e.target.value})}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest ml-1">DMF-T Index (Otomatis)</label>
                    <div className="w-full bg-indigo-50 border-2 border-indigo-200 rounded-xl px-4 py-2.5 text-lg font-bold text-indigo-700 text-center">
                      {hitungDMFT(currentPemeriksaan.jumlah_gigi_karies, currentPemeriksaan.jumlah_gigi_hilang, currentPemeriksaan.jumlah_gigi_ditambal)}
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION 3: Diagnosis & Tindakan */}
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200">
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <ClipboardList size={14} className="text-slate-600" /> Diagnosis & Tindakan Medis
                </h3>
                
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Diagnosis</label>
                    <textarea 
                      rows="2" 
                      placeholder="Diagnosis kondisi kesehatan gigi pasien" 
                      className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold outline-none focus:ring-2 focus:ring-emerald-200 resize-none placeholder:text-slate-300 transition-all"
                      value={currentPemeriksaan.diagnosis}
                      onChange={(e) => setCurrentPemeriksaan({...currentPemeriksaan, diagnosis: e.target.value})}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Tindakan Medis</label>
                    <textarea 
                      rows="2" 
                      placeholder="Tindakan medis yang diberikan (edukasi, scaling, tambal, rujukan, dll)" 
                      className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold outline-none focus:ring-2 focus:ring-emerald-200 resize-none placeholder:text-slate-300 transition-all"
                      value={currentPemeriksaan.tindakan_medis}
                      onChange={(e) => setCurrentPemeriksaan({...currentPemeriksaan, tindakan_medis: e.target.value})}
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 4: Petugas & Lokasi */}
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200">
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <MapPin size={14} className="text-slate-600" /> Data Petugas & Lokasi
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Nama Petugas Pemeriksa *</label>
                    <input 
                      type="text" 
                      required 
                      placeholder="Nama lengkap petugas kesehatan" 
                      className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold outline-none focus:ring-2 focus:ring-emerald-200 placeholder:text-slate-300 transition-all"
                      value={currentPemeriksaan.petugas_nama}
                      onChange={(e) => setCurrentPemeriksaan({...currentPemeriksaan, petugas_nama: e.target.value})}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Lokasi Pemeriksaan *</label>
                    <input 
                      type="text" 
                      required 
                      placeholder="Posyandu/Sekolah/Puskesmas" 
                      className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold outline-none focus:ring-2 focus:ring-emerald-200 placeholder:text-slate-300 transition-all"
                      value={currentPemeriksaan.lokasi_pemeriksaan}
                      onChange={(e) => setCurrentPemeriksaan({...currentPemeriksaan, lokasi_pemeriksaan: e.target.value})}
                    />
                  </div>
                </div>
              </div>

              {/* TOMBOL AKSI */}
              <div className="flex gap-3 pt-4 border-t border-slate-200">
                <button 
                  type="button" 
                  onClick={() => setIsModalPemeriksaanOpen(false)} 
                  className="flex-1 px-5 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-100 transition-all active:scale-95 text-xs uppercase tracking-wider border border-slate-200"
                >
                  Batal
                </button>
                <button 
                  type="submit" 
                  className="flex-1 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white px-5 py-3 rounded-xl font-bold hover:from-emerald-700 hover:to-emerald-800 transition-all active:scale-95 flex items-center justify-center gap-2 text-xs uppercase tracking-wider shadow-lg"
                >
                  <Save size={16} /> Simpan Data Pemeriksaan
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default KatalogDiagnosa;
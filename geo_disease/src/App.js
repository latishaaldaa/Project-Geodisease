import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { GoogleOAuthProvider } from '@react-oauth/google';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// IMPORT SESUAI ISI FOLDER VSCODE ANDA
import DashboardAdmin from './pages/admin/DashboardAdmin';
import DashboardUser from './pages/user/Dashboard';
import DataPasien from './pages/user/DataPasien'; 
import Peta from './pages/user/Peta';
import PetaAdmin from './pages/admin/PetaAdmin'; 
import StatistikUser from './pages/user/Statistik';
import StatistikAdmin from './pages/admin/StatistikAdmin'; 
import KatalogDiagnosa from './pages/user/KatalogDiagnosa'; 
import RekamMedis from './pages/admin/RekamMedis'; 
import AuditLog from './pages/admin/AuditLog';
// PERBAIKAN SINKRONISASI: Menggunakan nama folder Tim_Kesehatan dan nama file CKGratis
import CKGgratis from './pages/tim kesehatan/CKGratis';

function App() {
  // --- STATE OTENTIKASI & NAVIGASI ---
  const [isLoggedIn, setIsLoggedIn] = useState(false); 
  const [showRegister, setShowRegister] = useState(false);
  const [userRole, setUserRole] = useState(null); 
  const [userName, setUserName] = useState(''); 
  const [activeTab, setActiveTab] = useState('dashboard');

  // --- STATE DATA GLOBAL (SINKRONISASI) ---
  const [dataPasien, setDataPasien] = useState([]);
  const [dataPenyakit, setDataPenyakit] = useState([]); 
  const [logs, setLogs] = useState([]); 
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(false);

  // Definisi daftar kecamatan tetap (LENGKAP 15 KECAMATAN)
  const daftarKecamatan = [
    "Balerejo", "Dagangan", "Dolopo", "Geger", "Gemarang", 
    "Jiwan", "Kare", "Kebonsari", "Madiun", "Mejayan", 
    "Pilangkenceng", "Saradan", "Sawahan", "Wonoasri", "Wungu"
  ];

  // --- FUNGSI FETCH DATA (PUSAT SINKRONISASI) ---
  const fetchPasien = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://127.0.0.1:5000/api/pasien');
      setDataPasien(response.data);
    } catch (error) {
      console.error("Gagal mengambil data pasien:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchPenyakit = useCallback(async () => {
    try {
      const response = await axios.get('http://127.0.0.1:5000/api/penyakit');
      setDataPenyakit(response.data);
    } catch (error) {
      console.error("Gagal mengambil data penyakit:", error);
    }
  }, []);

  const fetchLogs = useCallback(async () => {
    try {
      const response = await axios.get('http://127.0.0.1:5000/api/logs');
      setLogs(response.data);
    } catch (error) {
      console.error("Gagal mengambil logs:", error);
    }
  }, []);

  const fetchAuditLogs = useCallback(async () => {
    try {
      const response = await axios.get('http://127.0.0.1:5000/api/audit-logs');
      setAuditLogs(response.data);
    } catch (error) {
      console.error("Gagal mengambil audit logs:", error);
      // Set dummy data jika backend belum siap
      setAuditLogs([
        {
          timestamp: new Date().toISOString(),
          user: 'Admin User',
          role: 'Admin',
          aksi: 'LOGIN',
          aktivitas: 'Login ke sistem',
          status: 'Success',
          ipAddress: '192.168.1.100',
          lokasi: 'Madiun',
          deskripsi: 'User berhasil login ke sistem monitoring'
        },
        {
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          user: 'Admin User',
          role: 'Admin',
          aksi: 'CREATE',
          aktivitas: 'Menambahkan rekam medis pasien',
          status: 'Success',
          ipAddress: '192.168.1.100',
          lokasi: 'Madiun',
          deskripsi: 'Rekam medis pasien baru berhasil ditambahkan'
        },
        {
          timestamp: new Date(Date.now() - 7200000).toISOString(),
          user: 'Dr. Ahmad',
          role: 'Admin',
          aksi: 'UPDATE',
          aktivitas: 'Memperbarui status pasien',
          status: 'Success',
          ipAddress: '192.168.1.105',
          lokasi: 'Madiun',
          deskripsi: 'Status pasien diubah dari Rawat Inap ke Sembuh'
        },
        {
          timestamp: new Date(Date.now() - 10800000).toISOString(),
          user: 'Admin User',
          role: 'Admin',
          aksi: 'VIEW',
          aktivitas: 'Melihat dashboard monitoring',
          status: 'Success',
          ipAddress: '192.168.1.100',
          lokasi: 'Madiun',
          deskripsi: 'User mengakses halaman dashboard'
        },
        {
          timestamp: new Date(Date.now() - 14400000).toISOString(),
          user: 'Admin User',
          role: 'Admin',
          aksi: 'EXPORT',
          aktivitas: 'Export data statistik',
          status: 'Success',
          ipAddress: '192.168.1.100',
          lokasi: 'Madiun',
          deskripsi: 'Data statistik berhasil diekspor ke CSV'
        }
      ]);
    }
  }, []);

  // --- FUNGSI UNTUK MENAMBAH LOG AKTIVITAS BARU ---
  const addLog = useCallback(async (tipe, deskripsi, waktu) => {
    try {
      await axios.post('http://127.0.0.1:5000/api/logs', {
        aktivitas: `${tipe} - ${deskripsi}`,
        waktu: waktu || new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
      });
      
      fetchLogs();
    } catch (error) {
      console.error("Gagal mengirim log aktivitas ke server:", error);
    }
  }, [fetchLogs]);

  // Fetch semua data saat login berhasil atau saat komponen dimount
  useEffect(() => {
    if (isLoggedIn) {
      fetchPasien();
      fetchPenyakit();
      fetchLogs();
      fetchAuditLogs();
    }
  }, [isLoggedIn, fetchPasien, fetchPenyakit, fetchLogs, fetchAuditLogs]);

  // --- HANDLER LOGIN ---
  const handleLogin = (role, name) => {
    if (role) {
      setUserRole(role.toLowerCase()); 
      setUserName(name || ''); 
      setIsLoggedIn(true);
      setActiveTab('dashboard');
    } else {
      console.error("Role tidak ditemukan dalam data login");
      alert("Terjadi kesalahan data pengguna.");
    }
  };

  // --- KONTROL RENDER HALAMAN ---
  const renderContent = () => {
    const commonProps = {
      dataPasien,
      dataPenyakit,
      daftarKecamatan,
      refreshData: fetchPasien,
      refreshPenyakit: fetchPenyakit,
      loading,
      userName, 
      addLog 
    };

    if (userRole === 'admin') {
      // Role: Admin (Sistem Monitoring Rumah Sakit)
      switch (activeTab) {
        case 'dashboard': 
          return <DashboardAdmin {...commonProps} logs={logs} setActiveTab={setActiveTab} />;
        
        case 'rekam-medis': 
          return <RekamMedis {...commonProps} />;
        
        case 'peta':      
          return <PetaAdmin {...commonProps} />; 
 
        case 'statistik': 
          return <StatistikAdmin {...commonProps} />;

        case 'audit-log':
          return <AuditLog auditLogs={auditLogs} />;

        default:           
          return <DashboardAdmin {...commonProps} logs={logs} setActiveTab={setActiveTab} />;
      }
    } else if (userRole === 'tim kesehatan') {
      // Role Baru: Tim Kesehatan (CKG Gratis Lapangan)
      switch (activeTab) {
        case 'dashboard':
          return <CKGgratis {...commonProps} />; // Tampilan awal langsung mengarah ke halaman CKGratis
        
        case 'ckg-gratis':
          return <CKGgratis {...commonProps} />;
          
        case 'peta':
          return <Peta dataPasien={dataPasien} refreshData={fetchPasien} daftarKecamatan={daftarKecamatan} />;

        default:
          return <CKGgratis {...commonProps} />;
      }
    } else {
      // Role: User (Dinas Kesehatan)
      switch (activeTab) {
        case 'dashboard': 
          return <DashboardUser {...commonProps} logs={logs} setActiveTab={setActiveTab} />; 
        
        case 'penderita': 
          return <DataPasien {...commonProps} role="user" />;
        
        case 'peta':      
          return <Peta dataPasien={dataPasien} refreshData={fetchPasien} daftarKecamatan={daftarKecamatan} />;

        case 'statistik': 
          return <StatistikUser {...commonProps} />;
        
        case 'katalog': 
          return <KatalogDiagnosa dataPenyakit={dataPenyakit} refreshData={fetchPenyakit} />;
        
        default:          
          return <DashboardUser {...commonProps} logs={logs} setActiveTab={setActiveTab} />;
      }
    }
  };

  if (!isLoggedIn) {
    const googleClientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;
    
    // Jika Client ID belum dikonfigurasi, tampilkan peringatan
    if (!googleClientId || googleClientId === 'YOUR_GOOGLE_CLIENT_ID_HERE') {
      console.warn('Google Client ID belum dikonfigurasi. Silakan ikuti panduan di GOOGLE_OAUTH_SETUP.md');
    }
    
    return (
      <GoogleOAuthProvider clientId={googleClientId || ''}>
        {showRegister ? 
          <Register onBackToLogin={() => setShowRegister(false)} /> : 
          <Login onLoginSuccess={handleLogin} onShowRegister={() => setShowRegister(true)} />}
      </GoogleOAuthProvider>
    );
  }

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <Sidebar 
        userRole={userRole} 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        onLogout={() => {
          setIsLoggedIn(false);
          setUserRole(null);
          setUserName('');
        }} 
      />
      
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header activeTab={activeTab} userRole={userRole} userName={userName} />
        <main className="flex-1 overflow-y-auto bg-[#F8FAFC]">
          <div className="p-4 md:p-8 max-w-[1600px] mx-auto">
            {/* Loading Bar Indikator Sinkronisasi */}
            {loading && (
              <div className="fixed top-0 left-0 w-full h-1 bg-indigo-100 z-[9999]">
                <div className="h-full bg-indigo-600 animate-pulse" style={{width: '60%'}}></div>
              </div>
            )}
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;
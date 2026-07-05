import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Bell, ChevronDown, Wifi, WifiOff, Activity } from 'lucide-react';
import API_BASE_URL from '../../config/api';

const Header = ({ userRole, activeTab }) => {
  const [isOnline, setIsOnline] = useState(true);

  // --- LOGIKA CEK KONEKSI SERVER (REAL-TIME) ---
  useEffect(() => {
    const checkConnection = async () => {
      try {
        // Memanggil API ringan untuk cek apakah backend aktif
        await axios.get(`${API_BASE_URL}/api/pasien`);
        setIsOnline(true);
      } catch (error) {
        setIsOnline(false);
      }
    };

    const interval = setInterval(checkConnection, 10000); // Cek setiap 10 detik
    checkConnection(); 

    return () => clearInterval(interval);
  }, []);

  // Mapping judul halaman profesional
  const getPageTitle = (tab) => {
    const titles = {
      dashboard: 'Pusat Komando Klinis',
      penderita: 'Manajemen Rekam Medis Pasien',
      peta: 'Surveilans Geografis Penyakit',
      statistik: 'Analitik Statistik Epidemiologi',
      penyakit: 'Database Manajemen Penyakit'
    };
    return titles[tab] || 'Sistem Informasi Rumah Sakit';
  };

  return (
    <header className="h-20 bg-white border-b border-slate-100 flex items-center justify-between px-8 sticky top-0 z-20 shadow-sm">
      {/* SISI KIRI: Judul & Indikator Koneksi */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-3 border-r border-slate-100 pr-6">
          <Activity size={20} className="text-indigo-600" />
          <h2 className="text-sm font-black text-slate-800 uppercase tracking-wider">
            {getPageTitle(activeTab)}
          </h2>
        </div>
        
        {/* INDIKATOR STATUS SERVER AKTIF */}
        {isOnline ? (
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-full border border-emerald-100">
            <Wifi size={14} className="animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-tighter">Server Terhubung</span>
          </div>
        ) : (
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-rose-50 text-rose-600 rounded-full border border-rose-100 shadow-sm">
            <WifiOff size={14} />
            <span className="text-[10px] font-black uppercase tracking-tighter">Server Terputus</span>
          </div>
        )}
      </div>

      {/* SISI KANAN: Notifikasi & Profil */}
      <div className="flex items-center gap-6">
        <button className="relative p-2.5 text-slate-400 hover:bg-slate-50 rounded-xl transition-all group">
          <Bell size={20} className="group-hover:rotate-12 transition-transform" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
        </button>

        <div className="h-8 w-[1px] bg-slate-100 mx-2"></div>

        <button className="flex items-center gap-3 p-1 pr-3 hover:bg-slate-50 rounded-2xl transition-all group border border-transparent hover:border-slate-100">
          <div className="h-10 w-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-black shadow-lg shadow-indigo-100">
            {userRole === 'admin' ? 'AD' : 'ST'}
          </div>
          <div className="text-left hidden sm:block">
            <p className="text-xs font-black text-slate-800 leading-none mb-1">
              {userRole === 'admin' ? 'Administrator Utama' : 'Staf Medis'}
            </p>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
              {userRole === 'admin' ? 'Sistem Manajemen' : 'Petugas Unit'}
            </p>
          </div>
          <ChevronDown size={16} className="text-slate-400 group-hover:translate-y-0.5 transition-transform" />
        </button>
      </div>
    </header>
  );
};

// --- BARIS INI YANG MEMPERBAIKI ERROR ANDA ---
export default Header;
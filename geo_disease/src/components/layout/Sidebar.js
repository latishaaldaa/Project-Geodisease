import React from 'react';
import { 
  LayoutDashboard, 
  Map, 
  ClipboardList, 
  BarChart3, 
  LogOut,
  Stethoscope,
  Activity,
  MapPinned,
  UserRoundSearch,
  HeartPulse, // Dipakai sebagai ikon untuk CKG Mandiri
  Shield // Ikon untuk Audit Log
} from 'lucide-react';

const Sidebar = ({ userRole, activeTab, setActiveTab, onLogout }) => {
  
  // 1. Link Navigasi untuk Admin (Sistem Monitoring Rumah Sakit)
  const adminLinks = [
    { id: 'dashboard', name: 'Pusat Komando', icon: <LayoutDashboard size={20} /> },
    { id: 'rekam-medis', name: 'Input Rekam Medis', icon: <ClipboardList size={20} /> }, 
    { id: 'peta', name: 'Monitoring Peta', icon: <MapPinned size={20} /> },
    { id: 'statistik', name: 'Analitik Klinis', icon: <BarChart3 size={20} /> },
    { id: 'audit-log', name: 'Audit Log', icon: <Shield size={20} /> },
  ];

  // 2. Link Navigasi untuk User (Dinas Kesehatan) - Seperti di image_222305.png
  const userLinks = [
    { id: 'dashboard', name: 'Dashboard Monitoring', icon: <LayoutDashboard size={20} /> },
    { id: 'penderita', name: 'Data Pasien', icon: <UserRoundSearch size={20} /> }, 
    { id: 'peta', name: 'Surveilans Geografis', icon: <Map size={20} /> },
    { id: 'katalog', name: 'Katalog Diagnosa', icon: <Stethoscope size={20} /> }, 
    { id: 'statistik', name: 'Laporan Epidemiologi', icon: <Activity size={20} /> },
  ];

  // 3. Link Navigasi Khusus untuk TIM KESEHATAN (Hanya Menampilkan CKG Mandiri)
  const timKesehatanLinks = [
    { id: 'skrining-gratis', name: 'CKG Mandiri', icon: <HeartPulse size={20} /> },
  ];

  // Fungsi seleksi menu berdasarkan kecocokan string nama role
  const getLinksByRole = () => {
    const roleNormalized = userRole?.toLowerCase()?.trim();
    
    if (roleNormalized === 'admin') {
      return adminLinks;
    } else if (roleNormalized === 'tim kesehatan' || roleNormalized === 'tim_kesehatan') {
      return timKesehatanLinks; // Mengembalikan hanya menu CKG Mandiri
    } else {
      return userLinks;
    }
  };

  const links = getLinksByRole();

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col h-full shadow-2xl z-50">
      {/* LOGO SECTION */}
      <div className="p-8 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-600/20">
            <Activity className="text-white" size={24} />
          </div>
          <div>
            <h1 className="text-white font-black tracking-tighter text-xl leading-none">GEO<span className="text-indigo-500">DISEASE</span></h1>
            <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-1">Kabupaten Madiun</p>
          </div>
        </div>
      </div>

      {/* NAVIGATION LINKS */}
      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto custom-scrollbar">
        <p className="px-4 mb-4 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Menu Utama</p>
        
        {links.map((link) => (
          <button
            key={link.id}
            onClick={() => setActiveTab(link.id)}
            className={`w-full flex items-center px-4 py-3 text-sm font-bold rounded-2xl transition-all duration-300 group ${
              activeTab === link.id 
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' 
              : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <span className={`mr-3 transition-transform duration-300 ${activeTab === link.id ? 'scale-110' : 'group-hover:scale-110'}`}>
              {link.icon}
            </span>
            {link.name}
          </button>
        ))}
      </nav>

      {/* FOOTER SIDEBAR */}
      <div className="p-4 border-t border-slate-800">
        <button 
          onClick={onLogout}
          className="w-full flex items-center px-4 py-3 text-sm font-bold text-rose-400 hover:bg-rose-500/10 rounded-2xl transition-all group"
        >
          <LogOut size={20} className="mr-3 group-hover:translate-x-1 transition-transform" />
          Keluar Sistem
        </button>
        
        <div className="mt-4 p-4 bg-slate-800/50 rounded-2xl border border-slate-700/50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-slate-700 border border-slate-600 flex items-center justify-center text-[10px] font-black text-white uppercase">
              {userRole?.charAt(0) || 'U'}
            </div>
            <div className="overflow-hidden">
              <p className="text-[10px] font-black text-white truncate uppercase">{userRole || "User"}</p>
              <p className="text-[9px] font-bold text-slate-500 truncate">Sistem Aktif</p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
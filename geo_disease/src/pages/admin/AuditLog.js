import React, { useState, useMemo } from 'react';
import { 
  Shield, Search, Filter, Download, Calendar, 
  User, Activity, AlertTriangle, CheckCircle, 
  XCircle, Info, Clock, MapPin, FileText
} from 'lucide-react';

const AuditLog = ({ auditLogs = [] }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAksi, setFilterAksi] = useState('Semua');
  const [filterStatus, setFilterStatus] = useState('Semua');
  const [selectedDateRange, setSelectedDateRange] = useState('Semua');

  // Kategori aksi untuk filtering
  const aksiCategories = ['Semua', 'CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 'VIEW', 'EXPORT', 'APPROVE', 'REJECT'];

  // Filter dan search audit logs
  const filteredLogs = useMemo(() => {
    let filtered = auditLogs;

    // Filter by search term (user, aktivitas, atau deskripsi)
    if (searchTerm) {
      filtered = filtered.filter(log => 
        log.user?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.aktivitas?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.deskripsi?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.ipAddress?.includes(searchTerm)
      );
    }

    // Filter by aksi
    if (filterAksi !== 'Semua') {
      filtered = filtered.filter(log => log.aksi === filterAksi);
    }

    // Filter by status
    if (filterStatus !== 'Semua') {
      filtered = filtered.filter(log => log.status === filterStatus);
    }

    // Filter by date range
    if (selectedDateRange !== 'Semua') {
      const now = new Date();
      const filterDate = new Date();
      
      switch(selectedDateRange) {
        case 'Hari Ini':
          filterDate.setHours(0, 0, 0, 0);
          break;
        case '7 Hari':
          filterDate.setDate(now.getDate() - 7);
          break;
        case '30 Hari':
          filterDate.setDate(now.getDate() - 30);
          break;
        default:
          break;
      }

      if (selectedDateRange !== 'Semua') {
        filtered = filtered.filter(log => {
          const logDate = new Date(log.timestamp);
          return logDate >= filterDate;
        });
      }
    }

    return filtered;
  }, [auditLogs, searchTerm, filterAksi, filterStatus, selectedDateRange]);

  // Statistik audit log
  const stats = useMemo(() => {
    const total = filteredLogs.length;
    const success = filteredLogs.filter(log => log.status === 'Success').length;
    const failed = filteredLogs.filter(log => log.status === 'Failed').length;
    const warning = filteredLogs.filter(log => log.status === 'Warning').length;

    return { total, success, failed, warning };
  }, [filteredLogs]);

  // Get icon based on action type
  const getActionIcon = (aksi) => {
    switch(aksi) {
      case 'CREATE': return <FileText size={14} className="text-emerald-500" />;
      case 'UPDATE': return <Activity size={14} className="text-blue-500" />;
      case 'DELETE': return <XCircle size={14} className="text-rose-500" />;
      case 'LOGIN': return <User size={14} className="text-indigo-500" />;
      case 'LOGOUT': return <User size={14} className="text-slate-500" />;
      case 'VIEW': return <Info size={14} className="text-cyan-500" />;
      case 'EXPORT': return <Download size={14} className="text-purple-500" />;
      case 'APPROVE': return <CheckCircle size={14} className="text-emerald-500" />;
      case 'REJECT': return <XCircle size={14} className="text-rose-500" />;
      default: return <Activity size={14} className="text-slate-500" />;
    }
  };

  // Get status badge styling
  const getStatusBadge = (status) => {
    switch(status) {
      case 'Success':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Failed':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'Warning':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Info':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  // Export audit logs to CSV
  const handleExportCSV = () => {
    const csvHeader = 'Timestamp,User,Role,Aksi,Aktivitas,Status,IP Address,Lokasi,Deskripsi\n';
    const csvData = filteredLogs.map(log => 
      `"${log.timestamp}","${log.user}","${log.role}","${log.aksi}","${log.aktivitas}","${log.status}","${log.ipAddress}","${log.lokasi}","${log.deskripsi}"`
    ).join('\n');
    
    const blob = new Blob([csvHeader + csvData], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `audit_log_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-8 space-y-6 animate-in fade-in duration-700">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 bg-indigo-600 rounded-xl shadow-lg shadow-indigo-600/30">
              <Shield size={24} className="text-white" />
            </div>
            <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight uppercase">
              Audit <span className="text-indigo-600">Log</span>
            </h1>
          </div>
          <p className="text-slate-500 font-semibold text-sm ml-14">
            Catatan kronologis sistem monitoring aktivitas pengguna
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-lg shadow-emerald-600/30"
          >
            <Download size={16} />
            Export CSV
          </button>
        </div>
      </div>

      {/* STATISTICS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard 
          title="Total Aktivitas" 
          value={stats.total} 
          icon={Activity} 
          color="indigo"
          subtitle="Semua log tercatat"
        />
        <StatCard 
          title="Berhasil" 
          value={stats.success} 
          icon={CheckCircle} 
          color="emerald"
          subtitle="Status sukses"
        />
        <StatCard 
          title="Gagal" 
          value={stats.failed} 
          icon={XCircle} 
          color="rose"
          subtitle="Terjadi error"
        />
        <StatCard 
          title="Peringatan" 
          value={stats.warning} 
          icon={AlertTriangle} 
          color="amber"
          subtitle="Perlu perhatian"
        />
      </div>

      {/* FILTER & SEARCH SECTION */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          
          {/* Search Bar */}
          <div className="md:col-span-2">
            <div className="relative">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Cari user, aktivitas, atau IP address..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-medium"
              />
            </div>
          </div>

          {/* Filter Aksi */}
          <div className="relative">
            <Filter size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <select
              value={filterAksi}
              onChange={(e) => setFilterAksi(e.target.value)}
              className="w-full pl-11 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-bold appearance-none bg-white cursor-pointer"
            >
              {aksiCategories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Filter Status */}
          <div className="relative">
            <Calendar size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <select
              value={selectedDateRange}
              onChange={(e) => setSelectedDateRange(e.target.value)}
              className="w-full pl-11 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-bold appearance-none bg-white cursor-pointer"
            >
              <option value="Semua">Semua Waktu</option>
              <option value="Hari Ini">Hari Ini</option>
              <option value="7 Hari">7 Hari Terakhir</option>
              <option value="30 Hari">30 Hari Terakhir</option>
            </select>
          </div>

        </div>

        {/* Active Filters Display */}
        {(searchTerm || filterAksi !== 'Semua' || filterStatus !== 'Semua' || selectedDateRange !== 'Semua') && (
          <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-100">
            <span className="text-xs font-bold text-slate-500">Filter Aktif:</span>
            {searchTerm && (
              <span className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-lg text-xs font-bold">
                Search: {searchTerm}
              </span>
            )}
            {filterAksi !== 'Semua' && (
              <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-lg text-xs font-bold">
                Aksi: {filterAksi}
              </span>
            )}
            {filterStatus !== 'Semua' && (
              <span className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-bold">
                Status: {filterStatus}
              </span>
            )}
            {selectedDateRange !== 'Semua' && (
              <span className="px-3 py-1 bg-purple-50 text-purple-700 rounded-lg text-xs font-bold">
                Periode: {selectedDateRange}
              </span>
            )}
            <button
              onClick={() => {
                setSearchTerm('');
                setFilterAksi('Semua');
                setFilterStatus('Semua');
                setSelectedDateRange('Semua');
              }}
              className="ml-auto text-xs font-bold text-rose-600 hover:text-rose-700"
            >
              Reset Filter
            </button>
          </div>
        )}
      </div>

      {/* AUDIT LOG TABLE */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-4 text-left text-xs font-black text-slate-600 uppercase tracking-wider">
                  Timestamp
                </th>
                <th className="px-6 py-4 text-left text-xs font-black text-slate-600 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-4 text-left text-xs font-black text-slate-600 uppercase tracking-wider">
                  Aksi
                </th>
                <th className="px-6 py-4 text-left text-xs font-black text-slate-600 uppercase tracking-wider">
                  Aktivitas
                </th>
                <th className="px-6 py-4 text-left text-xs font-black text-slate-600 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-black text-slate-600 uppercase tracking-wider">
                  Lokasi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLogs.length > 0 ? (
                filteredLogs.map((log, index) => (
                  <tr key={index} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Clock size={14} className="text-slate-400" />
                        <div>
                          <div className="text-xs font-bold text-slate-700">
                            {new Date(log.timestamp).toLocaleDateString('id-ID')}
                          </div>
                          <div className="text-[10px] text-slate-500">
                            {new Date(log.timestamp).toLocaleTimeString('id-ID')}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
                          <span className="text-xs font-black text-indigo-600">
                            {log.user?.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-700">{log.user}</div>
                          <div className="text-[10px] text-slate-500">{log.role}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {getActionIcon(log.aksi)}
                        <span className="text-xs font-bold text-slate-700">{log.aksi}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="max-w-xs">
                        <div className="text-xs font-bold text-slate-700 truncate">
                          {log.aktivitas}
                        </div>
                        {log.deskripsi && (
                          <div className="text-[10px] text-slate-500 truncate mt-0.5">
                            {log.deskripsi}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-3 py-1 rounded-lg text-[10px] font-black uppercase border ${getStatusBadge(log.status)}`}>
                        {log.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <MapPin size={12} className="text-slate-400" />
                        <div>
                          <div className="text-xs font-bold text-slate-700">{log.ipAddress}</div>
                          <div className="text-[10px] text-slate-500">{log.lokasi}</div>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="p-4 bg-slate-100 rounded-full">
                        <FileText size={32} className="text-slate-400" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-600">Tidak ada data audit log</p>
                        <p className="text-xs text-slate-400 mt-1">
                          {searchTerm || filterAksi !== 'Semua' || filterStatus !== 'Semua' 
                            ? 'Coba ubah filter pencarian Anda' 
                            : 'Log aktivitas akan muncul di sini'}
                        </p>
                      </div>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION INFO */}
        {filteredLogs.length > 0 && (
          <div className="px-6 py-4 bg-slate-50 border-t border-slate-200">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold text-slate-600">
                Menampilkan {filteredLogs.length} dari {auditLogs.length} total aktivitas
              </p>
              <p className="text-xs text-slate-500">
                Terakhir diperbarui: {new Date().toLocaleString('id-ID')}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* INFO PANEL */}
      <div className="bg-gradient-to-r from-indigo-50 to-blue-50 p-6 rounded-3xl border border-indigo-100">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-indigo-600 rounded-xl">
            <Info size={20} className="text-white" />
          </div>
          <div>
            <h3 className="text-sm font-black text-slate-800 mb-2">Tentang Audit Log</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Audit log merupakan catatan kronologis yang tidak dapat diubah dan merekam setiap aktivitas pengguna dalam sistem. 
              Sebagai admin, Anda dapat memonitor seluruh aktivitas untuk memastikan kepatuhan sistem dan mendeteksi aktivitas yang tidak sesuai. 
              Semua data log bersifat read-only dan tersimpan secara permanen untuk keperluan audit dan investigasi.
            </p>
          </div>
        </div>
      </div>

    </div>
  );
};

// Reusable Stat Card Component
const StatCard = ({ title, value, icon: Icon, color, subtitle }) => {
  const colors = {
    indigo: "text-indigo-600 bg-indigo-50 border-indigo-100",
    emerald: "text-emerald-600 bg-emerald-50 border-emerald-100",
    rose: "text-rose-600 bg-rose-50 border-rose-100",
    amber: "text-amber-600 bg-amber-50 border-amber-100"
  };

  return (
    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all">
      <div className="flex items-center justify-between mb-3">
        <div className={`p-3 rounded-xl ${colors[color]} border`}>
          <Icon size={20} />
        </div>
      </div>
      <div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
          {title}
        </p>
        <h4 className="text-2xl font-black text-slate-800 tracking-tight">{value}</h4>
        {subtitle && (
          <p className="text-[10px] text-slate-500 font-bold mt-1">{subtitle}</p>
        )}
      </div>
    </div>
  );
};

export default AuditLog;

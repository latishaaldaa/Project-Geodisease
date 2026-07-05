import React, { useState, useMemo, useEffect } from 'react';
import axios from 'axios';
import API_BASE_URL from '../../config/api';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar
} from 'recharts';
import { 
  Users, 
  Activity, 
  ShieldCheck, 
  Clock, 
  Database,
  FileBarChart,
  AlertCircle,
  Calendar,
  Bed,
  HeartPulse,
  BellRing,
  MapPin,
  Droplets,
  Scale,
  Target,
  UserCheck,
  Award,
  Hospital,
  TrendingDown
} from 'lucide-react';
import { exportToExcel } from '../../utils/excelHelper';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable'; 

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
const STATUS_COLORS = {
  'Sembuh': '#10b981',
  'Meninggal': '#ef4444',
  'Perawatan': '#6366f1',
  'Rujukan': '#ef4444',
  'Isolasi Mandiri': '#0ea5e9'
};

const DashboardAdmin = ({ dataPasien = [], logs = [], daftarKecamatan = [], setActiveTab }) => {
  // --- STATE ---
  const [showPreview, setShowPreview] = useState(false);
  const [timeDimension, setTimeDimension] = useState('Bulanan'); 
  const [liveBOR, setLiveBOR] = useState({});
  const [rekomendasiRS, setRekomendasiRS] = useState("Memuat rekomendasi rujukan faskes...");
  const [ewsLogs, setEwsLogs] = useState([]);
  const [dmftData, setDmftData] = useState({});
  const [programIntervensi, setProgramIntervensi] = useState([]);
  const [aktivitasTim, setAktivitasTim] = useState([]);

  // --- FETCH DATA OPERASIONAL ---
  useEffect(() => {
    const fetchOperationalData = async () => {
      try {
        const borRes = await axios.get(`${API_BASE_URL}/api/bor`);
        if (borRes.data && borRes.data.success) {
          setLiveBOR(borRes.data.data);
          setRekomendasiRS(borRes.data.rekomendasi);
        }
        
        const ewsRes = await axios.get(`${API_BASE_URL}/api/ews-logs`);
        if (ewsRes.data && ewsRes.data.success) {
          setEwsLogs(ewsRes.data.logs.slice(0, 5)); 
        }

        // Fetch DMF-T Data
        const dmftRes = await axios.get(`${API_BASE_URL}/api/dmft`);
        if (dmftRes.data && typeof dmftRes.data === 'object') {
          setDmftData(dmftRes.data);
        }

        // Fetch Program Intervensi CKG
        const programRes = await axios.get(`${API_BASE_URL}/api/program-ckg`);
        if (programRes.data && Array.isArray(programRes.data)) {
          setProgramIntervensi(programRes.data.slice(0, 3));
        }

        // Fetch Aktivitas Tim
        const aktivitasRes = await axios.get(`${API_BASE_URL}/api/aktivitas-tim`);
        if (aktivitasRes.data && Array.isArray(aktivitasRes.data)) {
          setAktivitasTim(aktivitasRes.data.slice(0, 3));
        }
      } catch (error) {
        console.error("Gagal memuat data operasional dashboard:", error);
      }
    };

    fetchOperationalData();
    const interval = setInterval(fetchOperationalData, 30000); 
    return () => clearInterval(interval);
  }, []);

  // --- LOGIKA ANALITIK ---
  const totalPasien = dataPasien.length;
  const kasusAktif = dataPasien.filter(p => p.status !== 'Sembuh' && p.status !== 'Meninggal').length;
  const sembuh = dataPasien.filter(p => p.status === 'Sembuh').length;
  const meninggal = dataPasien.filter(p => p.status === 'Meninggal').length;

  // KPI CKG (dari Statistik.js)
  const parseTD = (td) => {
    if (!td || typeof td !== 'string') return { sistole: 0, diastole: 0 };
    const parts = td.split('/');
    return {
      sistole: parseInt(parts[0]) || 0,
      diastole: parseInt(parts[1]) || 0
    };
  };

  const kpiCKG = useMemo(() => {
    const hipertensi = dataPasien.filter(p => {
      const td = parseTD(p.tekanan_darah);
      return td.sistole >= 140 || td.diastole >= 90;
    }).length;

    const suspekDM = dataPasien.filter(p => {
      const gds = parseInt(p.gula_darah) || 0;
      return gds >= 200;
    }).length;

    const obesitas = dataPasien.filter(p => {
      if (p.status_gizi && p.status_gizi.toLowerCase().includes('obesitas')) return true;
      const imt = parseFloat(p.imt_skor) || 0;
      return imt >= 27;
    }).length;

    const giziKurang = dataPasien.filter(p => {
      if (p.status_gizi && p.status_gizi.toLowerCase().includes('kurus')) return true;
      const imt = parseFloat(p.imt_skor) || 0;
      return imt > 0 && imt < 18.5;
    }).length;

    const rujukan = dataPasien.filter(p => p.status === 'Rujukan').length;

    return { hipertensi, suspekDM, obesitas, giziKurang, rujukan };
  }, [dataPasien]);

  // Distribusi Wilayah (dari Peta.js)
  const distribusiWilayah = useMemo(() => {
    return daftarKecamatan.map(kec => ({
      name: kec,
      total: dataPasien.filter(p => p.wilayah_id === kec).length,
      aktif: dataPasien.filter(p => p.wilayah_id === kec && p.status !== 'Sembuh' && p.status !== 'Meninggal').length
    })).sort((a, b) => b.total - a.total).slice(0, 5);
  }, [dataPasien, daftarKecamatan]);

  const isWabahAktif = useMemo(() => {
    return ewsLogs.some(log => log.pesan.toLowerCase().includes('wabah') || log.pesan.toLowerCase().includes('darurat'));
  }, [ewsLogs]);

  // --- FUNGSI EKSPOR PDF TERSTRUKTUR ---
  const exportToPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 14;
    let yPos = 20;

    // Header
    doc.setFontSize(18);
    doc.setFont(undefined, 'bold');
    doc.text('LAPORAN DASHBOARD ANALITIK & OPERASIONAL', pageWidth / 2, yPos, { align: 'center' });
    
    yPos += 8;
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.text('Medical Command Center v2.0', pageWidth / 2, yPos, { align: 'center' });
    
    yPos += 5;
    doc.setFontSize(9);
    doc.text(`Tanggal: ${new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}`, pageWidth / 2, yPos, { align: 'center' });
    
    yPos += 10;
    doc.setLineWidth(0.5);
    doc.line(margin, yPos, pageWidth - margin, yPos);
    yPos += 8;

    // KPI Utama
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text('INDIKATOR KINERJA UTAMA (KPI)', margin, yPos);
    yPos += 6;

    doc.autoTable({
      startY: yPos,
      head: [['Indikator', 'Nilai', 'Persentase']],
      body: [
        ['Total Registrasi Pasien', totalPasien.toString(), '-'],
        ['Kasus Aktif Lapangan', kasusAktif.toString(), '-'],
        ['Pasien Dinyatakan Sembuh', sembuh.toString(), `${totalPasien ? ((sembuh/totalPasien)*100).toFixed(1) : 0}%`],
        ['Kasus Fatal / Meninggal', meninggal.toString(), `${totalPasien ? ((meninggal/totalPasien)*100).toFixed(1) : 0}%`]
      ],
      theme: 'grid',
      headStyles: { fillColor: [99, 102, 241], fontSize: 9, fontStyle: 'bold' },
      bodyStyles: { fontSize: 9 },
      margin: { left: margin, right: margin }
    });

    yPos = doc.lastAutoTable.finalY + 10;

    // KPI CKG (Cek Kesehatan Gratis)
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text('INDIKATOR CEK KESEHATAN GRATIS (CKG)', margin, yPos);
    yPos += 6;

    doc.autoTable({
      startY: yPos,
      head: [['Kategori', 'Jumlah', 'Keterangan']],
      body: [
        ['Hipertensi', kpiCKG.hipertensi.toString(), `${totalPasien > 0 ? ((kpiCKG.hipertensi / totalPasien) * 100).toFixed(1) : 0}%`],
        ['Suspek Diabetes Melitus', kpiCKG.suspekDM.toString(), 'GDS ≥200 mg/dL'],
        ['Obesitas', kpiCKG.obesitas.toString(), 'IMT ≥27 kg/m²'],
        ['Gizi Kurang', kpiCKG.giziKurang.toString(), 'IMT <18.5 kg/m²'],
        ['Perlu Rujukan', kpiCKG.rujukan.toString(), 'Faskes Lanjut']
      ],
      theme: 'grid',
      headStyles: { fillColor: [99, 102, 241], fontSize: 9, fontStyle: 'bold' },
      bodyStyles: { fontSize: 9 },
      margin: { left: margin, right: margin }
    });

    yPos = doc.lastAutoTable.finalY + 10;

    // Top 5 Penyakit
    if (topPenyakitData.length > 0) {
      doc.setFontSize(12);
      doc.setFont(undefined, 'bold');
      doc.text('TOP 5 KLASTER PENYAKIT', margin, yPos);
      yPos += 6;

      doc.autoTable({
        startY: yPos,
        head: [['No', 'Nama Penyakit', 'Jumlah Kasus']],
        body: topPenyakitData.map((p, idx) => [(idx + 1).toString(), p.name, p.Jumlah.toString()]),
        theme: 'grid',
        headStyles: { fillColor: [99, 102, 241], fontSize: 9, fontStyle: 'bold' },
        bodyStyles: { fontSize: 9 },
        margin: { left: margin, right: margin }
      });

      yPos = doc.lastAutoTable.finalY + 10;
    }

    // Distribusi Wilayah
    if (distribusiWilayah.length > 0) {
      if (yPos > 250) {
        doc.addPage();
        yPos = 20;
      }

      doc.setFontSize(12);
      doc.setFont(undefined, 'bold');
      doc.text('TOP 5 WILAYAH KECAMATAN', margin, yPos);
      yPos += 6;

      doc.autoTable({
        startY: yPos,
        head: [['No', 'Kecamatan', 'Total Kasus', 'Kasus Aktif']],
        body: distribusiWilayah.map((w, idx) => [
          (idx + 1).toString(), 
          w.name, 
          w.total.toString(), 
          w.aktif.toString()
        ]),
        theme: 'grid',
        headStyles: { fillColor: [99, 102, 241], fontSize: 9, fontStyle: 'bold' },
        bodyStyles: { fontSize: 9 },
        margin: { left: margin, right: margin }
      });

      yPos = doc.lastAutoTable.finalY + 10;
    }

    // Demografi Usia
    if (yPos > 250) {
      doc.addPage();
      yPos = 20;
    }

    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text('DEMOGRAFI USIA RESPONDEN', margin, yPos);
    yPos += 6;

    doc.autoTable({
      startY: yPos,
      head: [['Kelompok Usia', 'Jumlah Pasien']],
      body: demografiData.map(d => [d.name, d.Jumlah.toString()]),
      theme: 'grid',
      headStyles: { fillColor: [99, 102, 241], fontSize: 9, fontStyle: 'bold' },
      bodyStyles: { fontSize: 9 },
      margin: { left: margin, right: margin }
    });

    yPos = doc.lastAutoTable.finalY + 10;

    // Live BOR Rumah Sakit
    if (Object.keys(liveBOR).length > 0) {
      if (yPos > 250) {
        doc.addPage();
        yPos = 20;
      }

      doc.setFontSize(12);
      doc.setFont(undefined, 'bold');
      doc.text('LIVE BED OCCUPANCY RATE (BOR) FASKES', margin, yPos);
      yPos += 6;

      doc.autoTable({
        startY: yPos,
        head: [['Nama Rumah Sakit', 'BOR (%)', 'Status']],
        body: Object.entries(liveBOR).map(([rsName, value]) => [
          rsName, 
          `${value}%`, 
          value > 80 ? 'Kritis' : value > 50 ? 'Waspada' : 'Normal'
        ]),
        theme: 'grid',
        headStyles: { fillColor: [99, 102, 241], fontSize: 9, fontStyle: 'bold' },
        bodyStyles: { fontSize: 9 },
        margin: { left: margin, right: margin }
      });

      yPos = doc.lastAutoTable.finalY + 10;

      // Rekomendasi Rujukan
      if (yPos > 270) {
        doc.addPage();
        yPos = 20;
      }

      doc.setFontSize(10);
      doc.setFont(undefined, 'bold');
      doc.text('Rekomendasi Rujukan Utama:', margin, yPos);
      yPos += 5;
      doc.setFontSize(9);
      doc.setFont(undefined, 'normal');
      const rekomendasiLines = doc.splitTextToSize(rekomendasiRS, pageWidth - (margin * 2));
      doc.text(rekomendasiLines, margin, yPos);
      yPos += (rekomendasiLines.length * 5);
    }

    // Program Intervensi CKG
    if (programIntervensi.length > 0) {
      if (yPos > 240) {
        doc.addPage();
        yPos = 20;
      }

      doc.setFontSize(12);
      doc.setFont(undefined, 'bold');
      doc.text('PROGRAM INTERVENSI CKG', margin, yPos);
      yPos += 6;

      doc.autoTable({
        startY: yPos,
        head: [['Nama Program', 'Wilayah Target', 'Target DMF-T', 'Status', 'Tanggal Mulai']],
        body: programIntervensi.map(p => [
          p.nama_program,
          p.wilayah_target,
          p.target_dmft,
          p.status,
          p.tanggal_mulai
        ]),
        theme: 'grid',
        headStyles: { fillColor: [99, 102, 241], fontSize: 8, fontStyle: 'bold' },
        bodyStyles: { fontSize: 8 },
        margin: { left: margin, right: margin },
        columnStyles: {
          0: { cellWidth: 50 },
          1: { cellWidth: 35 },
          2: { cellWidth: 25 },
          3: { cellWidth: 25 },
          4: { cellWidth: 30 }
        }
      });

      yPos = doc.lastAutoTable.finalY + 10;
    }

    // Footer
    const totalPages = doc.internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setFont(undefined, 'normal');
      doc.text(
        `Halaman ${i} dari ${totalPages} | Dicetak: ${new Date().toLocaleString('id-ID')}`,
        pageWidth / 2,
        doc.internal.pageSize.getHeight() - 10,
        { align: 'center' }
      );
    }

    // Simpan PDF
    doc.save(`Laporan_Dashboard_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const trendData = useMemo(() => {
    if (timeDimension === 'Bulanan') {
      const bulanNama = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
      return bulanNama.map((bln, index) => {
        const count = dataPasien.filter(p => {
          if (!p.tanggal_masuk) return false;
          const bulanPasien = new Date(p.tanggal_masuk).getMonth();
          const tahunPasien = new Date(p.tanggal_masuk).getFullYear();
          return bulanPasien === index && tahunPasien === new Date().getFullYear();
        }).length;
        return { name: bln, "Kasus Baru": count };
      });
    } else {
      const tahunSekarang = new Date().getFullYear();
      const daftarTahun = Array.from({ length: 5 }, (_, i) => tahunSekarang - 4 + i);
      return daftarTahun.map(thn => {
        const count = dataPasien.filter(p => {
          if (!p.tanggal_masuk) return false;
          return new Date(p.tanggal_masuk).getFullYear() === thn;
        }).length;
        return { name: String(thn), "Kasus Baru": count };
      });
    }
  }, [dataPasien, timeDimension]);

  const outcomeData = useMemo(() => {
    return [
      { name: 'Sembuh', value: sembuh },
      { name: 'Dalam Perawatan', value: kasusAktif },
      { name: 'Meninggal', value: meninggal }
    ].filter(d => d.value > 0);
  }, [sembuh, kasusAktif, meninggal]);

  const topPenyakitData = useMemo(() => {
    const counts = {};
    dataPasien.forEach(p => {
      if (p.penyakit_id) {
        counts[p.penyakit_id] = (counts[p.penyakit_id] || 0) + 1;
      }
    });
    return Object.keys(counts)
      .map(key => ({ name: key, Jumlah: counts[key] }))
      .sort((a, b) => b.Jumlah - a.Jumlah)
      .slice(0, 5);
  }, [dataPasien]);

  const demografiData = useMemo(() => {
    let anak = 0, remaja = 0, dewasa = 0, lansia = 0;
    dataPasien.forEach(p => {
      const usia = parseInt(p.umur);
      if (isNaN(usia)) return;
      if (usia <= 11) anak++;
      else if (usia <= 25) remaja++;
      else if (usia <= 45) dewasa++;
      else lansia++;
    });
    return [
      { name: 'Anak', Jumlah: anak },
      { name: 'Remaja', Jumlah: remaja },
      { name: 'Dewasa', Jumlah: dewasa },
      { name: 'Lansia', Jumlah: lansia }
    ];
  }, [dataPasien]);

  return (
    <div className="p-10 bg-slate-50/50 min-h-screen space-y-10">
      
      {/* --- PANEL SYSTEM PERINGATAN DINI (EWS ALERT) --- */}
      {isWabahAktif && (
        <div className="bg-gradient-to-r from-rose-500 to-amber-500 p-5 rounded-3xl text-white shadow-xl shadow-rose-100 flex items-center justify-between animate-pulse">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/20 rounded-2xl">
              <BellRing size={24} className="text-white" />
            </div>
            <div className="text-left">
              <h5 className="font-black text-sm uppercase tracking-wider">Early Warning System (EWS) Alert Active</h5>
              <p className="text-xs text-white/90 font-bold mt-0.5">Terdeteksi lonjakan aktivitas kasus tinggi/wabah di wilayah rujukan faskes.</p>
            </div>
          </div>
          <span className="bg-white/20 border border-white/30 text-[10px] font-black px-4 py-2 rounded-xl uppercase tracking-widest">
            Tindakan Darurat
          </span>
        </div>
      )}

      {/* --- HEADER DASHBOARD --- */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
        <div className="space-y-2 text-left">
          <div className="flex items-center gap-2.5 text-indigo-600">
            <Database size={16} />
            <span className="text-[10px] font-black uppercase tracking-widest">Medical Command Center v2.0</span>
          </div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tighter">Dashboard Analitik & Operasional</h2>
          <p className="text-xs font-bold text-slate-400">Monitoring data rekam medis, status BOR faskes, dan log darurat penanganan secara terpusat.</p>
        </div>
        <div className="flex flex-wrap gap-3 w-full lg:w-auto">
          <button 
            onClick={() => {
              exportToPDF();
              exportToExcel(dataPasien, "Laporan_Kesehatan_Pusat");
            }}
            className="flex-1 lg:flex-none bg-slate-900 text-white font-black text-[10px] uppercase tracking-widest px-6 py-4 rounded-2xl hover:bg-slate-800 transition-all shadow-md active:scale-95 flex items-center justify-center gap-2"
          >
            <FileBarChart size={14} /> Ekspor Master Data
          </button>
        </div>
      </div>

      {/* --- KPI UTAMA (STAT CARDS) --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Registrasi Pasien" value={totalPasien} sub="Akumulasi Rekam Medis" icon={<Users />} color="text-indigo-600" bg="bg-indigo-50" />
        <StatCard title="Kasus Aktif Lapangan" value={kasusAktif} sub="Dalam Penanganan Medis" icon={<Activity />} color="text-amber-500" bg="bg-amber-50" />
        <StatCard title="Pasien Dinyatakan Sembuh" value={sembuh} sub={`${totalPasien ? ((sembuh/totalPasien)*100).toFixed(1) : 0}% Recovery Rate`} icon={<ShieldCheck />} color="text-emerald-500" bg="bg-emerald-50" />
        <StatCard title="Kasus Fatal / Meninggal" value={meninggal} sub={`${totalPasien ? ((meninggal/totalPasien)*100).toFixed(1) : 0}% Fatality Rate`} icon={<AlertCircle />} color="text-rose-500" bg="bg-rose-50" />
      </div>

      {/* --- KPI CKG (Cek Kesehatan Gratis) --- */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <KPICardSmall title="Hipertensi" value={kpiCKG.hipertensi} icon={<HeartPulse />} color="rose" sub={`${totalPasien > 0 ? ((kpiCKG.hipertensi / totalPasien) * 100).toFixed(1) : 0}%`} />
        <KPICardSmall title="Suspek DM" value={kpiCKG.suspekDM} icon={<Droplets />} color="amber" sub="GDS ≥200" />
        <KPICardSmall title="Obesitas" value={kpiCKG.obesitas} icon={<Scale />} color="orange" sub="IMT ≥27" />
        <KPICardSmall title="Gizi Kurang" value={kpiCKG.giziKurang} icon={<TrendingDown />} color="yellow" sub="IMT <18.5" />
        <KPICardSmall title="Perlu Rujukan" value={kpiCKG.rujukan} icon={<Hospital />} color="purple" sub="Faskes Lanjut" />
      </div>

      {/* --- GRAPH & OPERATIONAL SECTION --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Kiri: Grafik Tren Kasus */}
        <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6">
          <div className="flex justify-between items-center">
            <div className="space-y-1 text-left">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Alur Distribusi Waktu</span>
              <h3 className="text-xl font-black text-slate-800 tracking-tight">Id / Tren Kasus Baru</h3>
            </div>
            
            {/* Toggle Dimensi Waktu */}
            <div className="bg-slate-100 p-1 rounded-xl flex gap-1">
              <button 
                onClick={() => setTimeDimension('Bulanan')}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${timeDimension === 'Bulanan' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
              >
                Bulanan
              </button>
              <button 
                onClick={() => setTimeDimension('Tahunan')}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${timeDimension === 'Tahunan' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
              >
                Tahunan
              </button>
            </div>
          </div>
          <div className="h-72 w-full text-xs font-bold text-slate-400">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorKasus" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} className="font-bold" />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} className="font-bold" />
                <Tooltip contentStyle={{ fontFamily: 'ui-sans-serif, system-ui, sans-serif', fontWeight: 'bold', borderRadius: '1rem' }} />
                <Area type="monotone" dataKey="Kasus Baru" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorKasus)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Kanan: Live BOR Rumah Sakit */}
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="space-y-1 text-left">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Kapasitas Logistik Faskes</span>
              <h3 className="text-xl font-black text-slate-800 tracking-tight">Live Bed Occupancy (BOR)</h3>
            </div>
            
            <div className="space-y-4">
              {Object.keys(liveBOR).length > 0 ? (
                Object.entries(liveBOR).map(([rsName, value]) => (
                  <div key={rsName} className="space-y-1.5 text-left">
                    <div className="flex justify-between text-xs font-black text-slate-700 uppercase tracking-wide">
                      <span>{rsName}</span>
                      <span className={value > 80 ? 'text-rose-500 font-black' : 'text-indigo-600'}>{value}%</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-1000 ${value > 80 ? 'bg-rose-500' : value > 50 ? 'bg-amber-400' : 'bg-indigo-500'}`} 
                        style={{ width: `${value}%` }} 
                      />
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-xs text-slate-400 font-black uppercase tracking-wider">Data BOR API Tidak Tersedia</div>
              )}
            </div>
          </div>

          <div className="p-4 bg-indigo-50/50 border border-indigo-100/50 rounded-2xl space-y-2 text-left">
            <div className="flex items-center gap-2 text-indigo-600 font-black text-[10px] uppercase tracking-widest">
              <Bed size={14} /> Rekomendasi Rujukan Utama
            </div>
            <p className="text-xs text-slate-600 font-bold leading-relaxed">
              {rekomendasiRS}
            </p>
          </div>
        </div>

      </div>

      {/* --- LOWER ANALYTICS SECTION --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        
        {/* Status Outcome Klinis */}
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-4">
          <div className="text-left space-y-1">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Kondisi Akhir</span>
            <h4 className="text-lg font-black text-slate-800 tracking-tight">Status Outcome Klinis</h4>
          </div>
          <div className="h-48 flex items-center justify-center relative">
            {outcomeData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={outcomeData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                    {outcomeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.name] || COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ fontFamily: 'ui-sans-serif, system-ui, sans-serif', fontWeight: 'bold', borderRadius: '1rem' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-xs font-black text-slate-400 uppercase tracking-wider">Belum ada data status</p>
            )}
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-2xl font-black text-slate-800 tracking-tighter">{totalPasien}</span>
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Total Kasus</span>
            </div>
          </div>
          <div className="flex flex-wrap gap-4 justify-center text-[10px] font-black text-slate-500 uppercase tracking-wider">
            {outcomeData.map((d, i) => (
              <div key={d.name} className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: STATUS_COLORS[d.name] || COLORS[i % COLORS.length] }} />
                <span>{d.name} ({d.value})</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top 5 Klaster Penyakit */}
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-4">
          <div className="text-left space-y-1">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Morbiditas Tertinggi</span>
            <h4 className="text-lg font-black text-slate-800 tracking-tight">Top 5 Klaster Penyakit</h4>
          </div>
          <div className="h-56 w-full text-[10px] font-black uppercase">
            {topPenyakitData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topPenyakitData} layout="vertical" margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                  <XAxis type="number" stroke="#94a3b8" fontSize={10} tickLine={false} className="font-bold" />
                  <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={10} tickLine={false} width={70} className="font-bold" />
                  <Tooltip contentStyle={{ fontFamily: 'ui-sans-serif, system-ui, sans-serif', fontWeight: 'bold', borderRadius: '1rem' }} />
                  <Bar dataKey="Jumlah" radius={[0, 8, 8, 0]}>
                    {topPenyakitData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-xs font-black text-slate-400 uppercase tracking-wider">Belum ada data kode diagnosa</div>
            )}
          </div>
        </div>

        {/* Distribusi Wilayah Top 5 */}
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-4">
          <div className="text-left space-y-1">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sebaran Geografis</span>
            <h4 className="text-lg font-black text-slate-800 tracking-tight">Top 5 Wilayah Kecamatan</h4>
          </div>
          <div className="space-y-3">
            {distribusiWilayah.map((wilayah, index) => (
              <div key={wilayah.name} className="space-y-1.5">
                <div className="flex justify-between text-xs font-bold text-slate-600">
                  <span className="flex items-center gap-2">
                    <MapPin size={12} className="text-indigo-500" />
                    {wilayah.name}
                  </span>
                  <span className="font-black text-slate-800">{wilayah.total} <span className="text-slate-400 font-semibold">({wilayah.aktif} aktif)</span></span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full transition-all duration-700"
                    style={{ 
                      width: `${totalPasien > 0 ? (wilayah.total / totalPasien * 100) : 0}%`, 
                      backgroundColor: COLORS[index % COLORS.length] 
                    }}
                  />
                </div>
              </div>
            ))}
            {distribusiWilayah.length === 0 && (
              <p className="text-center text-xs text-slate-400 py-8 font-semibold">Belum ada data wilayah</p>
            )}
          </div>
        </div>

      </div>

      {/* --- PANEL CKG & PROGRAM INTERVENSI --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Program Intervensi CKG */}
        <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 p-6 rounded-[2.5rem] text-white border border-indigo-500/50">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-white/20 text-white rounded-xl border border-white/30">
                <Target size={18} />
              </div>
              <div>
                <h3 className="text-sm font-bold tracking-tight">Program Intervensi CKG</h3>
                <p className="text-[10px] text-indigo-100 font-medium">Target Penurunan DMF-T</p>
              </div>
            </div>
            <span className="bg-white/20 text-white border border-white/30 text-[9px] px-2 py-1 rounded-full font-bold uppercase tracking-wider">
              {programIntervensi.length} Aktif
            </span>
          </div>

          <div className="space-y-2.5 max-h-[160px] overflow-y-auto pr-1">
            {programIntervensi.length === 0 ? (
              <div className="text-center py-6 text-indigo-100 border border-dashed border-white/30 rounded-xl">
                <p className="text-[10px] font-bold uppercase tracking-wider">Belum Ada Program Aktif</p>
              </div>
            ) : (
              programIntervensi.map((program) => (
                <div key={program.id} className="bg-white/10 border border-white/20 rounded-xl p-2.5 backdrop-blur-sm">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold text-white truncate">{program.nama_program}</h4>
                      <p className="text-[10px] text-indigo-100 mt-0.5 truncate">{program.wilayah_target}</p>
                    </div>
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                      program.status === 'Berjalan' 
                        ? 'bg-emerald-500 text-white' 
                        : 'bg-amber-500 text-white'
                    }`}>
                      {program.status}
                    </span>
                  </div>
                  <div className="mt-2 flex items-center justify-between text-[10px]">
                    <div className="flex items-center gap-1 text-indigo-100">
                      <Calendar size={9} />
                      <span>{program.tanggal_mulai}</span>
                    </div>
                    <div className="flex items-center gap-1 text-white font-bold">
                      <Award size={9} />
                      <span>Target: {program.target_dmft}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Aktivitas Tim Kesehatan */}
        <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100">
                <UserCheck size={16} />
              </div>
              <div>
                <h3 className="text-xs font-bold tracking-tight text-slate-800 uppercase">Aktivitas Tim CKG</h3>
                <p className="text-[10px] text-slate-500 font-medium">Monitoring Lapangan</p>
              </div>
            </div>
          </div>

          <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
            {aktivitasTim.length === 0 ? (
              <div className="text-center py-5 text-slate-400 text-[10px] border border-dashed border-slate-200 rounded-lg">
                Belum ada aktivitas tim hari ini.
              </div>
            ) : (
              aktivitasTim.map((aktivitas) => (
                <div key={aktivitas.id} className="bg-slate-50 border border-slate-100 rounded-lg p-2 flex items-start gap-2">
                  <div className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg shrink-0">
                    <UserCheck size={12} />
                  </div>
                  <div className="min-w-0 flex-1 text-[11px]">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-slate-800 truncate">{aktivitas.tim}</span>
                      <span className="text-slate-400">•</span>
                      <span className="text-slate-500 text-[10px]">{aktivitas.waktu}</span>
                    </div>
                    <p className="text-slate-600 mt-0.5 truncate">{aktivitas.kegiatan}</p>
                    <p className="text-slate-400 text-[10px] mt-0.5">
                      <span className="text-emerald-600 font-bold">{aktivitas.jumlah_pasien}</span> pasien diperiksa
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* DMF-T Tracker */}
        <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-xl border border-blue-100">
                <Activity size={16} />
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-tight">Indeks DMF-T</h3>
                <p className="text-[10px] text-slate-400 font-medium">Kesehatan Gigi</p>
              </div>
            </div>
          </div>

          <div className="space-y-2.5 max-h-[160px] overflow-y-auto pr-1">
            {Object.keys(dmftData).length === 0 ? (
              <div className="text-center py-6 text-slate-400 text-[10px] border border-dashed border-slate-200 rounded-lg">
                Menghubungkan ke server...
              </div>
            ) : (
              Object.entries(dmftData).slice(0, 3).map(([namaWilayah, data]) => {
                const dmftIndex = data.dmft_index || 0;
                const kategori = data.kategori || 'Normal';
                const isKritis = kategori === 'Tinggi';

                return (
                  <div key={namaWilayah} className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <div className="flex justify-between items-center text-[11px] font-bold text-slate-700">
                      <span className="truncate">{namaWilayah}</span>
                      <span className={`${isKritis ? 'text-rose-600' : kategori === 'Sedang' ? 'text-amber-600' : 'text-emerald-600'}`}>
                        {dmftIndex.toFixed(1)}
                      </span>
                    </div>
                    <div className="mt-1.5 flex justify-between items-center text-[10px]">
                      <span className="text-slate-400">{data.jumlah_pasien || 0} Pasien</span>
                      <span className={`font-bold uppercase px-2 py-0.5 rounded-full text-[9px] ${
                        isKritis 
                          ? 'bg-rose-100 text-rose-600' 
                          : kategori === 'Sedang'
                          ? 'bg-amber-100 text-amber-600'
                          : 'bg-emerald-100 text-emerald-600'
                      }`}>
                        {kategori}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>

      {/* --- PANEL DEMOGRAFI KLINIS PASIEN --- */}
      <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6">
        <div className="flex justify-between items-center">
          <div className="space-y-1 text-left">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Stratifikasi Pasien</span>
            <h3 className="text-xl font-black text-slate-800 tracking-tight">Demografi Usia Responden</h3>
          </div>
          <button 
            onClick={() => setShowPreview(!showPreview)}
            className="text-[10px] font-black text-indigo-600 uppercase tracking-widest bg-indigo-50 px-4 py-2 rounded-xl border border-indigo-100/50 hover:bg-indigo-100 transition-all"
          >
            {showPreview ? 'Sembunyikan Angka' : 'Lihat Detail'}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3 h-56 text-xs font-bold">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={demografiData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} className="font-bold" />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} className="font-bold" />
                <Tooltip contentStyle={{ fontFamily: 'ui-sans-serif, system-ui, sans-serif', fontWeight: 'bold', borderRadius: '1rem' }} />
                <Bar dataKey="Jumlah" fill="#6366f1" radius={[8, 8, 0, 0]} maxBarSize={50} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          
          <div className="bg-slate-50/50 border border-slate-100 p-6 rounded-2xl flex flex-col justify-center space-y-4 text-left">
            <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Rangkuman Umur</h5>
            <div className="space-y-2">
              {demografiData.map((d, index) => (
                <div key={d.name} className="flex justify-between items-center text-xs font-bold text-slate-600 uppercase tracking-wide">
                  <span className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-indigo-500" /> {d.name}
                  </span>
                  <span className="text-slate-800 font-black">{d.Jumlah} Pasien</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {showPreview && (
          <div className="pt-6 border-t border-slate-100 grid grid-cols-2 md:grid-cols-4 gap-4 text-left animate-fadeIn">
            {demografiData.map(d => (
              <div key={d.name} className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider">{d.name}</p>
                <h6 className="text-xl font-black text-slate-800 tracking-tighter mt-1">{d.Jumlah} <span className="text-xs text-slate-400 font-bold uppercase">Kasus</span></h6>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};

// --- MODULAR COMPONENT: STAT CARDS ---
const StatCard = ({ title, value, sub, icon, color, bg }) => (
  <div className="p-8 rounded-[2.5rem] bg-white border border-slate-100 shadow-sm flex items-start justify-between group hover:border-indigo-200 transition-all duration-300">
    <div className="space-y-3 text-left">
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">{title}</p>
      <h4 className="text-4xl font-black text-slate-800 leading-none tracking-tighter">{value}</h4>
      <p className="text-[10px] font-bold text-slate-500 flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100">
        <Clock size={10} className="text-slate-400" /> {sub}
      </p>
    </div>
    <div className={`p-4 rounded-2xl ${bg} ${color} transition-transform group-hover:scale-110 duration-300`}>
      {React.cloneElement(icon, { size: 22 })}
    </div>
  </div>
);

// --- MODULAR COMPONENT: KPI CARD SMALL (untuk CKG) ---
const KPICardSmall = ({ title, value, icon, color, sub }) => {
  const colorMap = {
    indigo:  { bg: "bg-indigo-50",  text: "text-indigo-600",  border: "border-indigo-100" },
    rose:    { bg: "bg-rose-50",    text: "text-rose-600",    border: "border-rose-100" },
    amber:   { bg: "bg-amber-50",   text: "text-amber-600",   border: "border-amber-100" },
    orange:  { bg: "bg-orange-50",  text: "text-orange-600",  border: "border-orange-100" },
    yellow:  { bg: "bg-yellow-50",  text: "text-yellow-600",  border: "border-yellow-100" },
    purple:  { bg: "bg-purple-50",  text: "text-purple-600",  border: "border-purple-100" },
    emerald: { bg: "bg-emerald-50", text: "text-emerald-600", border: "border-emerald-100" }
  };

  const c = colorMap[color] || colorMap.indigo;

  return (
    <div className="bg-white p-5 rounded-[1.5rem] border border-slate-200 shadow-sm hover:shadow-md transition-all group">
      <div className="flex justify-between items-start mb-3">
        <div className={`p-3 rounded-xl ${c.bg} ${c.text} ${c.border} border transition-transform group-hover:scale-110 duration-300`}>
          {React.cloneElement(icon, { size: 18 })}
        </div>
      </div>
      <div>
        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">{title}</p>
        <h4 className="text-2xl font-black text-slate-900 tracking-tight">{value}</h4>
        {sub && <p className="text-[10px] font-semibold text-slate-400 mt-1">{sub}</p>}
      </div>
    </div>
  );
};

export default DashboardAdmin;
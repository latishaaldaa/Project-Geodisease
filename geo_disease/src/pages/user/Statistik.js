import React, { useState, useMemo, useRef } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, BarChart, Bar
} from 'recharts';
import { 
  Activity, Users, TrendingUp, RefreshCw, HeartPulse, 
  Shield, Filter, FileText, Calendar, Stethoscope,
  Droplets, Scale, AlertTriangle, UserCheck, ArrowUpRight,
  Thermometer, Pill, ClipboardList
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

// =============================================================================
// KONSTANTA REFERENSI STANDAR CKG — KEMENKES RI
// KMK No. HK.01.07/MENKES/33/2025 — Juknis Pemeriksaan Kesehatan Gratis
// =============================================================================
const WARNA_PALET = {
  indigo: '#4F46E5',
  emerald: '#10B981',
  amber: '#F59E0B',
  rose: '#F43F5E',
  violet: '#8B5CF6',
  cyan: '#06B6D4',
  slate: '#64748B',
  sky: '#0EA5E9',
  pink: '#EC4899',
  lime: '#84CC16',
  orange: '#F97316',
  teal: '#14B8A6'
};

const WARNA_STATUS_GIZI = {
  'Kurus': '#F59E0B',
  'Normal': '#10B981',
  'Overweight': '#F97316',
  'Obesitas': '#EF4444'
};

const WARNA_TD = {
  'Normal': '#10B981',
  'Pra-Hipertensi': '#F59E0B',
  'Hipertensi': '#F97316',
  'Krisis': '#EF4444'
};

const WARNA_GDS = {
  'Normal': '#10B981',
  'TGT': '#F59E0B',
  'Suspek DM': '#F97316',
  'Hiperglikemia': '#EF4444'
};

const WARNA_URGENSI = {
  'Normal': '#10B981',
  'Perlu Perhatian': '#06B6D4',
  'Waspada': '#F59E0B',
  'Gawat Darurat': '#EF4444'
};

// =============================================================================
// KOMPONEN UTAMA — STATISTIK CKG TERINTEGRASI
// =============================================================================
const Statistik = ({ dataPasien = [], daftarKecamatan = [], refreshData, loading }) => {
  const [filterKecamatan, setFilterKecamatan] = useState('Semua');
  const [timeDimension, setTimeDimension] = useState('Bulanan');
  const reportRef = useRef(null);
  const chartSectionRef = useRef(null);

  // =========================================================================
  // 1. FILTER KECAMATAN
  // =========================================================================
  const filtered = useMemo(() => {
    return filterKecamatan === 'Semua' 
      ? dataPasien 
      : dataPasien.filter(p => p.wilayah_id === filterKecamatan);
  }, [dataPasien, filterKecamatan]);

  // =========================================================================
  // 2. HELPER — Parsing Tekanan Darah (format: "120/80")
  // =========================================================================
  const parseTD = (td) => {
    if (!td || typeof td !== 'string') return { sistole: 0, diastole: 0 };
    const parts = td.split('/');
    return {
      sistole: parseInt(parts[0]) || 0,
      diastole: parseInt(parts[1]) || 0
    };
  };

  // =========================================================================
  // 3. KPI — INDIKATOR CKG NASIONAL
  // =========================================================================
  const kpiCKG = useMemo(() => {
    const total = filtered.length;
    
    // Deteksi Hipertensi (TD >= 140/90)
    const hipertensi = filtered.filter(p => {
      const td = parseTD(p.tekanan_darah);
      return td.sistole >= 140 || td.diastole >= 90;
    }).length;

    // Deteksi Suspek DM (GDS >= 200 mg/dL)
    const suspekDM = filtered.filter(p => {
      const gds = parseInt(p.gula_darah) || 0;
      return gds >= 200;
    }).length;

    // Deteksi Obesitas (status_gizi contains "Obesitas" atau IMT >= 27)
    const obesitas = filtered.filter(p => {
      if (p.status_gizi && p.status_gizi.toLowerCase().includes('obesitas')) return true;
      const imt = parseFloat(p.imt_skor) || 0;
      return imt >= 27;
    }).length;

    // Deteksi Gizi Kurang (status_gizi contains "Kurus" atau IMT < 18.5)
    const giziKurang = filtered.filter(p => {
      if (p.status_gizi && p.status_gizi.toLowerCase().includes('kurus')) return true;
      const imt = parseFloat(p.imt_skor) || 0;
      return imt > 0 && imt < 18.5;
    }).length;

    // Perlu Rujukan
    const rujukan = filtered.filter(p => p.status === 'Rujukan').length;

    // Sembuh
    const sembuh = filtered.filter(p => p.status === 'Sembuh').length;

    return { total, hipertensi, suspekDM, obesitas, giziKurang, rujukan, sembuh };
  }, [filtered]);

  // =========================================================================
  // 4. DISTRIBUSI PM vs PTM (Penyakit Menular vs Tidak Menular)
  // =========================================================================
  const distribusiPMPTM = useMemo(() => {
    let pm = 0, ptm = 0, lainnya = 0;
    
    // Kata kunci Penyakit Menular
    const keywordPM = ['dengue', 'dbd', 'dss', 'pneumonia', 'ispa', 'gastroenteritis', 'gea', 'tifoid', 'typhoid', 'diare', 'tb ', 'tuberkulosis', 'malaria', 'hepatitis'];
    // Kata kunci PTM
    const keywordPTM = ['hipertensi', 'diabetes', 'dm', 'obesitas', 'gizi', 'hiperglikemia', 'jantung', 'stroke', 'kanker', 'asma', 'copd'];

    filtered.forEach(p => {
      const dx = (p.penyakit_id || '').toLowerCase();
      if (!dx || dx === 'tidak ditemukan penyakit spesifik') {
        lainnya++;
      } else if (keywordPM.some(k => dx.includes(k))) {
        pm++;
      } else if (keywordPTM.some(k => dx.includes(k))) {
        ptm++;
      } else {
        lainnya++;
      }
    });

    return [
      { name: 'Penyakit Menular (PM)', value: pm, color: WARNA_PALET.rose },
      { name: 'Penyakit Tidak Menular (PTM)', value: ptm, color: WARNA_PALET.indigo },
      { name: 'Lainnya / Sehat', value: lainnya, color: WARNA_PALET.slate }
    ].filter(d => d.value > 0);
  }, [filtered]);

  // =========================================================================
  // 5. TOP 10 DIAGNOSIS TERDETEKSI (dengan ICD-10)
  // =========================================================================
  const topDiagnosis = useMemo(() => {
    const counts = {};
    filtered.forEach(p => {
      const dx = p.penyakit_id;
      if (dx && dx !== 'Tidak Ditemukan Penyakit Spesifik') {
        // Ambil nama singkat diagnosis (hapus [ICD-10: xxx] jika ada)
        const namaShort = dx.replace(/\s*\[ICD-10:.*?\]/i, '').trim();
        counts[namaShort] = (counts[namaShort] || 0) + 1;
      }
    });

    return Object.keys(counts)
      .map(name => ({ name: name.length > 35 ? name.substring(0, 32) + '...' : name, fullName: name, value: counts[name] }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10);
  }, [filtered]);

  // =========================================================================
  // 6. DISTRIBUSI STATUS GIZI POPULASI (Standar IMT Asia - Kemenkes RI)
  // =========================================================================
  const distribusiGizi = useMemo(() => {
    let kurus = 0, normal = 0, overweight = 0, obesitas = 0;
    
    filtered.forEach(p => {
      const gizi = (p.status_gizi || '').toLowerCase();
      const imt = parseFloat(p.imt_skor) || 0;

      if (gizi.includes('obesitas') || (imt >= 27)) {
        obesitas++;
      } else if (gizi.includes('overweight') || gizi.includes('kelebihan') || (imt >= 25 && imt < 27)) {
        overweight++;
      } else if (gizi.includes('kurus') || gizi.includes('kurang') || (imt > 0 && imt < 18.5)) {
        kurus++;
      } else if (gizi.includes('normal') || gizi.includes('baik') || (imt >= 18.5 && imt < 25)) {
        normal++;
      }
    });

    return [
      { name: 'Kurus (<18.5)', value: kurus, color: WARNA_STATUS_GIZI['Kurus'] },
      { name: 'Normal (18.5-24.9)', value: normal, color: WARNA_STATUS_GIZI['Normal'] },
      { name: 'Overweight (25-26.9)', value: overweight, color: WARNA_STATUS_GIZI['Overweight'] },
      { name: 'Obesitas (≥27)', value: obesitas, color: WARNA_STATUS_GIZI['Obesitas'] }
    ];
  }, [filtered]);

  // =========================================================================
  // 7. KLASIFIKASI TEKANAN DARAH POPULASI
  // =========================================================================
  const distribusiTD = useMemo(() => {
    let normal = 0, praHipertensi = 0, hipertensi = 0, krisis = 0;

    filtered.forEach(p => {
      const td = parseTD(p.tekanan_darah);
      if (td.sistole === 0 && td.diastole === 0) return;

      if (td.sistole >= 180 || td.diastole >= 120) krisis++;
      else if (td.sistole >= 140 || td.diastole >= 90) hipertensi++;
      else if (td.sistole >= 120 || td.diastole >= 80) praHipertensi++;
      else normal++;
    });

    return [
      { name: 'Normal (<120/80)', value: normal, color: WARNA_TD['Normal'] },
      { name: 'Pra-Hipertensi', value: praHipertensi, color: WARNA_TD['Pra-Hipertensi'] },
      { name: 'Hipertensi (≥140/90)', value: hipertensi, color: WARNA_TD['Hipertensi'] },
      { name: 'Krisis (≥180/120)', value: krisis, color: WARNA_TD['Krisis'] }
    ].filter(d => d.value > 0);
  }, [filtered]);

  // =========================================================================
  // 8. KLASIFIKASI GULA DARAH SEWAKTU POPULASI
  // =========================================================================
  const distribusiGDS = useMemo(() => {
    let normal = 0, tgt = 0, suspekDM = 0, hiperglikemia = 0;

    filtered.forEach(p => {
      const gds = parseInt(p.gula_darah) || 0;
      if (gds === 0) return;

      if (gds >= 300) hiperglikemia++;
      else if (gds >= 200) suspekDM++;
      else if (gds >= 140) tgt++;
      else normal++;
    });

    return [
      { name: 'Normal (<140)', value: normal, color: WARNA_GDS['Normal'] },
      { name: 'TGT (140-199)', value: tgt, color: WARNA_GDS['TGT'] },
      { name: 'Suspek DM (200-299)', value: suspekDM, color: WARNA_GDS['Suspek DM'] },
      { name: 'Hiperglikemia (≥300)', value: hiperglikemia, color: WARNA_GDS['Hiperglikemia'] }
    ].filter(d => d.value > 0);
  }, [filtered]);

  // =========================================================================
  // 9. DEMOGRAFI USIA PESERTA CKG (Sesuai Juknis)
  // =========================================================================
  const demografiUsia = useMemo(() => {
    let balita = 0, anak = 0, dewasa = 0, lansia = 0;

    filtered.forEach(p => {
      const umur = parseInt(p.umur) || 0;
      if (umur < 7) balita++;
      else if (umur >= 7 && umur <= 17) anak++;
      else if (umur >= 18 && umur <= 59) dewasa++;
      else if (umur >= 60) lansia++;
    });

    return [
      { name: 'Balita/Prasekolah (0-6)', Jumlah: balita, color: WARNA_PALET.cyan },
      { name: 'Anak/Remaja (7-17)', Jumlah: anak, color: WARNA_PALET.indigo },
      { name: 'Dewasa (18-59)', Jumlah: dewasa, color: WARNA_PALET.emerald },
      { name: 'Lansia (≥60)', Jumlah: lansia, color: WARNA_PALET.amber }
    ];
  }, [filtered]);

  // =========================================================================
  // 10. DISTRIBUSI TINGKAT URGENSI
  // =========================================================================
  const distribusiUrgensi = useMemo(() => {
    const urgensiMap = { 'Normal': 0, 'Perlu Perhatian': 0, 'Waspada': 0, 'Gawat Darurat': 0 };
    
    // Kata kunci urgensi dari penyakit_id
    const keywordGawat = ['emergency', 'gawat', 'krisis', 'shock', 'dss', 'berat', 'dehidrasi berat'];
    const keywordWaspada = ['suspek', 'waspada', 'dengue', 'tifoid', 'ispa ringan'];
    const keywordPerhatian = ['obesitas', 'gizi kurang', 'gizi lebih', 'underweight'];

    filtered.forEach(p => {
      const dx = (p.penyakit_id || '').toLowerCase();
      const status = p.status;

      if (status === 'Rujukan' || keywordGawat.some(k => dx.includes(k))) {
        urgensiMap['Gawat Darurat']++;
      } else if (keywordWaspada.some(k => dx.includes(k))) {
        urgensiMap['Waspada']++;
      } else if (keywordPerhatian.some(k => dx.includes(k))) {
        urgensiMap['Perlu Perhatian']++;
      } else {
        urgensiMap['Normal']++;
      }
    });

    return Object.keys(urgensiMap)
      .map(name => ({ name, value: urgensiMap[name], color: WARNA_URGENSI[name] }))
      .filter(d => d.value > 0);
  }, [filtered]);

  // =========================================================================
  // 11. TREN KUNJUNGAN CKG (Bulanan / Tahunan)
  // =========================================================================
  const trendData = useMemo(() => {
    const namaBulan = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    const urutanData = {};

    if (timeDimension === 'Bulanan') {
      const tahunSekarang = new Date().getFullYear();
      namaBulan.forEach((bln, indeks) => {
        urutanData[indeks] = { label: bln, "Peserta CKG": 0 };
      });

      filtered.forEach(p => {
        if (!p.tanggal_input) return;
        const tanggal = new Date(p.tanggal_input);
        if (tanggal.getFullYear() === tahunSekarang) {
          const bulanKe = tanggal.getMonth();
          if (urutanData[bulanKe]) {
            urutanData[bulanKe]["Peserta CKG"] += 1;
          }
        }
      });
    } else {
      const tahunSekarang = new Date().getFullYear();
      for (let i = 4; i >= 0; i--) {
        const thn = tahunSekarang - i;
        urutanData[thn] = { label: String(thn), "Peserta CKG": 0 };
      }

      filtered.forEach(p => {
        if (!p.tanggal_input) return;
        const thnPasien = new Date(p.tanggal_input).getFullYear();
        if (urutanData[thnPasien]) {
          urutanData[thnPasien]["Peserta CKG"] += 1;
        }
      });
    }

    return Object.values(urutanData);
  }, [filtered, timeDimension]);

  // =========================================================================
  // 12. DISTRIBUSI WILAYAH (Top 10 Kecamatan)
  // =========================================================================
  const barWilayah = useMemo(() => {
    return daftarKecamatan.map(kec => ({
      name: kec,
      peserta: dataPasien.filter(p => p.wilayah_id === kec).length
    })).sort((a, b) => b.peserta - a.peserta).slice(0, 10);
  }, [dataPasien, daftarKecamatan]);

  // =========================================================================
  // 13. FUNGSI EKSPOR PDF TERSTRUKTUR (BUKAN SCREENSHOT)
  // =========================================================================
  const exportToPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 14;
    let yPos = 20;

    // Header Laporan
    doc.setFontSize(18);
    doc.setFont(undefined, 'bold');
    doc.text('LAPORAN STATISTIK CEK KESEHATAN GRATIS (CKG)', pageWidth / 2, yPos, { align: 'center' });
    
    yPos += 8;
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.text('Monitoring & Analisis Indikator Kesehatan Masyarakat', pageWidth / 2, yPos, { align: 'center' });
    
    yPos += 5;
    doc.setFontSize(9);
    doc.text(`Wilayah: ${filterKecamatan} | Tanggal: ${new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}`, pageWidth / 2, yPos, { align: 'center' });
    
    yPos += 3;
    doc.setFontSize(8);
    doc.text('KMK No. HK.01.07/MENKES/33/2025 — Juknis Pemeriksaan Kesehatan Gratis', pageWidth / 2, yPos, { align: 'center' });
    
    yPos += 8;
    doc.setLineWidth(0.5);
    doc.line(margin, yPos, pageWidth - margin, yPos);
    yPos += 8;

    // KPI CKG Nasional
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text('INDIKATOR CEK KESEHATAN GRATIS (CKG) NASIONAL', margin, yPos);
    yPos += 6;

    doc.autoTable({
      startY: yPos,
      head: [['Indikator', 'Jumlah', 'Keterangan']],
      body: [
        ['Total Peserta CKG', kpiCKG.total.toString(), 'Jumlah peserta terskrining'],
        ['Hipertensi', kpiCKG.hipertensi.toString(), `${kpiCKG.total > 0 ? ((kpiCKG.hipertensi / kpiCKG.total) * 100).toFixed(1) : 0}% prevalensi`],
        ['Suspek Diabetes Melitus', kpiCKG.suspekDM.toString(), 'GDS ≥200 mg/dL'],
        ['Obesitas', kpiCKG.obesitas.toString(), 'IMT ≥27 kg/m²'],
        ['Gizi Kurang', kpiCKG.giziKurang.toString(), 'IMT <18.5 kg/m²'],
        ['Perlu Rujukan', kpiCKG.rujukan.toString(), 'Dirujuk ke faskes lanjut'],
        ['Pasien Sembuh', kpiCKG.sembuh.toString(), 'Status outcome klinis']
      ],
      theme: 'grid',
      headStyles: { fillColor: [79, 70, 229], fontSize: 9, fontStyle: 'bold' },
      bodyStyles: { fontSize: 9 },
      margin: { left: margin, right: margin }
    });

    yPos = doc.lastAutoTable.finalY + 10;

    // Distribusi Status Gizi
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text('DISTRIBUSI STATUS GIZI POPULASI (IMT Standar Asia)', margin, yPos);
    yPos += 6;

    const totalGizi = distribusiGizi.reduce((sum, g) => sum + g.value, 0);
    doc.autoTable({
      startY: yPos,
      head: [['Kategori', 'Jumlah', 'Persentase']],
      body: distribusiGizi.map(item => [
        item.name,
        item.value.toString(),
        `${totalGizi > 0 ? ((item.value / totalGizi) * 100).toFixed(1) : 0}%`
      ]),
      theme: 'grid',
      headStyles: { fillColor: [79, 70, 229], fontSize: 9, fontStyle: 'bold' },
      bodyStyles: { fontSize: 9 },
      margin: { left: margin, right: margin }
    });

    yPos = doc.lastAutoTable.finalY + 10;

    // Klasifikasi Tekanan Darah
    if (distribusiTD.length > 0) {
      if (yPos > 250) {
        doc.addPage();
        yPos = 20;
      }

      doc.setFontSize(12);
      doc.setFont(undefined, 'bold');
      doc.text('KLASIFIKASI TEKANAN DARAH POPULASI', margin, yPos);
      yPos += 6;

      doc.autoTable({
        startY: yPos,
        head: [['Kategori', 'Jumlah Pasien']],
        body: distribusiTD.map(item => [item.name, item.value.toString()]),
        theme: 'grid',
        headStyles: { fillColor: [79, 70, 229], fontSize: 9, fontStyle: 'bold' },
        bodyStyles: { fontSize: 9 },
        margin: { left: margin, right: margin }
      });

      yPos = doc.lastAutoTable.finalY + 10;
    }

    // Klasifikasi Gula Darah Sewaktu
    if (distribusiGDS.length > 0) {
      if (yPos > 250) {
        doc.addPage();
        yPos = 20;
      }

      doc.setFontSize(12);
      doc.setFont(undefined, 'bold');
      doc.text('KLASIFIKASI GULA DARAH SEWAKTU (GDS) POPULASI', margin, yPos);
      yPos += 6;

      doc.autoTable({
        startY: yPos,
        head: [['Kategori', 'Jumlah Pasien']],
        body: distribusiGDS.map(item => [item.name, item.value.toString()]),
        theme: 'grid',
        headStyles: { fillColor: [79, 70, 229], fontSize: 9, fontStyle: 'bold' },
        bodyStyles: { fontSize: 9 },
        margin: { left: margin, right: margin }
      });

      yPos = doc.lastAutoTable.finalY + 10;
    }

    // Distribusi PM vs PTM
    if (distribusiPMPTM.length > 0) {
      if (yPos > 250) {
        doc.addPage();
        yPos = 20;
      }

      doc.setFontSize(12);
      doc.setFont(undefined, 'bold');
      doc.text('DISTRIBUSI PENYAKIT MENULAR vs TIDAK MENULAR', margin, yPos);
      yPos += 6;

      doc.autoTable({
        startY: yPos,
        head: [['Kategori Penyakit', 'Jumlah Kasus']],
        body: distribusiPMPTM.map(item => [item.name, item.value.toString()]),
        theme: 'grid',
        headStyles: { fillColor: [79, 70, 229], fontSize: 9, fontStyle: 'bold' },
        bodyStyles: { fontSize: 9 },
        margin: { left: margin, right: margin }
      });

      yPos = doc.lastAutoTable.finalY + 10;
    }

    // Top 10 Diagnosis
    if (topDiagnosis.length > 0) {
      if (yPos > 240) {
        doc.addPage();
        yPos = 20;
      }

      doc.setFontSize(12);
      doc.setFont(undefined, 'bold');
      doc.text('TOP 10 DIAGNOSIS TERDETEKSI (ICD-10)', margin, yPos);
      yPos += 6;

      doc.autoTable({
        startY: yPos,
        head: [['No', 'Nama Diagnosis', 'Jumlah Kasus']],
        body: topDiagnosis.map((item, idx) => [
          (idx + 1).toString(),
          item.fullName,
          item.value.toString()
        ]),
        theme: 'grid',
        headStyles: { fillColor: [79, 70, 229], fontSize: 9, fontStyle: 'bold' },
        bodyStyles: { fontSize: 8 },
        margin: { left: margin, right: margin },
        columnStyles: {
          0: { cellWidth: 10 },
          1: { cellWidth: 130 },
          2: { cellWidth: 30 }
        }
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
    doc.text('DEMOGRAFI USIA PESERTA CKG', margin, yPos);
    yPos += 6;

    doc.autoTable({
      startY: yPos,
      head: [['Kelompok Usia', 'Jumlah Peserta']],
      body: demografiUsia.map(d => [d.name, d.Jumlah.toString()]),
      theme: 'grid',
      headStyles: { fillColor: [79, 70, 229], fontSize: 9, fontStyle: 'bold' },
      bodyStyles: { fontSize: 9 },
      margin: { left: margin, right: margin }
    });

    yPos = doc.lastAutoTable.finalY + 10;

    // Distribusi Tingkat Urgensi
    if (distribusiUrgensi.length > 0) {
      if (yPos > 250) {
        doc.addPage();
        yPos = 20;
      }

      doc.setFontSize(12);
      doc.setFont(undefined, 'bold');
      doc.text('DISTRIBUSI TINGKAT URGENSI', margin, yPos);
      yPos += 6;

      doc.autoTable({
        startY: yPos,
        head: [['Kategori Urgensi', 'Jumlah Pasien']],
        body: distribusiUrgensi.map(item => [item.name, item.value.toString()]),
        theme: 'grid',
        headStyles: { fillColor: [79, 70, 229], fontSize: 9, fontStyle: 'bold' },
        bodyStyles: { fontSize: 9 },
        margin: { left: margin, right: margin }
      });

      yPos = doc.lastAutoTable.finalY + 10;
    }

    // Distribusi Wilayah (Top 10)
    if (barWilayah.length > 0) {
      if (yPos > 230) {
        doc.addPage();
        yPos = 20;
      }

      doc.setFontSize(12);
      doc.setFont(undefined, 'bold');
      doc.text('DISTRIBUSI WILAYAH - TOP 10 KECAMATAN', margin, yPos);
      yPos += 6;

      doc.autoTable({
        startY: yPos,
        head: [['No', 'Nama Kecamatan', 'Jumlah Peserta CKG']],
        body: barWilayah.map((w, idx) => [
          (idx + 1).toString(),
          w.name,
          w.peserta.toString()
        ]),
        theme: 'grid',
        headStyles: { fillColor: [79, 70, 229], fontSize: 9, fontStyle: 'bold' },
        bodyStyles: { fontSize: 9 },
        margin: { left: margin, right: margin }
      });

      yPos = doc.lastAutoTable.finalY + 10;
    }

    // Informasi Penutup
    if (yPos > 240) {
      doc.addPage();
      yPos = 20;
    }

    doc.setFontSize(11);
    doc.setFont(undefined, 'bold');
    doc.text('DASAR HUKUM & ACUAN', margin, yPos);
    yPos += 6;

    doc.setFontSize(8);
    doc.setFont(undefined, 'normal');
    const infoLines = [
      '• KMK No. HK.01.07/MENKES/33/2025 — Juknis Pemeriksaan Kesehatan Gratis',
      '• Standar IMT Asia — Kemenkes RI (Kurus <18.5, Normal 18.5-24.9, Overweight 25-26.9, Obesitas ≥27)',
      '• ICD-10 — International Classification of Diseases (WHO)',
      '• Tekanan Darah: Normal <120/80, Pra-Hipertensi 120-139/80-89, Hipertensi ≥140/90, Krisis ≥180/120',
      '• GDS: Normal <140, TGT 140-199, Suspek DM ≥200, Hiperglikemia ≥300 mg/dL',
      '• PPK Kemenkes RI — Panduan Praktik Klinis untuk Faskes Primer'
    ];

    infoLines.forEach(line => {
      doc.text(line, margin, yPos);
      yPos += 5;
    });

    // Footer di setiap halaman
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
    doc.save(`Laporan_CKG_Statistik_${filterKecamatan}_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  // =========================================================================
  // CUSTOM TOOLTIP COMPONENT
  // =========================================================================
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white px-4 py-3 rounded-2xl shadow-xl border border-slate-100">
          <p className="text-xs font-black text-slate-800 mb-1">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-xs font-bold" style={{ color: entry.color || WARNA_PALET.indigo }}>
              {entry.name}: <span className="font-black">{entry.value}</span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // =========================================================================
  // RENDER UI
  // =========================================================================
  return (
    <div ref={reportRef} className="p-4 md:p-8 bg-[#F8FAFC] min-h-screen space-y-8">
      
      {/* ============================================================= */}
      {/* HEADER SECTION                                                */}
      {/* ============================================================= */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 print:hidden">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-gradient-to-br from-indigo-600 to-violet-600 p-3 rounded-2xl text-white shadow-lg shadow-indigo-200">
              <ClipboardList size={24} />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
                Statistik <span className="text-indigo-600">CKG</span>
              </h1>
              <p className="text-xs text-slate-400 font-semibold">
                Cek Kesehatan Gratis — Monitoring & Analisis Indikator Kesehatan Masyarakat
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <span className="bg-indigo-50 text-indigo-600 border border-indigo-100 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
              KMK No. HK.01.07/MENKES/33/2025
            </span>
            <span className="bg-slate-100 text-slate-500 px-3 py-1 rounded-full text-[10px] font-bold">
              Juknis CKG Kemenkes RI
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-3 bg-white p-2 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center px-3 gap-2 border-r border-slate-100">
            <Filter size={16} className="text-slate-400" />
            <select 
              className="bg-transparent text-sm font-bold text-slate-600 focus:outline-none cursor-pointer"
              value={filterKecamatan}
              onChange={(e) => setFilterKecamatan(e.target.value)}
            >
              <option value="Semua">Seluruh Wilayah</option>
              {daftarKecamatan.map(kec => <option key={kec} value={kec}>{kec}</option>)}
            </select>
          </div>
          
          <button onClick={refreshData} className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-100 transition-all font-bold text-sm">
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            Sinkron
          </button>

          <button 
            onClick={exportToPDF} 
            className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-all font-bold text-sm"
          >
            <FileText size={16} />
            Ekspor Laporan CKG
          </button>
        </div>
      </div>

      {/* ============================================================= */}
      {/* KPI CARDS — INDIKATOR CKG NASIONAL                           */}
      {/* ============================================================= */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <KPICard 
          title="Total Peserta CKG" 
          value={kpiCKG.total} 
          icon={<Users />} 
          color="indigo" 
          sub="Jumlah peserta terskrining"
        />
        <KPICard 
          title="Hipertensi" 
          value={kpiCKG.hipertensi} 
          icon={<HeartPulse />} 
          color="rose" 
          sub={`${kpiCKG.total > 0 ? ((kpiCKG.hipertensi / kpiCKG.total) * 100).toFixed(1) : 0}% prevalensi`}
        />
        <KPICard 
          title="Suspek DM" 
          value={kpiCKG.suspekDM} 
          icon={<Droplets />} 
          color="amber" 
          sub={`GDS ≥200 mg/dL`}
        />
        <KPICard 
          title="Obesitas" 
          value={kpiCKG.obesitas} 
          icon={<Scale />} 
          color="orange" 
          sub={`IMT ≥27 kg/m²`}
        />
        <KPICard 
          title="Gizi Kurang" 
          value={kpiCKG.giziKurang} 
          icon={<AlertTriangle />} 
          color="yellow" 
          sub={`IMT <18.5 kg/m²`}
        />
        <KPICard 
          title="Perlu Rujukan" 
          value={kpiCKG.rujukan} 
          icon={<ArrowUpRight />} 
          color="purple" 
          sub="Dirujuk ke faskes lanjut"
        />
      </div>

      {/* ============================================================= */}
      {/* ROW 1: TREN + KLASIFIKASI GIZI                               */}
      {/* ============================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* TREN KUNJUNGAN CKG (8 kolom) */}
        <div ref={chartSectionRef} className="lg:col-span-8 bg-white p-6 md:p-8 rounded-[2rem] border border-slate-200 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl border border-indigo-100">
                <TrendingUp size={18} />
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight">Tren Kunjungan CKG</h3>
                <p className="text-[11px] text-slate-400">Fluktuasi peserta CKG — {filterKecamatan}</p>
              </div>
            </div>
            
            {/* Toggle Dimensi Waktu */}
            <div className="flex bg-slate-100 p-1 rounded-xl self-start sm:self-center print:hidden">
              <button 
                onClick={() => setTimeDimension('Bulanan')}
                className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${timeDimension === 'Bulanan' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
              >
                Bulanan
              </button>
              <button 
                onClick={() => setTimeDimension('Tahunan')}
                className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${timeDimension === 'Tahunan' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
              >
                Tahunan
              </button>
            </div>
          </div>

          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData} margin={{ top: 10, right: 20, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{fill: '#94A3B8', fontSize: 11, fontWeight: 600}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94A3B8', fontSize: 11}} />
                <Tooltip content={<CustomTooltip />} />
                <Line 
                  type="monotone" 
                  dataKey="Peserta CKG" 
                  stroke={WARNA_PALET.indigo} 
                  strokeWidth={3}
                  dot={{ r: 5, strokeWidth: 2, fill: '#fff' }}
                  activeDot={{ r: 8, strokeWidth: 0 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* DISTRIBUSI STATUS GIZI (4 kolom) */}
        <div className="lg:col-span-4 bg-white p-6 md:p-8 rounded-[2rem] border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100">
              <Scale size={18} />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight">Status Gizi</h3>
              <p className="text-[11px] text-slate-400">IMT standar Asia (Kemenkes)</p>
            </div>
          </div>

          <div className="space-y-3">
            {distribusiGizi.map((item) => {
              const total = distribusiGizi.reduce((sum, g) => sum + g.value, 0);
              const persen = total > 0 ? ((item.value / total) * 100).toFixed(1) : 0;
              return (
                <div key={item.name} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-bold text-slate-600">
                    <span className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                      {item.name}
                    </span>
                    <span className="font-black text-slate-800">{item.value} <span className="text-slate-400 font-semibold">({persen}%)</span></span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${persen}%`, backgroundColor: item.color }}
                    />
                  </div>
                </div>
              );
            })}
            {distribusiGizi.every(d => d.value === 0) && (
              <p className="text-center text-xs text-slate-400 py-8 font-semibold">Belum ada data status gizi</p>
            )}
          </div>
        </div>
      </div>

      {/* ============================================================= */}
      {/* ROW 2: KLASIFIKASI TD + GDS + URGENSI                        */}
      {/* ============================================================= */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* KLASIFIKASI TEKANAN DARAH */}
        <DonutChartCard
          title="Tekanan Darah"
          subtitle="Klasifikasi TD populasi"
          icon={<HeartPulse size={18} />}
          iconBg="bg-rose-50 text-rose-600 border-rose-100"
          data={distribusiTD}
          centerValue={distribusiTD.reduce((s, d) => s + d.value, 0)}
          centerLabel="Terukur"
        />

        {/* KLASIFIKASI GULA DARAH SEWAKTU */}
        <DonutChartCard
          title="Gula Darah Sewaktu"
          subtitle="Klasifikasi GDS populasi"
          icon={<Droplets size={18} />}
          iconBg="bg-amber-50 text-amber-600 border-amber-100"
          data={distribusiGDS}
          centerValue={distribusiGDS.reduce((s, d) => s + d.value, 0)}
          centerLabel="Terukur"
        />

        {/* DISTRIBUSI TINGKAT URGENSI */}
        <DonutChartCard
          title="Tingkat Urgensi"
          subtitle="Kategorisasi kedaruratan"
          icon={<AlertTriangle size={18} />}
          iconBg="bg-amber-50 text-amber-600 border-amber-100"
          data={distribusiUrgensi}
          centerValue={filtered.length}
          centerLabel="Total"
        />
      </div>

      {/* ============================================================= */}
      {/* ROW 3: PM vs PTM + TOP 10 DIAGNOSIS                          */}
      {/* ============================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* DISTRIBUSI PM vs PTM (4 kolom) */}
        <div className="lg:col-span-4 bg-white p-6 md:p-8 rounded-[2rem] border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 bg-violet-50 text-violet-600 rounded-xl border border-violet-100">
              <Stethoscope size={18} />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight">PM vs PTM</h3>
              <p className="text-[11px] text-slate-400">Peny. Menular vs Tidak Menular</p>
            </div>
          </div>

          <div className="h-[200px] relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={distribusiPMPTM} innerRadius={60} outerRadius={85} paddingAngle={5} dataKey="value" stroke="none">
                  {distribusiPMPTM.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-black text-slate-800">{filtered.length}</span>
              <span className="text-[9px] font-bold text-slate-400 uppercase">Total Kasus</span>
            </div>
          </div>

          <div className="space-y-2 mt-4 border-t border-slate-100 pt-4">
            {distribusiPMPTM.map((item) => (
              <div key={item.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="font-bold text-slate-600">{item.name}</span>
                </div>
                <span className="font-black text-slate-900">{item.value}</span>
              </div>
            ))}
            {distribusiPMPTM.length === 0 && (
              <p className="text-center text-xs text-slate-400 py-4 font-semibold">Belum ada data diagnosis</p>
            )}
          </div>
        </div>

        {/* TOP 10 DIAGNOSIS TERDETEKSI (8 kolom) */}
        <div className="lg:col-span-8 bg-white p-6 md:p-8 rounded-[2rem] border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-sky-50 text-sky-600 rounded-xl border border-sky-100">
                <Pill size={18} />
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight">Top 10 Diagnosis CKG</h3>
                <p className="text-[11px] text-slate-400">Penyakit yang paling banyak terdeteksi</p>
              </div>
            </div>
            <span className="bg-slate-100 text-slate-500 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
              ICD-10
            </span>
          </div>
          <div className="h-[320px]">
            {topDiagnosis.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topDiagnosis} layout="vertical" margin={{ left: 10, right: 20 }}>
                  <XAxis type="number" hide />
                  <YAxis 
                    dataKey="name" 
                    type="category" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fill: '#64748B', fontSize: 10, fontWeight: 700}} 
                    width={200}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="value" radius={[0, 8, 8, 0]} barSize={18}>
                    {topDiagnosis.map((entry, index) => {
                      const colors = ['#4F46E5', '#6366F1', '#818CF8', '#A5B4FC', '#C7D2FE', '#4F46E5', '#6366F1', '#818CF8', '#A5B4FC', '#C7D2FE'];
                      return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />;
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400 font-bold">
                Belum ada data diagnosis dari CKG
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ============================================================= */}
      {/* ROW 4: DEMOGRAFI USIA + DISTRIBUSI WILAYAH                    */}
      {/* ============================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* DEMOGRAFI USIA PESERTA CKG */}
        <div className="bg-white p-6 md:p-8 rounded-[2rem] border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 bg-cyan-50 text-cyan-600 rounded-xl border border-cyan-100">
              <UserCheck size={18} />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight">Demografi Usia</h3>
              <p className="text-[11px] text-slate-400">Kelompok usia sesuai Juknis CKG</p>
            </div>
          </div>
          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={demografiUsia} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94A3B8', fontSize: 10, fontWeight: 600}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94A3B8', fontSize: 11}} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="Jumlah" radius={[8, 8, 0, 0]} maxBarSize={50}>
                  {demografiUsia.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          
          {/* Legend usia */}
          <div className="flex flex-wrap gap-3 mt-4 border-t border-slate-100 pt-4 justify-center">
            {demografiUsia.map((d) => (
              <div key={d.name} className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: d.color }} />
                {d.name}: <span className="font-black text-slate-800">{d.Jumlah}</span>
              </div>
            ))}
          </div>
        </div>

        {/* DISTRIBUSI WILAYAH (TOP 10 KECAMATAN) */}
        <div className="bg-white p-6 md:p-8 rounded-[2rem] border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-teal-50 text-teal-600 rounded-xl border border-teal-100">
                <Activity size={18} />
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight">Sebaran Wilayah</h3>
                <p className="text-[11px] text-slate-400">Distribusi peserta CKG per kecamatan</p>
              </div>
            </div>
            <span className="bg-slate-100 text-slate-500 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">Top 10</span>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barWilayah} layout="vertical" margin={{ left: 20, right: 20 }}>
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fill: '#64748B', fontSize: 11, fontWeight: 700}} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="peserta" fill={WARNA_PALET.teal} radius={[0, 10, 10, 0]} barSize={18} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ============================================================= */}
      {/* PANEL INFORMASI CKG                                           */}
      {/* ============================================================= */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-6 md:p-8 rounded-[2rem] text-white shadow-xl shadow-slate-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Info Acuan */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Shield size={16} className="text-indigo-400" />
              <h4 className="text-sm font-bold text-white">Dasar Hukum & Acuan</h4>
            </div>
            <ul className="space-y-2 text-xs text-slate-300 leading-relaxed">
              <li>• <strong className="text-indigo-300">KMK No. HK.01.07/MENKES/33/2025</strong> — Juknis Pemeriksaan Kesehatan Gratis</li>
              <li>• <strong className="text-indigo-300">Standar IMT Asia</strong> — Kemenkes RI (Kurus &lt;18.5, Normal 18.5-24.9, Overweight 25-26.9, Obesitas ≥27)</li>
              <li>• <strong className="text-indigo-300">ICD-10</strong> — International Classification of Diseases (WHO)</li>
              <li>• <strong className="text-indigo-300">PPK Kemenkes RI</strong> — Panduan Praktik Klinis untuk Faskes Primer</li>
            </ul>
          </div>

          {/* Info Indikator */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Thermometer size={16} className="text-emerald-400" />
              <h4 className="text-sm font-bold text-white">Indikator Pemeriksaan</h4>
            </div>
            <ul className="space-y-2 text-xs text-slate-300 leading-relaxed">
              <li>• <strong className="text-emerald-300">Tekanan Darah</strong> — Normal &lt;120/80, Pra-Hipertensi 120-139/80-89, Hipertensi ≥140/90, Krisis ≥180/120</li>
              <li>• <strong className="text-emerald-300">GDS</strong> — Normal &lt;140, TGT 140-199, Suspek DM ≥200, Hiperglikemia ≥300 mg/dL</li>
              <li>• <strong className="text-emerald-300">Algoritma</strong> — Forward Chaining + Certainty Factor untuk diagnosis otomatis</li>
            </ul>
          </div>

          {/* Info Cakupan */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Calendar size={16} className="text-amber-400" />
              <h4 className="text-sm font-bold text-white">Cakupan Analisis</h4>
            </div>
            <ul className="space-y-2 text-xs text-slate-300 leading-relaxed">
              <li>• <strong className="text-amber-300">Bulanan</strong> — Agregasi peserta CKG per bulan pada tahun berjalan ({new Date().getFullYear()})</li>
              <li>• <strong className="text-amber-300">Tahunan</strong> — Perbandingan 5 tahun terakhir ({new Date().getFullYear() - 4}–{new Date().getFullYear()})</li>
              <li>• <strong className="text-amber-300">Wilayah</strong> — Filter per kecamatan (15 kecamatan Kab. Madiun)</li>
              <li>• <strong className="text-amber-300">Sumber Data</strong> — Integrasi langsung dari modul CKG Gratis & DataPasien</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

// =============================================================================
// HELPER COMPONENTS
// =============================================================================

// --- KPI CARD ---
const KPICard = ({ title, value, icon, color, sub }) => {
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
          {React.cloneElement(icon, { size: 20 })}
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

// --- DONUT CHART CARD (Reusable) ---
const DonutChartCard = ({ title, subtitle, icon, iconBg, data, centerValue, centerLabel }) => {
  return (
    <div className="bg-white p-6 md:p-8 rounded-[2rem] border border-slate-200 shadow-sm">
      <div className="flex items-center gap-3 mb-4">
        <div className={`p-2.5 rounded-xl border ${iconBg}`}>
          {icon}
        </div>
        <div>
          <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight">{title}</h3>
          <p className="text-[11px] text-slate-400">{subtitle}</p>
        </div>
      </div>

      <div className="h-[180px] relative">
        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={data} innerRadius={55} outerRadius={75} paddingAngle={5} dataKey="value" stroke="none">
                {data.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center text-xs text-slate-400 font-semibold">
            Belum ada data terukur
          </div>
        )}
        {data.length > 0 && (
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-2xl font-black text-slate-800">{centerValue}</span>
            <span className="text-[9px] font-bold text-slate-400 uppercase">{centerLabel}</span>
          </div>
        )}
      </div>

      <div className="space-y-2 mt-3 border-t border-slate-100 pt-3">
        {data.map((item) => (
          <div key={item.name} className="flex items-center justify-between text-[11px]">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
              <span className="font-bold text-slate-600">{item.name}</span>
            </div>
            <span className="font-black text-slate-900">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Statistik;
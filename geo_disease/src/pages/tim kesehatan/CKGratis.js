import React, { useState, useMemo } from 'react';
import axios from 'axios';
import API_BASE_URL from '../../config/api';
import { 
  ClipboardList, FileText, Stethoscope, Dna, BarChart3, 
  MapPin, Pill, Book, Link2, Brain, User, Save, RotateCcw,
  Lightbulb, Microscope, Circle, Heart, Droplet, Scale, Zap
} from 'lucide-react';

// =============================================================================
// KNOWLEDGE BASE — SISTEM PAKAR FORWARD CHAINING + CERTAINTY FACTOR
// Referensi: WHO Guidelines, Standar PPK Kemenkes RI, ICD-10
// Nilai CF (Certainty Factor) Pakar: Berdasarkan literatur klinis
// =============================================================================
const KNOWLEDGE_BASE = [
  // ======================== PENYAKIT MENULAR (PM) ========================
  {
    id: 'R1',
    kode: 'PM-01',
    nama_penyakit: 'Suspek Dengue Hemorrhagic Fever (DBD)',
    icd10: 'A91',
    kategori: 'Penyakit Menular',
    gejala_required: ['demam_tinggi', 'nyeri_sendi_otot', 'ruam_bintik_merah'],
    cf_pakar: 0.85,
    urgensi: 'Waspada',
    rekomendasi: 'Lakukan pemeriksaan Darah Lengkap (Cek Hb, Ht, Trombosit). Berikan edukasi tanda-tanda syok (lemas, kaki tangan dingin). Hindari obat golongan NSAID (Ibuprofen/Aspirin) karena memicu perdarahan. Berikan Parasetamol 500mg (3x1) jika demam.',
    edukasi: 'Pastikan asupan cairan minimal 2 liter/hari. Gunakan kelambu dan lotion anti nyamuk. Lakukan 3M Plus (Menguras, Menutup, Mengubur). Kontrol kembali dalam 24-48 jam untuk cek trombosit ulang.'
  },
  {
    id: 'R2',
    kode: 'PM-02',
    nama_penyakit: 'Suspek Dengue Shock Syndrome (DSS)',
    icd10: 'A91',
    kategori: 'Penyakit Menular',
    gejala_required: ['demam_tinggi', 'nyeri_sendi_otot', 'mimisan_gusi_berdarah', 'lemas_kesadaran_menurun'],
    cf_pakar: 0.92,
    urgensi: 'Gawat Darurat',
    rekomendasi: 'EMERGENCY: Terindikasi Dengue Shock Syndrome (DSS) / Perdarahan Aktif. Pasang Jalur Intravena (Infus RL/Asetring 7ml/kgBB/jam) dan SEGERA RUJUK ke Instalasi Gawat Darurat (IGD).',
    edukasi: 'Kondisi ini mengancam jiwa. Segera bawa ke IGD RS terdekat. Jangan berikan obat minum karena risiko aspirasi. Posisikan pasien terlentang dengan kaki ditinggikan 15-30 derajat (posisi syok).'
  },
  {
    id: 'R3',
    kode: 'PM-03',
    nama_penyakit: 'Suspek Pneumonia / ISPA Berat',
    icd10: 'J18.9',
    kategori: 'Penyakit Menular',
    gejala_required: ['batuk_berdahak', 'sesak_napas_wheezing', 'demam_tinggi'],
    cf_pakar: 0.80,
    urgensi: 'Gawat Darurat',
    rekomendasi: 'EMERGENCY: Gagal Napas Akut. Berikan Oksigenasi suplemen 2-4 Lpm via Nasal Cannula, posisikan pasien Semi-Fowler (setengah duduk), dan RUJUK segera ke Rumah Sakit.',
    edukasi: 'Hindari paparan asap rokok dan polusi udara. Jaga kebersihan tangan. Pastikan ventilasi ruangan baik. Lanjutkan antibiotik sesuai resep dokter hingga habis.'
  },
  {
    id: 'R4',
    kode: 'PM-04',
    nama_penyakit: 'Suspek ISPA Ringan-Sedang (Bronkitis Akut)',
    icd10: 'J20.9',
    kategori: 'Penyakit Menular',
    gejala_required: ['batuk_kering', 'sesak_napas_wheezing'],
    cf_pakar: 0.70,
    urgensi: 'Waspada',
    rekomendasi: 'Rujuk ke faskes terdekat untuk auskultasi paru. Pertimbangkan pemberian Bronkodilator (Nebulizer) dan Mukolitik. Berikan Parasetamol jika demam.',
    edukasi: 'Istirahat yang cukup, minum air hangat, hindari udara dingin dan berdebu. Gunakan masker saat beraktivitas di luar. Jika sesak memberat, segera ke IGD.'
  },
  {
    id: 'R5',
    kode: 'PM-05',
    nama_penyakit: 'Gastroenteritis Akut (GEA) dengan Dehidrasi Berat',
    icd10: 'A09',
    kategori: 'Penyakit Menular',
    gejala_required: ['diare_cair_massif', 'mual_muntah_hebat', 'lemas_kesadaran_menurun'],
    cf_pakar: 0.88,
    urgensi: 'Gawat Darurat',
    rekomendasi: 'EMERGENCY: Dehidrasi Berat menuju Syok Hipovolemik. Rehidrasi agresif cairan intravena (Infus RL 30 ml/kg dalam 30 menit pertama), jangan tunda rujukan.',
    edukasi: 'Kondisi dehidrasi berat sangat berbahaya. Segera bawa ke RS. Jangan berikan minuman bersoda atau jus buah. Setelah stabil, lanjutkan Oralit dan Zinc 20mg/hari selama 10 hari.'
  },
  {
    id: 'R6',
    kode: 'PM-06',
    nama_penyakit: 'Gastroenteritis Akut (GEA) Dehidrasi Ringan-Sedang',
    icd10: 'A09',
    kategori: 'Penyakit Menular',
    gejala_required: ['diare_cair_massif', 'mual_muntah_hebat'],
    cf_pakar: 0.75,
    urgensi: 'Waspada',
    rekomendasi: 'Dehidrasi Ringan-Sedang (WHO Rencana B). Berikan Oralit 75 ml/kgBB dalam 3 jam pertama di posko lapangan. Berikan Zinc 20mg per hari selama 10 hari.',
    edukasi: 'Cuci tangan pakai sabun sebelum makan dan sesudah BAB. Masak air minum hingga mendidih. Hindari jajanan sembarangan. Makan makanan lunak, hindari makanan berminyak.'
  },
  {
    id: 'R7',
    kode: 'PM-07',
    nama_penyakit: 'Suspek Demam Tifoid (Typhoid Fever)',
    icd10: 'A01.0',
    kategori: 'Penyakit Menular',
    gejala_required: ['demam_subfebris', 'durasi_demam_lebih_3hari', 'mual_muntah_hebat'],
    cf_pakar: 0.72,
    urgensi: 'Waspada',
    rekomendasi: 'Edukasi bed rest (istirahat total) dan diet makanan lunak rendah serat (bubur). Rujuk untuk pemeriksaan penunjang (Uji Widal atau Tubex TF). Berikan Parasetamol untuk demam.',
    edukasi: 'Istirahat total di tempat tidur. Makan makanan lunak (bubur, nasi tim). Hindari makanan pedas, asam, dan bersantan. Minum air putih yang banyak. Cuci tangan sebelum makan.'
  },
  {
    id: 'R8',
    kode: 'PM-08',
    nama_penyakit: 'Suspek Demam Tifoid Berat',
    icd10: 'A01.0',
    kategori: 'Penyakit Menular',
    gejala_required: ['demam_subfebris', 'durasi_demam_lebih_3hari', 'lemas_kesadaran_menurun', 'mual_muntah_hebat'],
    cf_pakar: 0.82,
    urgensi: 'Gawat Darurat',
    rekomendasi: 'WARNING: Suspek komplikasi tifoid (perforasi usus / ensefalopati tifoid). Pasang infus RL maintenance, pantau tanda peritonitis (nyeri perut difus), dan RUJUK SEGERA.',
    edukasi: 'Kondisi ini memerlukan perawatan intensif di rumah sakit. Jangan berikan makanan per oral tanpa instruksi dokter. Pantau kesadaran pasien secara berkala.'
  },

  // ==================== PENYAKIT TIDAK MENULAR (PTM) ====================
  {
    id: 'R9',
    kode: 'PTM-01',
    nama_penyakit: 'Krisis Hipertensi',
    icd10: 'I16.9',
    kategori: 'Penyakit Tidak Menular',
    gejala_required: ['tekanan_darah_krisis'],
    cf_pakar: 0.95,
    urgensi: 'Gawat Darurat',
    rekomendasi: 'EMERGENCY: Tekanan darah ≥180/120 mmHg berisiko stroke/kerusakan organ. Tenangkan pasien, tempatkan di ruang tenang, dan SEGERA RUJUK ke IGD faskes terdekat.',
    edukasi: 'Hindari aktivitas berat dan stress. Minum obat antihipertensi secara rutin. Diet rendah garam. Kontrol tekanan darah setiap hari. Segera ke IGD jika sakit kepala hebat atau pandangan kabur.'
  },
  {
    id: 'R10',
    kode: 'PTM-02',
    nama_penyakit: 'Hipertensi Esensial (Primary Hypertension)',
    icd10: 'I10',
    kategori: 'Penyakit Tidak Menular',
    gejala_required: ['tekanan_darah_tinggi'],
    cf_pakar: 0.80,
    urgensi: 'Waspada',
    rekomendasi: 'Tekanan darah terukur ≥140/90 mmHg. Edukasi diet rendah garam (DASH diet), kurangi stress, hindari rokok, dan rujuk ke Puskesmas/Dokter Keluarga untuk evaluasi terapi antihipertensi jangka panjang.',
    edukasi: 'Kurangi konsumsi garam (maks 1 sendok teh/hari). Perbanyak sayur dan buah. Olahraga teratur 30 menit/hari. Hindari rokok dan alkohol. Kontrol tekanan darah secara rutin setiap bulan.'
  },
  {
    id: 'R11',
    kode: 'PTM-03',
    nama_penyakit: 'Suspek Hiperglikemia Berat / Krisis Diabetes',
    icd10: 'E14.0',
    kategori: 'Penyakit Tidak Menular',
    gejala_required: ['gula_darah_krisis', 'lemas_kesadaran_menurun'],
    cf_pakar: 0.90,
    urgensi: 'Gawat Darurat',
    rekomendasi: 'EMERGENCY: Risiko Ketoasidosis Diabetikum (KAD) atau HHS. Pasang jalur cairan infus Normal Saline, pantau kesadaran, dan SEGERA RUJUK ke Rumah Sakit.',
    edukasi: 'Kondisi ini mengancam jiwa. Selalu bawa obat diabetes dan camilan manis untuk keadaan darurat. Periksa gula darah secara rutin. Jangan melewatkan jadwal makan.'
  },
  {
    id: 'R12',
    kode: 'PTM-04',
    nama_penyakit: 'Suspek Diabetes Mellitus',
    icd10: 'E14.9',
    kategori: 'Penyakit Tidak Menular',
    gejala_required: ['gula_darah_tinggi'],
    cf_pakar: 0.78,
    urgensi: 'Waspada',
    rekomendasi: 'Gula darah sewaktu ≥200 mg/dL mengindikasikan diabetes. Rujuk pasien ke faskes untuk pemeriksaan konfirmasi (Gula Darah Puasa / HbA1c) dan konseling nutrisi.',
    edukasi: 'Kurangi makanan dan minuman manis. Perbanyak sayuran hijau. Olahraga teratur minimal 150 menit/minggu. Periksa gula darah rutin. Kontrol ke dokter setiap 3 bulan.'
  },
  {
    id: 'R13',
    kode: 'PTM-05',
    nama_penyakit: 'Obesitas (Gizi Lebih)',
    icd10: 'E66.9',
    kategori: 'Penyakit Tidak Menular',
    gejala_required: ['imt_obesitas'],
    cf_pakar: 0.90,
    urgensi: 'Perlu Perhatian',
    rekomendasi: 'IMT ≥27 kg/m² (kategori Obesitas menurut standar Asia). Rujuk ke ahli gizi untuk program diet terstruktur dan evaluasi risiko sindrom metabolik.',
    edukasi: 'Kurangi porsi makan secara bertahap. Hindari makanan cepat saji dan minuman manis. Olahraga minimal 30 menit/hari (jalan kaki, bersepeda). Target penurunan BB: 0.5-1 kg/minggu.'
  },
  {
    id: 'R14',
    kode: 'PTM-06',
    nama_penyakit: 'Gizi Kurang (Underweight)',
    icd10: 'E46',
    kategori: 'Penyakit Tidak Menular',
    gejala_required: ['imt_kurus'],
    cf_pakar: 0.85,
    urgensi: 'Perlu Perhatian',
    rekomendasi: 'IMT <18.5 kg/m² (kategori Gizi Kurang). Evaluasi penyebab (gangguan makan, infeksi kronis, TB, dll). Rujuk ke Puskesmas untuk konseling gizi dan pemeriksaan lanjutan.',
    edukasi: 'Tingkatkan porsi makan secara bertahap. Konsumsi makanan tinggi protein (telur, ikan, daging, tempe, tahu). Makan 3x sehari + 2 camilan sehat. Periksa ke dokter jika BB terus turun.'
  }
];

// Label gejala yang user-friendly untuk tampilan UI
const LABEL_GEJALA = {
  demam_tinggi: 'Demam Tinggi (≥38.5°C)',
  demam_subfebris: 'Demam Ringan / Subfebris (37.5–38.5°C)',
  durasi_demam_lebih_3hari: 'Durasi Demam > 3 Hari',
  batuk_kering: 'Batuk Kering (Non-Produktif)',
  batuk_berdahak: 'Batuk Berdahak (Produktif)',
  sesak_napas_wheezing: 'Sesak Napas / Wheezing',
  nyeri_sendi_otot: 'Nyeri Sendi & Otot (Myalgia/Arthralgia)',
  ruam_bintik_merah: 'Ruam / Bintik Merah di Kulit (Petechiae)',
  mimisan_gusi_berdarah: 'Mimisan / Gusi Berdarah (Perdarahan)',
  diare_cair_massif: 'Diare Cair Masif (>3x/hari)',
  mual_muntah_hebat: 'Mual & Muntah Hebat',
  lemas_kesadaran_menurun: 'Lemas Berat / Kesadaran Menurun'
};

// =============================================================================
// FORWARD CHAINING ENGINE — Mesin Inferensi Runut Maju
// Menelusuri knowledge base, mencocokkan fakta dengan kondisi IF pada setiap rule
// =============================================================================
const forwardChaining = (faktaGejala, faktaPTM) => {
  const semuaFakta = { ...faktaGejala, ...faktaPTM };
  const firedRules = [];

  for (const rule of KNOWLEDGE_BASE) {
    const gejalaCocok = rule.gejala_required.every(g => semuaFakta[g] === true);

    if (gejalaCocok) {
      const jumlahGejalaUser = Object.values(faktaGejala).filter(v => v === true).length;
      const jumlahGejalaRule = rule.gejala_required.filter(g => !g.startsWith('tekanan_') && !g.startsWith('gula_') && !g.startsWith('imt_')).length;

      // CF User = proporsi gejala yang cocok terhadap total gejala yang diinput
      const cf_user = jumlahGejalaUser > 0
        ? Math.min(1, jumlahGejalaRule / Math.max(jumlahGejalaUser, jumlahGejalaRule))
        : 1;

      firedRules.push({
        ...rule,
        cf_user: parseFloat(cf_user.toFixed(2)),
        cf_final: parseFloat((rule.cf_pakar * cf_user).toFixed(2))
      });
    }
  }

  // Sort by CF final (tertinggi dulu), lalu by urgensi
  const urgensiOrder = { 'Gawat Darurat': 3, 'Waspada': 2, 'Perlu Perhatian': 1, 'Normal': 0 };
  firedRules.sort((a, b) => {
    const urgDiff = (urgensiOrder[b.urgensi] || 0) - (urgensiOrder[a.urgensi] || 0);
    if (urgDiff !== 0) return urgDiff;
    return b.cf_final - a.cf_final;
  });

  return firedRules;
};

// =============================================================================
// CERTAINTY FACTOR COMBINER — Menghitung CF Gabungan (Multiple Rules)
// Rumus: CF_combine(CF1, CF2) = CF1 + CF2 × (1 - CF1)
// =============================================================================
const combineCF = (cfValues) => {
  if (cfValues.length === 0) return 0;
  if (cfValues.length === 1) return cfValues[0];

  let cfCombined = cfValues[0];
  for (let i = 1; i < cfValues.length; i++) {
    cfCombined = cfCombined + cfValues[i] * (1 - cfCombined);
  }
  return parseFloat(cfCombined.toFixed(4));
};

// =============================================================================
// KOMPONEN UTAMA — CKG GRATIS (Cek Kesehatan Gratis)
// Alur Pelayanan 5 Tahap sesuai Juknis Kemenkes RI
// KMK No. HK.01.07/MENKES/33/2025
// =============================================================================
const CKGratis = ({ userName, daftarKecamatan, refreshData, addLog }) => {

  // --- STEP WIZARD (5 TAHAP SESUAI JUKNIS KEMENKES) ---
  const [step, setStep] = useState(1);

  // --- STEP 1: REGISTRASI ---
  const [registrasi, setRegistrasi] = useState({
    nomor_registrasi: `CKG-${Date.now().toString(36).toUpperCase()}`,
    nama: '',
    nik: '',
    nomor_hp: '',
    umur: '',
    jenis_kelamin: '',
    gol_darah: '',
    wilayah_id: '',
    alamat: '',
    latitude: '',
    longitude: ''
  });

  // --- STEP 2: SKRINING MANDIRI ---
  const [skrining, setSkrining] = useState({
    // Riwayat Penyakit Keluarga
    riwayat_dm: false,
    riwayat_hipertensi: false,
    riwayat_jantung: false,
    riwayat_kanker: false,
    riwayat_stroke: false,
    // Gaya Hidup
    merokok: false,
    konsumsi_alkohol: false,
    kurang_olahraga: false,
    pola_makan_tidak_sehat: false,
    // Riwayat Penyakit Pribadi
    riwayat_pribadi: ''
  });

  // --- STEP 3: PEMERIKSAAN FISIK ---
  const [pemeriksaan, setPemeriksaan] = useState({
    tinggi: '',
    berat: '',
    sistole: '',
    diastole: '',
    gula_darah: ''
  });

  // --- STEP 4: ANAMNESA (GEJALA KLINIS) ---
  const [gejala, setGejala] = useState({
    demam_tinggi: false,
    demam_subfebris: false,
    durasi_demam_lebih_3hari: false,
    batuk_kering: false,
    batuk_berdahak: false,
    sesak_napas_wheezing: false,
    nyeri_sendi_otot: false,
    ruam_bintik_merah: false,
    mimisan_gusi_berdarah: false,
    diare_cair_massif: false,
    mual_muntah_hebat: false,
    lemas_kesadaran_menurun: false
  });

  // --- STATE HASIL DIAGNOSIS ---
  const [hasilDiagnosis, setHasilDiagnosis] = useState(null);
  const [loading, setLoading] = useState(false);

  // === KELOMPOK USIA OTOMATIS (Sesuai Juknis CKG) ===
  const kelompokUsia = useMemo(() => {
    const umur = parseInt(registrasi.umur) || 0;
    if (umur < 1) return 'Bayi Baru Lahir';
    if (umur >= 1 && umur <= 6) return 'Balita/Prasekolah';
    if (umur >= 7 && umur <= 17) return 'Anak/Remaja';
    if (umur >= 18 && umur <= 59) return 'Dewasa';
    if (umur >= 60) return 'Lanjut Usia (Lansia)';
    return '-';
  }, [registrasi.umur]);

  // === KALKULATOR IMT ===
  const hitungIMT = useMemo(() => {
    const t = parseFloat(pemeriksaan.tinggi) / 100;
    const b = parseFloat(pemeriksaan.berat);
    if (!t || !b || t <= 0) return { score: 0, status: '-', kategori: '-' };
    const imt = b / (t * t);
    let status = 'Normal (Gizi Baik)';
    let kategori = 'normal';
    if (imt < 18.5) { status = 'Kurus (Gizi Kurang)'; kategori = 'kurus'; }
    else if (imt >= 18.5 && imt < 25) { status = 'Normal (Gizi Baik)'; kategori = 'normal'; }
    else if (imt >= 25 && imt < 27) { status = 'Overweight (Kelebihan BB)'; kategori = 'overweight'; }
    else if (imt >= 27) { status = 'Obesitas (Gizi Lebih)'; kategori = 'obesitas'; }
    return { score: imt.toFixed(1), status, kategori };
  }, [pemeriksaan.tinggi, pemeriksaan.berat]);

  // === KLASIFIKASI TEKANAN DARAH ===
  const klasifikasiTD = useMemo(() => {
    const SBP = parseInt(pemeriksaan.sistole) || 0;
    const DBP = parseInt(pemeriksaan.diastole) || 0;
    if (SBP === 0 && DBP === 0) return { label: '-', kelas: 'belum-diisi' };
    if (SBP >= 180 || DBP >= 120) return { label: 'Krisis Hipertensi', kelas: 'darurat' };
    if (SBP >= 140 || DBP >= 90) return { label: 'Hipertensi', kelas: 'tinggi' };
    if (SBP >= 120 || DBP >= 80) return { label: 'Pra-Hipertensi', kelas: 'waspada' };
    return { label: 'Normal', kelas: 'normal' };
  }, [pemeriksaan.sistole, pemeriksaan.diastole]);

  // === KLASIFIKASI GULA DARAH ===
  const klasifikasiGDS = useMemo(() => {
    const GDS = parseInt(pemeriksaan.gula_darah) || 0;
    if (GDS === 0) return { label: '-', kelas: 'belum-diisi' };
    if (GDS >= 300) return { label: 'Hiperglikemia Berat', kelas: 'darurat' };
    if (GDS >= 200) return { label: 'Suspek DM', kelas: 'tinggi' };
    if (GDS >= 140) return { label: 'Toleransi Glukosa Terganggu', kelas: 'waspada' };
    return { label: 'Normal', kelas: 'normal' };
  }, [pemeriksaan.gula_darah]);

  // === HANDLERS ===
  const handleRegistrasiChange = (e) => {
    const { name, value } = e.target;
    setRegistrasi(prev => ({ ...prev, [name]: value }));
  };

  const handleSkriningChange = (e) => {
    const { name, type, checked, value } = e.target;
    setSkrining(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handlePemeriksaanChange = (e) => {
    const { name, value } = e.target;
    setPemeriksaan(prev => ({ ...prev, [name]: value }));
  };

  const handleGejalaChange = (e) => {
    const { name, checked } = e.target;
    setGejala(prev => ({ ...prev, [name]: checked }));
  };

  // === GPS HANDLER ===
  const dapatkanLokasiGPS = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setRegistrasi(prev => ({
            ...prev,
            latitude: position.coords.latitude.toFixed(6),
            longitude: position.coords.longitude.toFixed(6)
          }));
          alert("✅ Koordinat GPS Berhasil Didapatkan!");
        },
        () => alert("❌ Gagal mendapatkan lokasi. Aktifkan izin GPS di browser Anda.")
      );
    } else {
      alert("Browser tidak mendukung Geolocation.");
    }
  };

  // =====================================================================
  // PROSES DIAGNOSIS — FORWARD CHAINING + CERTAINTY FACTOR
  // =====================================================================
  const prosesForwardChaining = (e) => {
    e.preventDefault();

    const SBP = parseInt(pemeriksaan.sistole) || 0;
    const DBP = parseInt(pemeriksaan.diastole) || 0;
    const GDS = parseInt(pemeriksaan.gula_darah) || 0;
    const imtData = hitungIMT;

    // Konversi fakta PTM menjadi boolean flags
    const faktaPTM = {
      tekanan_darah_krisis: SBP >= 180 || DBP >= 120,
      tekanan_darah_tinggi: (SBP >= 140 || DBP >= 90) && !(SBP >= 180 || DBP >= 120),
      gula_darah_krisis: GDS >= 300,
      gula_darah_tinggi: GDS >= 200 && GDS < 300,
      imt_obesitas: imtData.kategori === 'obesitas',
      imt_kurus: imtData.kategori === 'kurus'
    };

    // Jalankan Forward Chaining
    const firedRules = forwardChaining(gejala, faktaPTM);

    // Hitung CF Gabungan jika ada multiple rules
    const allCFValues = firedRules.map(r => r.cf_final);
    const cfGabungan = combineCF(allCFValues);

    // Tentukan diagnosis utama (rule dengan CF final tertinggi)
    const diagnosisUtama = firedRules.length > 0
      ? firedRules[0]
      : {
          nama_penyakit: 'Tidak Ditemukan Penyakit Spesifik',
          icd10: 'Z00.0',
          urgensi: 'Normal',
          rekomendasi: 'Berdasarkan hasil pemeriksaan dan anamnesa, tidak ditemukan tanda-tanda penyakit spesifik. Tetap jaga pola hidup sehat, minum air putih minimal 2 liter/hari, dan lakukan pemeriksaan kesehatan berkala.',
          edukasi: 'Lanjutkan pola hidup sehat. Konsumsi sayur dan buah setiap hari. Olahraga teratur minimal 30 menit/hari. Kelola stress dengan baik. Periksa kesehatan rutin setiap tahun.',
          kategori: 'Preventif',
          cf_final: 0,
          cf_pakar: 0,
          cf_user: 0,
          kode: 'SEHAT'
        };

    // Bangun trace penalaran (untuk transparansi akademis)
    const tracePenalaran = firedRules.map((rule, idx) => ({
      langkah: idx + 1,
      rule_id: rule.id,
      rule_kode: rule.kode,
      kondisi_if: rule.gejala_required.map(g => LABEL_GEJALA[g] || g.replace(/_/g, ' ')).join(' AND '),
      kesimpulan_then: rule.nama_penyakit,
      cf_pakar: rule.cf_pakar,
      cf_user: rule.cf_user,
      cf_final: rule.cf_final,
      perhitungan: `CF(H,E) = CF_pakar × CF_user = ${rule.cf_pakar} × ${rule.cf_user} = ${rule.cf_final}`
    }));

    setHasilDiagnosis({
      timestamp: new Date().toLocaleString('id-ID'),
      pasien: registrasi.nama,
      kelompok_usia: kelompokUsia,
      diagnosis_utama: diagnosisUtama,
      semua_fired_rules: firedRules,
      cf_gabungan: cfGabungan,
      cf_persen: (cfGabungan * 100).toFixed(1),
      trace: tracePenalaran,
      data_pemeriksaan: {
        td: `${pemeriksaan.sistole || '-'}/${pemeriksaan.diastole || '-'} mmHg`,
        klasifikasi_td: klasifikasiTD.label,
        gds: `${pemeriksaan.gula_darah || '-'} mg/dL`,
        klasifikasi_gds: klasifikasiGDS.label,
        imt: `${imtData.score} kg/m²`,
        status_gizi: imtData.status
      },
      jumlah_rules_terpicu: firedRules.length,
      algoritma: 'Forward Chaining + Certainty Factor'
    });

    setStep(5);
  };

  // === MAPPING GAMBAR PENYAKIT STANDAR INDONESIA ===
  const getGambarPenyakit = (namaPenyakit, icd10) => {
    const imageMap = {
      'Suspek Dengue Hemorrhagic Fever (DBD)': 'https://images.unsplash.com/photo-1576091160550-112173f7f869?w=400&h=300&fit=crop',
      'Suspek Dengue Shock Syndrome (DSS)': 'https://images.unsplash.com/photo-1576091160550-112173f7f869?w=400&h=300&fit=crop',
      'Suspek Pneumonia / ISPA Berat': 'https://images.unsplash.com/photo-1631217314831-1acbf57514c0?w=400&h=300&fit=crop',
      'Suspek ISPA Ringan-Sedang (Bronkitis Akut)': 'https://images.unsplash.com/photo-1631217314831-1acbf57514c0?w=400&h=300&fit=crop',
      'Gastroenteritis Akut (GEA) dengan Dehidrasi Berat': 'https://images.unsplash.com/photo-1576091160596-112173f7f869?w=400&h=300&fit=crop',
      'Gastroenteritis Akut (GEA) Dehidrasi Ringan-Sedang': 'https://images.unsplash.com/photo-1576091160596-112173f7f869?w=400&h=300&fit=crop',
      'Suspek Demam Tifoid (Typhoid Fever)': 'https://images.unsplash.com/photo-1584308666744-24d5f400f6f1?w=400&h=300&fit=crop',
      'Suspek Demam Tifoid Berat': 'https://images.unsplash.com/photo-1584308666744-24d5f400f6f1?w=400&h=300&fit=crop',
      'Krisis Hipertensi': 'https://images.unsplash.com/photo-1576091160506-112173f7f869?w=400&h=300&fit=crop',
      'Hipertensi Esensial (Primary Hypertension)': 'https://images.unsplash.com/photo-1576091160506-112173f7f869?w=400&h=300&fit=crop',
      'Suspek Hiperglikemia Berat / Krisis Diabetes': 'https://images.unsplash.com/photo-1576091160626-112173f7f869?w=400&h=300&fit=crop',
      'Suspek Diabetes Mellitus': 'https://images.unsplash.com/photo-1576091160626-112173f7f869?w=400&h=300&fit=crop',
      'Obesitas (Gizi Lebih)': 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&h=300&fit=crop',
      'Gizi Kurang (Underweight)': 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&h=300&fit=crop'
    };
    return imageMap[namaPenyakit] || '';
  };

  // === MAPPING LINK ARTIKEL REFERENSI STANDAR ===
  const getLinkArtikel = (icd10) => {
    const linkMap = {
      'A91': 'https://www.who.int/news-room/fact-sheets/detail/dengue-and-severe-dengue',
      'J18.9': 'https://www.cdc.gov/pneumonia/',
      'J20.9': 'https://www.cdc.gov/antibiotic-use/community/outpatient-care/URIs.html',
      'A09': 'https://www.who.int/news-room/fact-sheets/detail/diarrhoeal-disease',
      'A01.0': 'https://www.cdc.gov/typhoid-fever/about.html',
      'I16.9': 'https://www.heart.org/hypertension',
      'I10': 'https://www.heart.org/hypertension',
      'E14.0': 'https://www.cdc.gov/diabetes/manage/index.html',
      'E14.9': 'https://www.cdc.gov/diabetes/basics/index.html',
      'E66.9': 'https://www.cdc.gov/obesity/data/index.html',
      'E46': 'https://www.who.int/news-room/fact-sheets/detail/malnutrition'
    };
    return linkMap[icd10] || '';
  };

  // === SIMPAN KE DATABASE + AUTO-ADD KE KATALOG DIAGNOSA ===
  const simpanKeDatabase = async () => {
    if (!hasilDiagnosis) return;

    try {
      setLoading(true);
      
      // 1. SIMPAN DATA PASIEN
      const payload = {
        nama: registrasi.nama,
        nik: registrasi.nik,
        nomor_hp: registrasi.nomor_hp,
        umur: parseInt(registrasi.umur) || 0,
        jenis_kelamin: registrasi.jenis_kelamin,
        gol_darah: registrasi.gol_darah,
        wilayah_id: registrasi.wilayah_id,
        alamat: registrasi.alamat,
        latitude: parseFloat(registrasi.latitude) || -7.6167,
        longitude: parseFloat(registrasi.longitude) || 111.5000,
        penyakit_id: `${hasilDiagnosis.diagnosis_utama.nama_penyakit} [ICD-10: ${hasilDiagnosis.diagnosis_utama.icd10}]`,
        status: hasilDiagnosis.diagnosis_utama.urgensi === "Gawat Darurat" ? "Rujukan" : "Perawatan",
        tekanan_darah: `${pemeriksaan.sistole}/${pemeriksaan.diastole}`,
        gula_darah: parseInt(pemeriksaan.gula_darah) || 0,
        imt_skor: parseFloat(hitungIMT.score),
        status_gizi: hitungIMT.status,
        tinggi: parseInt(pemeriksaan.tinggi) || 0,
        berat: parseInt(pemeriksaan.berat) || 0,
      };

      const response = await axios.post(`${API_BASE_URL}/api/pasien`, payload);

      if (response.status === 201 || response.data) {
        
        // 2. AUTO-ADD PENYAKIT KE KATALOG DIAGNOSA (DENGAN SEMUA FIELD LENGKAP)
        try {
          const diagnosisUtama = hasilDiagnosis.diagnosis_utama;
          
          // MAPPING LENGKAP SESUAI FORMAT KATALOG DIAGNOSA
          const payloadPenyakit = {
            nama: diagnosisUtama.nama_penyakit,
            kategori: diagnosisUtama.kategori || 'Penyakit Menular',
            kode_icd: diagnosisUtama.icd10 || 'Z00.0',
            tingkat_urgensi: diagnosisUtama.urgensi === 'Gawat Darurat' ? 'Tinggi' : 
                             diagnosisUtama.urgensi === 'Waspada' ? 'Sedang' : 'Normal',
            tindakan_medis: diagnosisUtama.rekomendasi,
            deskripsi: `📋 DIAGNOSIS: ${diagnosisUtama.nama_penyakit} (ICD-10: ${diagnosisUtama.icd10})\n\n` +
                      `🔍 TINGKAT URGENSI: ${diagnosisUtama.urgensi}\n\n` +
                      `💊 PROTOKOL MEDIS:\n${diagnosisUtama.rekomendasi}\n\n` +
                      `📚 EDUKASI PASIEN:\n${diagnosisUtama.edukasi}\n\n` +
                      `⚡ CERTAINTY FACTOR: ${hasilDiagnosis.cf_persen}%\n` +
                      `📅 TERDETEKSI: ${hasilDiagnosis.timestamp}\n` +
                      `👨‍⚕️ SUMBER: Forward Chaining + Certainty Factor`,
            gambarUrl: getGambarPenyakit(diagnosisUtama.nama_penyakit, diagnosisUtama.icd10),
            linkArtikel: getLinkArtikel(diagnosisUtama.icd10),
            last_updated_by: userName || 'Tim CKG'
          };

          await axios.post(`${API_BASE_URL}/api/penyakit`, payloadPenyakit);
          console.log('✅ Penyakit berhasil ditambahkan ke Katalog Diagnosa dengan data lengkap');
        } catch (errorPenyakit) {
          // Jika gagal (mungkin sudah ada), coba update
          console.log('ℹ️ Penyakit mungkin sudah ada, silahkan refresh halaman Katalog Diagnosa');
        }

        alert(`✅ DATA PASIEN TERSIMPAN\n\nNama: ${registrasi.nama}\nDiagnosis: ${hasilDiagnosis.diagnosis_utama.nama_penyakit}\n\n📋 Penyakit otomatis ditambahkan ke Katalog Diagnosa dengan format lengkap!\n\nSilahkan buka menu Katalog Diagnosa untuk melihat hasilnya.`);
        
        if (addLog) {
          addLog("CKG Forward Chaining", `${registrasi.nama} → ${hasilDiagnosis.diagnosis_utama.nama_penyakit} (CF: ${hasilDiagnosis.cf_persen}%) - Data auto-sync ke Katalog`);
        }
        if (refreshData) refreshData();
        resetForm();
      }
    } catch (error) {
      console.error(error);
      alert("❌ Gagal menyimpan data ke database server!");
    } finally {
      setLoading(false);
    }
  };

  // === RESET FORM ===
  const resetForm = () => {
    setRegistrasi({
      nomor_registrasi: `CKG-${Date.now().toString(36).toUpperCase()}`,
      nama: '', nik: '', nomor_hp: '', umur: '', jenis_kelamin: '',
      gol_darah: '', wilayah_id: '', alamat: '', latitude: '', longitude: ''
    });
    setSkrining({
      riwayat_dm: false, riwayat_hipertensi: false, riwayat_jantung: false,
      riwayat_kanker: false, riwayat_stroke: false, merokok: false,
      konsumsi_alkohol: false, kurang_olahraga: false, pola_makan_tidak_sehat: false,
      riwayat_pribadi: ''
    });
    setPemeriksaan({ tinggi: '', berat: '', sistole: '', diastole: '', gula_darah: '' });
    setGejala({
      demam_tinggi: false, demam_subfebris: false, durasi_demam_lebih_3hari: false,
      batuk_kering: false, batuk_berdahak: false, sesak_napas_wheezing: false,
      nyeri_sendi_otot: false, ruam_bintik_merah: false, mimisan_gusi_berdarah: false,
      diare_cair_massif: false, mual_muntah_hebat: false, lemas_kesadaran_menurun: false
    });
    setHasilDiagnosis(null);
    setStep(1);
  };

  // === VALIDASI STEP ===
  const validateStep = (currentStep) => {
    if (currentStep === 1) {
      if (!registrasi.nama || !registrasi.umur || !registrasi.jenis_kelamin || !registrasi.wilayah_id) {
        alert('⚠️ Nama, Umur, Jenis Kelamin, dan Kecamatan wajib diisi!');
        return false;
      }
      return true;
    }
    if (currentStep === 2) return true; // skrining opsional
    if (currentStep === 3) return true; // pemeriksaan opsional (mungkin tidak ada alat)
    return true;
  };

  const goToStep = (targetStep) => {
    if (targetStep > step && !validateStep(step)) return;
    setStep(targetStep);
  };

  // =============================================================================
  // STYLES
  // =============================================================================
  const styles = {
    inputBase: "w-full px-4 py-2.5 rounded-xl border border-slate-200 outline-none text-sm font-medium focus:border-[#4f46e5] focus:ring-2 focus:ring-indigo-100 transition-all",
    labelBase: "text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1",
    sectionTitle: "text-sm font-bold text-[#0f172a] mb-4 flex items-center tracking-tight",
    cardBase: "bg-white p-6 md:p-8 rounded-3xl border border-slate-100 shadow-sm",
    btnPrimary: "bg-[#4f46e5] hover:bg-[#4338ca] text-white font-bold px-5 py-2.5 rounded-xl text-xs transition-all shadow-md shadow-indigo-100",
    btnOutline: "border border-slate-200 text-slate-600 font-bold px-4 py-2 rounded-xl text-xs bg-white hover:bg-slate-50 transition-all",
    btnDark: "w-full bg-[#0f172a] hover:bg-[#1e293b] text-white py-3 rounded-xl font-bold transition-all text-xs tracking-wider uppercase shadow-md disabled:bg-slate-300",
    checkboxCard: (active) => `flex items-start p-3.5 rounded-xl border transition-all cursor-pointer ${active ? 'border-[#4f46e5] bg-indigo-50/50 shadow-sm shadow-indigo-100' : 'border-slate-200 bg-white hover:border-slate-300'}`,
  };

  // =============================================================================
  // RENDER — UI COMPONENT
  // =============================================================================
  return (
    <div className="space-y-6">

      {/* ========== BANNER HEADER ========== */}
      <div className="bg-gradient-to-r from-[#0f172a] via-[#1e293b] to-[#312e81] p-6 rounded-3xl text-white shadow-lg border border-slate-800">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <span className="bg-[#4f46e5]/30 text-[#a5b4fc] border border-[#4f46e5]/40 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider">
              🩺 Petugas: {userName || "Tim Kesehatan"}
            </span>
            <h1 className="text-2xl font-extrabold mt-2 tracking-tight text-white">
              Cek Kesehatan Gratis (CKG)
            </h1>
            <p className="text-slate-400 text-xs mt-1 max-w-2xl leading-relaxed">
              Sistem Skrining & Diagnosis berbasis <span className="text-[#a5b4fc] font-semibold">Forward Chaining + Certainty Factor</span>.
              Sesuai KMK No. HK.01.07/MENKES/33/2025 — Juknis Pemeriksaan Kesehatan Gratis.
            </p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-center min-w-[160px]">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">No. Registrasi</span>
            <span className="text-sm font-mono font-bold text-[#a5b4fc] mt-0.5 block">{registrasi.nomor_registrasi}</span>
          </div>
        </div>
      </div>

      {/* ========== WIZARD STEP INDICATOR ========== */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
        <div className="flex items-center justify-between max-w-3xl mx-auto">
          {[
            { num: 1, label: 'Registrasi', icon: <ClipboardList size={16} /> },
            { num: 2, label: 'Skrining', icon: <FileText size={16} /> },
            { num: 3, label: 'Pemeriksaan', icon: <Stethoscope size={16} /> },
            { num: 4, label: 'Anamnesa', icon: <Dna size={16} /> },
            { num: 5, label: 'Hasil', icon: <BarChart3 size={16} /> }
          ].map((s, idx, arr) => (
            <React.Fragment key={s.num}>
              <button
                onClick={() => goToStep(s.num)}
                className={`flex flex-col items-center gap-1 transition-all ${
                  step === s.num
                    ? 'scale-105'
                    : step > s.num
                      ? 'opacity-80'
                      : 'opacity-40'
                }`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold transition-all ${
                  step === s.num
                    ? 'bg-[#4f46e5] text-white shadow-md shadow-indigo-200'
                    : step > s.num
                      ? 'bg-emerald-100 text-emerald-600'
                      : 'bg-slate-100 text-slate-400'
                }`}>
                  {step > s.num ? '✓' : s.icon}
                </div>
                <span className={`text-[10px] font-bold tracking-wider ${
                  step === s.num ? 'text-[#4f46e5]' : 'text-slate-400'
                }`}>
                  {s.label}
                </span>
              </button>
              {idx < arr.length - 1 && (
                <div className={`flex-1 h-0.5 mx-2 rounded ${step > s.num ? 'bg-emerald-200' : 'bg-slate-100'}`} />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* ================================================================ */}
      {/* STEP 1: REGISTRASI PASIEN                                       */}
      {/* ================================================================ */}
      {step === 1 && (
        <div className={styles.cardBase + " space-y-8"}>
          <div>
            <h2 className={styles.sectionTitle}>
              <span className="bg-indigo-50 text-[#4f46e5] p-1.5 rounded-lg mr-2 text-xs"><ClipboardList size={14} /></span>
              Tahap 1 — Registrasi & Identitas Pasien
            </h2>
            <p className="text-xs text-slate-400 -mt-2 mb-5">Data demografi sesuai standar registrasi CKG Kemenkes RI</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* Nomor Registrasi (auto) */}
              <div className="space-y-1">
                <label className={styles.labelBase}>No. Registrasi CKG</label>
                <input type="text" value={registrasi.nomor_registrasi} readOnly
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-100 text-sm font-mono font-bold text-[#4f46e5]" />
              </div>

              {/* Nama */}
              <div className="space-y-1">
                <label className={styles.labelBase}>Nama Lengkap *</label>
                <input type="text" name="nama" required value={registrasi.nama} onChange={handleRegistrasiChange}
                  className={styles.inputBase} placeholder="Nama sesuai KTP" />
              </div>

              {/* NIK */}
              <div className="space-y-1">
                <label className={styles.labelBase}>NIK (No. Induk Kependudukan)</label>
                <input type="text" name="nik" value={registrasi.nik} onChange={handleRegistrasiChange}
                  className={styles.inputBase} placeholder="16 digit NIK" maxLength={16} />
              </div>

              {/* Umur */}
              <div className="space-y-1">
                <label className={styles.labelBase}>Umur (Tahun) *</label>
                <input type="number" name="umur" required value={registrasi.umur} onChange={handleRegistrasiChange}
                  className={styles.inputBase} placeholder="Misal: 35" min="0" max="120" />
              </div>

              {/* Kelompok Usia (auto) */}
              <div className="space-y-1">
                <label className={styles.labelBase}>Kelompok Usia (Otomatis)</label>
                <div className="px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-100 text-sm font-bold text-[#0f172a]">
                  {kelompokUsia}
                </div>
              </div>

              {/* Jenis Kelamin */}
              <div className="space-y-1">
                <label className={styles.labelBase}>Jenis Kelamin *</label>
                <select name="jenis_kelamin" required value={registrasi.jenis_kelamin} onChange={handleRegistrasiChange}
                  className={styles.inputBase + " bg-white"}>
                  <option value="" disabled hidden>Pilih</option>
                  <option value="Laki-laki">Laki-laki</option>
                  <option value="Perempuan">Perempuan</option>
                </select>
              </div>

              {/* Golongan Darah */}
              <div className="space-y-1">
                <label className={styles.labelBase}>Golongan Darah</label>
                <select name="gol_darah" value={registrasi.gol_darah} onChange={handleRegistrasiChange}
                  className={styles.inputBase + " bg-white"}>
                  <option value="" disabled hidden>Pilih</option>
                  <option value="A">A</option>
                  <option value="B">B</option>
                  <option value="AB">AB</option>
                  <option value="O">O</option>
                </select>
              </div>

              {/* Nomor HP */}
              <div className="space-y-1">
                <label className={styles.labelBase}>Nomor HP</label>
                <input type="text" name="nomor_hp" value={registrasi.nomor_hp} onChange={handleRegistrasiChange}
                  className={styles.inputBase} placeholder="08xxxxxxxxxx" />
              </div>

              {/* Kecamatan */}
              <div className="space-y-1">
                <label className={styles.labelBase}>Kecamatan Domisili *</label>
                <select name="wilayah_id" required value={registrasi.wilayah_id} onChange={handleRegistrasiChange}
                  className={styles.inputBase + " bg-white"}>
                  <option value="" disabled hidden>Pilih Kecamatan</option>
                  {daftarKecamatan?.map((k) => <option key={k} value={k}>{k}</option>)}
                </select>
              </div>

              {/* Geotagging */}
              <div className="space-y-1 md:col-span-2">
                <label className={styles.labelBase + " flex justify-between"}>
                  <span>Geotagging Posisi (Koordinat)</span>
                  <button type="button" onClick={dapatkanLokasiGPS} className="text-[#4f46e5] font-bold hover:underline normal-case flex items-center gap-1"><MapPin size={14} /> Ambil GPS Live</button>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input type="text" name="latitude" placeholder="Latitude" value={registrasi.latitude} readOnly
                    className="px-4 py-2 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-500 font-mono" />
                  <input type="text" name="longitude" placeholder="Longitude" value={registrasi.longitude} readOnly
                    className="px-4 py-2 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-500 font-mono" />
                </div>
              </div>

              {/* Alamat */}
              <div className="space-y-1 md:col-span-3">
                <label className={styles.labelBase}>Alamat Rumah Lengkap</label>
                <textarea name="alamat" rows="2" value={registrasi.alamat} onChange={handleRegistrasiChange}
                  className={styles.inputBase} placeholder="RT/RW, Jalan, Dusun..." />
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button type="button" onClick={() => goToStep(2)} className={styles.btnPrimary}>
              Lanjut ke Skrining Mandiri ➜
            </button>
          </div>
        </div>
      )}

      {/* ================================================================ */}
      {/* STEP 2: SKRINING MANDIRI                                        */}
      {/* ================================================================ */}
      {step === 2 && (
        <div className={styles.cardBase + " space-y-8"}>
          {/* Riwayat Penyakit Keluarga */}
          <div>
            <h2 className={styles.sectionTitle}>
              <span className="bg-rose-50 text-rose-500 p-1.5 rounded-lg mr-2 text-xs"><Stethoscope size={14} /></span>
              Tahap 2 — Skrining Mandiri & Riwayat Penyakit
            </h2>
            <p className="text-xs text-slate-400 -mt-2 mb-5">Kuesioner skrining awal sesuai kelompok usia: <span className="font-bold text-[#4f46e5]">{kelompokUsia}</span></p>

            <h3 className="text-xs font-bold text-slate-500 mb-3 uppercase tracking-wider">Riwayat Penyakit Keluarga</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
              {[
                { key: 'riwayat_dm', label: 'Diabetes Mellitus (Kencing Manis)' },
                { key: 'riwayat_hipertensi', label: 'Hipertensi (Darah Tinggi)' },
                { key: 'riwayat_jantung', label: 'Penyakit Jantung' },
                { key: 'riwayat_kanker', label: 'Kanker' },
                { key: 'riwayat_stroke', label: 'Stroke' }
              ].map(item => (
                <label key={item.key} className={styles.checkboxCard(skrining[item.key])}>
                  <input type="checkbox" name={item.key} checked={skrining[item.key]} onChange={handleSkriningChange}
                    className="mt-0.5 w-4 h-4 text-[#4f46e5] border-slate-300 rounded focus:ring-[#4f46e5]" />
                  <span className="ml-3 text-xs text-slate-700">{item.label}</span>
                </label>
              ))}
            </div>

            {/* Faktor Risiko / Gaya Hidup */}
            <h3 className="text-xs font-bold text-slate-500 mb-3 uppercase tracking-wider">Faktor Risiko & Gaya Hidup</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
              {[
                { key: 'merokok', label: 'Merokok aktif / pernah merokok' },
                { key: 'konsumsi_alkohol', label: 'Mengonsumsi alkohol' },
                { key: 'kurang_olahraga', label: 'Kurang aktivitas fisik / olahraga (<150 menit/minggu)' },
                { key: 'pola_makan_tidak_sehat', label: 'Pola makan tidak sehat (tinggi garam, gula, lemak)' }
              ].map(item => (
                <label key={item.key} className={styles.checkboxCard(skrining[item.key])}>
                  <input type="checkbox" name={item.key} checked={skrining[item.key]} onChange={handleSkriningChange}
                    className="mt-0.5 w-4 h-4 text-[#4f46e5] border-slate-300 rounded focus:ring-[#4f46e5]" />
                  <span className="ml-3 text-xs text-slate-700">{item.label}</span>
                </label>
              ))}
            </div>

            {/* Riwayat Penyakit Pribadi */}
            <h3 className="text-xs font-bold text-slate-500 mb-3 uppercase tracking-wider">Riwayat Penyakit Pribadi</h3>
            <textarea name="riwayat_pribadi" rows="3" value={skrining.riwayat_pribadi} onChange={handleSkriningChange}
              className={styles.inputBase} placeholder="Contoh: Pernah dirawat karena DBD tahun 2023, Asma sejak kecil, dll..." />
          </div>

          <div className="flex justify-between">
            <button type="button" onClick={() => setStep(1)} className={styles.btnOutline}>⬅ Kembali</button>
            <button type="button" onClick={() => goToStep(3)} className={styles.btnPrimary}>Lanjut ke Pemeriksaan Fisik ➜</button>
          </div>
        </div>
      )}

      {/* ================================================================ */}
      {/* STEP 3: PEMERIKSAAN FISIK (VITAL SIGN + ANTROPOMETRI)           */}
      {/* ================================================================ */}
      {step === 3 && (
        <div className={styles.cardBase + " space-y-8"}>
          <div>
            <h2 className={styles.sectionTitle}>
              <span className="bg-emerald-50 text-emerald-600 p-1.5 rounded-lg mr-2 text-xs">🩺</span>
              Tahap 3 — Pemeriksaan Fisik & Vital Sign
            </h2>
            <p className="text-xs text-slate-400 -mt-2 mb-5">Hasil pengukuran oleh petugas kesehatan di posko CKG</p>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
              {/* Tinggi Badan */}
              <div className="space-y-1">
                <label className={styles.labelBase}>Tinggi Badan (cm)</label>
                <input type="number" name="tinggi" value={pemeriksaan.tinggi} onChange={handlePemeriksaanChange}
                  className={styles.inputBase} placeholder="Misal: 165" />
              </div>

              {/* Berat Badan */}
              <div className="space-y-1">
                <label className={styles.labelBase}>Berat Badan (kg)</label>
                <input type="number" name="berat" value={pemeriksaan.berat} onChange={handlePemeriksaanChange}
                  className={styles.inputBase} placeholder="Misal: 60" />
              </div>

              {/* Status Gizi / IMT (Otomatis) */}
              <div className="md:col-span-2">
                <label className={styles.labelBase}>Hasil Status Gizi — IMT (Otomatis)</label>
                <div className={`p-3.5 rounded-xl border flex items-center gap-3 ${
                  hitungIMT.kategori === 'obesitas' ? 'bg-red-50 border-red-200' :
                  hitungIMT.kategori === 'kurus' ? 'bg-amber-50 border-amber-200' :
                  hitungIMT.kategori === 'overweight' ? 'bg-yellow-50 border-yellow-200' :
                  hitungIMT.score > 0 ? 'bg-emerald-50 border-emerald-200' : 'bg-slate-50 border-slate-100'
                }`}>
                  <span className="text-2xl">
                    {hitungIMT.kategori === 'obesitas' ? <Circle size={14} className="fill-rose-500 text-rose-500" /> :
                     hitungIMT.kategori === 'kurus' ? <Circle size={14} className="fill-orange-500 text-orange-500" /> :
                     hitungIMT.kategori === 'overweight' ? <Circle size={14} className="fill-amber-500 text-amber-500" /> :
                     hitungIMT.score > 0 ? <Circle size={14} className="fill-emerald-500 text-emerald-500" /> : <Circle size={14} className="fill-slate-300 text-slate-300" />}
                  </span>
                  <div>
                    <span className="text-sm font-extrabold text-[#0f172a] block">
                      {hitungIMT.score > 0 ? `${hitungIMT.score} kg/m²` : 'Menunggu input TB & BB...'}
                    </span>
                    {hitungIMT.score > 0 && (
                      <span className="text-[11px] font-medium text-slate-500">{hitungIMT.status}</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Sistole */}
              <div className="space-y-1">
                <label className={styles.labelBase}>Sistole (mmHg)</label>
                <input type="number" name="sistole" placeholder="Misal: 120" value={pemeriksaan.sistole} onChange={handlePemeriksaanChange}
                  className={styles.inputBase} />
              </div>

              {/* Diastole */}
              <div className="space-y-1">
                <label className={styles.labelBase}>Diastole (mmHg)</label>
                <input type="number" name="diastole" placeholder="Misal: 80" value={pemeriksaan.diastole} onChange={handlePemeriksaanChange}
                  className={styles.inputBase} />
              </div>

              {/* Klasifikasi TD (Otomatis) */}
              <div className="space-y-1">
                <label className={styles.labelBase}>Klasifikasi TD</label>
                <div className={`px-4 py-2.5 rounded-xl border text-sm font-bold ${
                  klasifikasiTD.kelas === 'darurat' ? 'bg-red-50 border-red-200 text-red-700' :
                  klasifikasiTD.kelas === 'tinggi' ? 'bg-amber-50 border-amber-200 text-amber-700' :
                  klasifikasiTD.kelas === 'waspada' ? 'bg-yellow-50 border-yellow-200 text-yellow-700' :
                  klasifikasiTD.kelas === 'normal' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' :
                  'bg-slate-50 border-slate-100 text-slate-400'
                }`}>
                  {klasifikasiTD.label}
                </div>
              </div>

              {/* Gula Darah Sewaktu */}
              <div className="space-y-1">
                <label className={styles.labelBase}>Gula Darah Sewaktu (mg/dL)</label>
                <input type="number" name="gula_darah" placeholder="Misal: 110" value={pemeriksaan.gula_darah} onChange={handlePemeriksaanChange}
                  className={styles.inputBase} />
              </div>

              {/* Klasifikasi GDS (Otomatis) - full row */}
              <div className="space-y-1 md:col-span-2">
                <label className={styles.labelBase}>Klasifikasi GDS</label>
                <div className={`px-4 py-2.5 rounded-xl border text-sm font-bold ${
                  klasifikasiGDS.kelas === 'darurat' ? 'bg-red-50 border-red-200 text-red-700' :
                  klasifikasiGDS.kelas === 'tinggi' ? 'bg-amber-50 border-amber-200 text-amber-700' :
                  klasifikasiGDS.kelas === 'waspada' ? 'bg-yellow-50 border-yellow-200 text-yellow-700' :
                  klasifikasiGDS.kelas === 'normal' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' :
                  'bg-slate-50 border-slate-100 text-slate-400'
                }`}>
                  {klasifikasiGDS.label}
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-between">
            <button type="button" onClick={() => setStep(2)} className={styles.btnOutline}>⬅ Kembali</button>
            <button type="button" onClick={() => goToStep(4)} className={styles.btnPrimary}>Lanjut ke Anamnesa ➜</button>
          </div>
        </div>
      )}

      {/* ================================================================ */}
      {/* STEP 4: ANAMNESA — CHECKLIST GEJALA + JALANKAN FORWARD CHAINING  */}
      {/* ================================================================ */}
      {step === 4 && (
        <div className={styles.cardBase}>
          <form onSubmit={prosesForwardChaining} className="space-y-6">
            <div>
              <h2 className={styles.sectionTitle}>
                <span className="bg-amber-50 text-amber-600 p-1.5 rounded-lg mr-2 text-xs"><Dna size={14} /></span>
                Tahap 4 — Anamnesa Pasien (Indikator Gejala Klinis)
              </h2>
              <p className="text-xs text-slate-400 -mt-2 mb-5">
                Centang gejala yang dialami pasien. Sistem akan menjalankan <span className="font-bold text-[#4f46e5]">Forward Chaining</span> untuk mencocokkan gejala dengan <span className="font-bold text-[#4f46e5]">Knowledge Base</span> ({KNOWLEDGE_BASE.length} rules).
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {Object.keys(gejala).map((key) => (
                <label key={key} className={styles.checkboxCard(gejala[key])}>
                  <input type="checkbox" name={key} checked={gejala[key]} onChange={handleGejalaChange}
                    className="mt-0.5 w-4 h-4 text-[#4f46e5] border-slate-300 rounded focus:ring-[#4f46e5]" />
                  <div className="ml-3">
                    <span className="text-xs font-semibold text-slate-700 block">{LABEL_GEJALA[key]}</span>
                  </div>
                </label>
              ))}
            </div>

            {/* Info box */}
            <div className="bg-indigo-50/50 border border-indigo-100 rounded-2xl p-4">
              <div className="flex items-start gap-3">
                <span className="text-lg"><Lightbulb size={18} className="text-amber-500" /></span>
                <div>
                  <h4 className="text-xs font-bold text-[#4f46e5] mb-1">Algoritma yang Digunakan</h4>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    <strong>Forward Chaining (Runut Maju)</strong> — Sistem menelusuri {KNOWLEDGE_BASE.length} aturan (rules) dalam Knowledge Base
                    dan mencocokkan fakta/gejala yang diinput dengan kondisi IF pada setiap rule. Rule yang terpenuhi akan "fired" dan menghasilkan
                    kesimpulan diagnosis. <br />
                    <strong>Certainty Factor (CF)</strong> — Menghitung tingkat keyakinan diagnosis dengan rumus:
                    <code className="bg-white px-1.5 py-0.5 rounded text-[#4f46e5] font-mono mx-1">CF(H,E) = CF_pakar × CF_user</code>
                    dan kombinasi:
                    <code className="bg-white px-1.5 py-0.5 rounded text-[#4f46e5] font-mono mx-1">CF_combine = CF1 + CF2 × (1 - CF1)</code>
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-between">
              <button type="button" onClick={() => setStep(3)} className={styles.btnOutline}>⬅ Kembali</button>
              <button type="submit" className={styles.btnPrimary + " flex items-center gap-2"}>
                <span className="mr-2"><Microscope size={16} /></span> Jalankan Forward Chaining + Certainty Factor
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ================================================================ */}
      {/* STEP 5: HASIL DIAGNOSIS — EDUKASI & TINDAK LANJUT               */}
      {/* ================================================================ */}
      {step === 5 && hasilDiagnosis && (
        <div className="space-y-6">

          {/* Header Hasil */}
          <div className={`p-6 rounded-3xl border-2 ${
            hasilDiagnosis.diagnosis_utama.urgensi === 'Gawat Darurat'
              ? 'bg-red-50 border-red-300'
              : hasilDiagnosis.diagnosis_utama.urgensi === 'Waspada'
                ? 'bg-amber-50 border-amber-300'
                : 'bg-emerald-50 border-emerald-300'
          }`}>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <span className={`text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full ${
                  hasilDiagnosis.diagnosis_utama.urgensi === 'Gawat Darurat'
                    ? 'bg-red-200 text-red-800'
                    : hasilDiagnosis.diagnosis_utama.urgensi === 'Waspada'
                      ? 'bg-amber-200 text-amber-800'
                      : 'bg-emerald-200 text-emerald-800'
                }`}>
                  ⚡ Tingkat Urgensi: {hasilDiagnosis.diagnosis_utama.urgensi}
                </span>
                <h2 className="text-xl font-extrabold text-[#0f172a] mt-2">{hasilDiagnosis.diagnosis_utama.nama_penyakit}</h2>
                <p className="text-xs text-slate-500 mt-1">
                  ICD-10: <span className="font-bold text-[#4f46e5]">{hasilDiagnosis.diagnosis_utama.icd10}</span>
                  {' '} • Pasien: <span className="font-bold">{hasilDiagnosis.pasien}</span>
                  {' '} • {hasilDiagnosis.timestamp}
                </p>
              </div>
              <div className="text-center bg-white rounded-2xl px-6 py-4 border border-slate-200 shadow-sm">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Certainty Factor</span>
                <span className={`text-3xl font-extrabold block mt-1 ${
                  parseFloat(hasilDiagnosis.cf_persen) >= 80 ? 'text-emerald-600' :
                  parseFloat(hasilDiagnosis.cf_persen) >= 50 ? 'text-amber-600' : 'text-red-600'
                }`}>
                  {hasilDiagnosis.cf_persen}%
                </span>
                <span className="text-[10px] text-slate-400">Tingkat Keyakinan</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Kolom Kiri: Detail Diagnosis + Rekomendasi + Edukasi */}
            <div className="lg:col-span-2 space-y-6">

              {/* Rekomendasi Tindakan */}
              <div className={styles.cardBase}>
                <h3 className="text-xs font-bold text-[#0f172a] mb-3 uppercase tracking-wider flex items-center gap-2">
                  <span className="bg-blue-50 text-blue-600 p-1 rounded-lg text-xs"><Pill size={14} /></span>
                  Rencana Terapi & Rekomendasi Tindakan
                </h3>
                <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-4">
                  <p className="text-sm font-medium text-slate-700 leading-relaxed">{hasilDiagnosis.diagnosis_utama.rekomendasi}</p>
                </div>
              </div>

              {/* Edukasi Pasien */}
              <div className={styles.cardBase}>
                <h3 className="text-xs font-bold text-[#0f172a] mb-3 uppercase tracking-wider flex items-center gap-2">
                  <span className="bg-emerald-50 text-emerald-600 p-1 rounded-lg text-xs"><Book size={14} /></span>
                  Edukasi Kesehatan untuk Pasien
                </h3>
                <div className="bg-emerald-50/50 border border-emerald-100 rounded-xl p-4">
                  <p className="text-sm font-medium text-slate-700 leading-relaxed">
                    {hasilDiagnosis.diagnosis_utama.edukasi || 'Lanjutkan pola hidup sehat dan periksa kesehatan secara berkala.'}
                  </p>
                </div>
              </div>

              {/* Trace Penalaran Forward Chaining */}
              <div className={styles.cardBase}>
                <h3 className="text-xs font-bold text-[#0f172a] mb-3 uppercase tracking-wider flex items-center gap-2">
                  <span className="bg-purple-50 text-purple-600 p-1 rounded-lg text-xs"><Link2 size={14} /></span>
                  Trace Penalaran Forward Chaining ({hasilDiagnosis.jumlah_rules_terpicu} Rule Terpicu)
                </h3>
                {hasilDiagnosis.trace.length === 0 ? (
                  <div className="bg-slate-50 border border-dashed border-slate-200 rounded-xl p-6 text-center">
                    <p className="text-xs text-slate-400">Tidak ada rule yang terpicu dari gejala yang diinput. Hasil: Sehat / Observasi.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {hasilDiagnosis.trace.map((t, idx) => (
                      <div key={idx} className="bg-slate-50 border border-slate-100 rounded-xl p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] font-bold text-[#4f46e5] bg-indigo-50 px-2 py-0.5 rounded-full">
                            {t.rule_id} ({t.rule_kode})
                          </span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            t.cf_final >= 0.8 ? 'bg-emerald-100 text-emerald-700' :
                            t.cf_final >= 0.5 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                          }`}>
                            CF = {(t.cf_final * 100).toFixed(1)}%
                          </span>
                        </div>
                        <div className="text-xs text-slate-600 space-y-1">
                          <p><span className="font-bold text-blue-600">IF</span> {t.kondisi_if}</p>
                          <p><span className="font-bold text-emerald-600">THEN</span> {t.kesimpulan_then}</p>
                          <p className="text-[10px] text-slate-400 font-mono mt-1">{t.perhitungan}</p>
                        </div>
                      </div>
                    ))}

                    {/* CF Gabungan */}
                    {hasilDiagnosis.trace.length > 1 && (
                      <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4">
                        <h4 className="text-[10px] font-bold text-[#4f46e5] uppercase tracking-wider mb-1">Perhitungan CF Gabungan (Combine)</h4>
                        <p className="text-xs text-slate-600">
                          Rumus: <code className="bg-white px-1.5 py-0.5 rounded font-mono text-[#4f46e5]">CF_combine(CF1, CF2) = CF1 + CF2 × (1 - CF1)</code>
                        </p>
                        <p className="text-sm font-bold text-[#4f46e5] mt-1">
                          CF Gabungan Final = {hasilDiagnosis.cf_gabungan} → <span className="text-lg">{hasilDiagnosis.cf_persen}%</span>
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Kolom Kanan: Ringkasan Pemeriksaan + Tombol Simpan */}
            <div className="space-y-6">

              {/* Ringkasan Data Pemeriksaan */}
              <div className={styles.cardBase}>
                <h3 className="text-xs font-bold text-[#0f172a] mb-4 uppercase tracking-wider">Ringkasan Pemeriksaan</h3>
                <div className="space-y-3">
                  {[
                    { label: 'Algoritma', value: hasilDiagnosis.algoritma, icon: <Brain size={14} /> },
                    { label: 'Kelompok Usia', value: hasilDiagnosis.kelompok_usia, icon: <User size={14} /> },
                    { label: 'Tekanan Darah', value: `${hasilDiagnosis.data_pemeriksaan.td} (${hasilDiagnosis.data_pemeriksaan.klasifikasi_td})`, icon: <Heart size={14} /> },
                    { label: 'Gula Darah', value: `${hasilDiagnosis.data_pemeriksaan.gds} (${hasilDiagnosis.data_pemeriksaan.klasifikasi_gds})`, icon: <Droplet size={14} /> },
                    { label: 'IMT', value: `${hasilDiagnosis.data_pemeriksaan.imt} (${hasilDiagnosis.data_pemeriksaan.status_gizi})`, icon: <Scale size={14} /> },
                    { label: 'Rules Terpicu', value: `${hasilDiagnosis.jumlah_rules_terpicu} dari ${KNOWLEDGE_BASE.length} rules`, icon: <Zap size={14} /> }
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl">
                      <span className="text-sm flex items-center justify-center">{item.icon}</span>
                      <div className="flex-1 min-w-0">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">{item.label}</span>
                        <span className="text-xs font-semibold text-[#0f172a] block mt-0.5 break-words">{item.value}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Semua Penyakit Terdeteksi */}
              {hasilDiagnosis.semua_fired_rules.length > 1 && (
                <div className={styles.cardBase}>
                  <h3 className="text-xs font-bold text-[#0f172a] mb-3 uppercase tracking-wider">Semua Diagnosis Terdeteksi</h3>
                  <div className="space-y-2">
                    {hasilDiagnosis.semua_fired_rules.map((rule, idx) => (
                      <div key={idx} className={`p-3 rounded-xl border text-xs ${
                        idx === 0 ? 'border-[#4f46e5] bg-indigo-50/50' : 'border-slate-100 bg-slate-50'
                      }`}>
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-[#0f172a]">{rule.nama_penyakit}</span>
                          <span className="text-[10px] font-bold text-[#4f46e5]">{(rule.cf_final * 100).toFixed(1)}%</span>
                        </div>
                        <span className="text-[10px] text-slate-400">ICD-10: {rule.icd10} • {rule.urgensi}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tombol Aksi */}
              <div className="space-y-3">
                <button type="button" disabled={loading} onClick={simpanKeDatabase} className={styles.btnDark}>
                  <Save size={16} className="inline mr-1" /> {loading ? "Menyimpan..." : "Simpan ke Database GeoDisease"}
                </button>
                <button type="button" onClick={() => setStep(4)} className={styles.btnOutline + " w-full"}>
                  ⬅ Kembali ke Anamnesa
                </button>
                <button type="button" onClick={resetForm} className="w-full text-xs text-slate-400 hover:text-red-500 font-bold py-2 transition-all">
                  <RotateCcw size={16} className="inline mr-1" /> Reset & Mulai Pemeriksaan Baru
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CKGratis;
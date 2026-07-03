import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Circle, CircleMarker, LayersControl, LayerGroup, Popup, Tooltip, Polyline } from 'react-leaflet';
import L from 'leaflet';
import axios from 'axios';
import 'leaflet/dist/leaflet.css';
import { 
  Trash2, 
  Activity, 
  Map as MapIcon, 
  ShieldCheck, 
  Phone,
  MapPin,
  Stethoscope,
  User,
  X,
  Filter,
  Search,
  Building2,
  BadgePercent,
  Microscope,
  TrendingUp,
  AlertTriangle,
  Droplets
} from 'lucide-react';

// DATABASE KOORDINAT PRESISI KECAMATAN MADIUN
const koordinatKecamatan = {
  "Balerejo": [-7.545814, 111.636653],
  "Dagangan": [-7.733527, 111.606248],
  "Dolopo": [-7.771966, 111.574676],
  "Geger": [-7.697422, 111.536965],
  "Gemarang": [-7.618074, 111.758907],
  "Jiwan": [-7.613941, 111.487841],
  "Kare": [-7.707757, 111.719875],
  "Kebonsari": [-7.747976, 111.523035],
  "Madiun": [-7.575239, 111.531776], 
  "Mejayan": [-7.525624, 111.661073], 
  "Pilangkenceng": [-7.469724, 111.696655],
  "Saradan": [-7.551912, 111.741005],
  "Sawahan": [-7.579455, 111.467362],
  "Wonoasri": [-7.509748, 111.611181],
  "Wungu": [-7.653424, 111.564532]
};

// DATABASE KOORDINAT FASKES MADIUN (Rich network for referral SOP)
const dataFaskes = [
  { nama: "RSUD Dolopo", tipe: "Rumah Sakit Rujukan", koordinat: [-7.771146, 111.575263], telp: "(0351) 367301" },
  { nama: "RSUD Caruban", tipe: "Rumah Sakit Rujukan", koordinat: [-7.514051, 111.656914], telp: "(0351) 383114" },
  { nama: "Puskesmas Jiwan", tipe: "Puskesmas Kec. Jiwan", koordinat: [-7.613612, 111.488345], telp: "(0351) 494112" },
  { nama: "Puskesmas Balerejo", tipe: "Puskesmas Kec. Balerejo", koordinat: [-7.546311, 111.636121], telp: "(0351) 383005" },
  { nama: "Puskesmas Geger", tipe: "Puskesmas Kec. Geger", koordinat: [-7.696841, 111.536122], telp: "(0351) 464221" },
  { nama: "Puskesmas Dolopo", tipe: "Puskesmas Kec. Dolopo", koordinat: [-7.771966, 111.574676], telp: "(0351) 367123" },
  { nama: "Puskesmas Wungu", tipe: "Puskesmas Kec. Wungu", koordinat: [-7.653424, 111.564532], telp: "(0351) 491234" },
  { nama: "Puskesmas Saradan", tipe: "Puskesmas Kec. Saradan", koordinat: [-7.551912, 111.741005], telp: "(0351) 381234" },
  { nama: "Puskesmas Mejayan", tipe: "Puskesmas Kec. Mejayan", koordinat: [-7.525624, 111.661073], telp: "(0351) 382234" }
];

// Perbaikan Glitch Gambar Penanda Bawaan Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Penanda Pin Lokasi Pasien Individu
const createCustomMarker = (color) => new L.DivIcon({
  html: `<div style="background-color: ${color}; width: 14px; height: 14px; border-radius: 50%; border: 2.5px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.3); transform: scale(1); transition: transform 0.2s;"></div>`,
  className: 'custom-pin-marker',
  iconSize: [14, 14],
  iconAnchor: [7, 7]
});

// Icon khusus untuk Faskes
const faskesIcon = new L.DivIcon({
  html: `<div style="background-color: #0ea5e9; width: 22px; height: 22px; border-radius: 8px; display: flex; align-items: center; justify-content: center; border: 2.5px solid white; box-shadow: 0 3px 6px rgba(0,0,0,0.25);"><span style="color: white; font-size: 14px; font-weight: 900;">+</span></div>`,
  className: 'faskes-div-icon',
  iconSize: [22, 22],
  iconAnchor: [11, 11]
});

// Keywords Kategori Penyakit
const PTM_KEYWORDS = ['hipertensi', 'tensi', 'darah tinggi', 'diabetes', 'dm', 'gula darah', 'hiperglikemia', 'obesitas', 'gizi kurang', 'underweight', 'gizi lebih', 'stroke', 'jantung', 'kanker'];

const dapatkanKategoriPenyakit = (penyakitId) => {
  if (!penyakitId) return 'PM';
  const clean = penyakitId.toLowerCase();
  const isPTM = PTM_KEYWORDS.some(kw => clean.includes(kw));
  if (isPTM) return 'PTM';
  return 'PM';
};

const dapatkanCFPakar = (penyakitId) => {
  if (!penyakitId) return '80%';
  const clean = penyakitId.toLowerCase();
  if (clean.includes('dss') || clean.includes('shock')) return '92%';
  if (clean.includes('krisis hipertensi') || clean.includes('≥180/120')) return '95%';
  if (clean.includes('dbd') || clean.includes('hemorrhagic')) return '85%';
  if (clean.includes('hiperglikemia berat') || clean.includes('krisis diabetes')) return '90%';
  if (clean.includes('dehidrasi berat')) return '88%';
  if (clean.includes('gizi kurang') || clean.includes('underweight')) return '85%';
  if (clean.includes('tifoid berat')) return '82%';
  if (clean.includes('pneumonia') || clean.includes('ispa berat')) return '80%';
  if (clean.includes('hipertensi esensial') || clean.includes('primary')) return '80%';
  if (clean.includes('diabetes mellitus') || clean.includes('suspek dm')) return '78%';
  if (clean.includes('dehidrasi ringan') || clean.includes('gea dehidrasi')) return '75%';
  if (clean.includes('demam tifoid') || clean.includes('typhoid')) return '72%';
  if (clean.includes('ispa ringan') || clean.includes('bronkitis')) return '70%';
  if (clean.includes('obesitas')) return '90%';
  return '80%';
};

// Formula Haversine untuk menghitung faskes terdekat
const hitungJarakHaversine = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

const cariFaskesTerdekat = (lat, lng) => {
  if (!lat || !lng || isNaN(lat) || isNaN(lng)) return null;
  let terdekat = null;
  let jarakMin = Infinity;
  for (const f of dataFaskes) {
    const d = hitungJarakHaversine(lat, lng, f.koordinat[0], f.koordinat[1]);
    if (d < jarakMin) {
      jarakMin = d;
      terdekat = f;
    }
  }
  return { faskes: terdekat, jarak: jarakMin };
};

const Peta = ({ dataPasien = [], daftarKecamatan = [], refreshData }) => {
  const [modeSpasial, setModeSpasial] = useState('PM'); // 'PM' vs 'PTM'
  const [selectedKec, setSelectedKec] = useState(null);
  const [selectedKecData, setSelectedKecData] = useState(null);
  const [searchKecamatan, setSearchKecamatan] = useState('');

  const [filterPenyakit, setFilterPenyakit] = useState('Semua');
  const [filterStatus, setFilterStatus] = useState('Semua');

  useEffect(() => {
    setTimeout(() => {
      window.dispatchEvent(new Event('resize'));
    }, 300);
  }, [dataPasien, modeSpasial]);

  // Reset filter penyakit saat mode spasial berpindah
  useEffect(() => {
    setFilterPenyakit('Semua');
    setSelectedKec(null);
    setSelectedKecData(null);
  }, [modeSpasial]);

  // Klasifikasi data berdasarkan Mode Spasial yang aktif (PM atau PTM)
  const dataPasienMode = dataPasien.filter(p => {
    const kat = dapatkanKategoriPenyakit(p.penyakit_id);
    return kat === modeSpasial;
  });

  const daftarOpsiPenyakit = ['Semua', ...new Set(dataPasienMode.map(p => {
    if (!p.penyakit_id) return null;
    return p.penyakit_id.includes('[') ? p.penyakit_id.split('[')[0].trim() : p.penyakit_id;
  }).filter(Boolean))];

  const dataPasienTerfiltrasi = dataPasienMode.filter(p => {
    const namaPenyakitClean = p.penyakit_id?.includes('[') ? p.penyakit_id.split('[')[0].trim() : p.penyakit_id;
    const matchPenyakit = filterPenyakit === 'Semua' || namaPenyakitClean === filterPenyakit;
    
    let statusKlinisClean = p.status ? p.status.trim() : 'Aktif';
    if (statusKlinisClean === 'Perawatan' || statusKlinisClean === 'Rujukan') statusKlinisClean = 'Aktif';
    const matchStatus = filterStatus === 'Semua' || statusKlinisClean.toLowerCase() === filterStatus.toLowerCase();

    return matchPenyakit && matchStatus;
  });

  const totalPasienKabupaten = dataPasienTerfiltrasi.length;
  const totalAktifKabupaten = dataPasienTerfiltrasi.filter(p => {
    const s = p.status ? p.status.trim() : 'Aktif';
    return s !== 'Sembuh' && s !== 'Meninggal';
  }).length;

  const statistikKecamatan = Object.keys(koordinatKecamatan).reduce((acc, kec) => {
    const pasienKec = dataPasienTerfiltrasi.filter(p => {
      if (!p.wilayah_id) return false;
      const namaDb = p.wilayah_id.toString().toLowerCase().trim();
      const namaLokal = kec.toLowerCase().trim();
      if (namaLokal === 'mejayan' && namaDb === 'caruban') return true;
      return namaDb === namaLokal || namaDb.includes(namaLokal) || namaLokal.includes(namaDb);
    });
    
    const aktif = pasienKec.filter(p => {
      const s = p.status ? p.status.trim() : 'Aktif';
      return s !== 'Sembuh' && s !== 'Meninggal';
    }).length;
    const sembuh = pasienKec.filter(p => p.status?.trim() === 'Sembuh').length;
    const meninggal = pasienKec.filter(p => p.status?.trim() === 'Meninggal').length;

    acc[kec] = { total: pasienKec.length, aktif, sembuh, meninggal, pasien: pasienKec, koordinat: koordinatKecamatan[kec] };
    return acc;
  }, {});

  // Menentukan warna heksadesimal berdasarkan jumlah kasus aktif (Epidemiologi Penyakit Menular)
  const dapatkanWarnaRisikoPM = (jumlahAktif) => {
    if (jumlahAktif >= 5) return "#ef4444"; // Merah (Risiko Tinggi / KLB)
    if (jumlahAktif >= 3) return "#f97316"; // Oranye (Risiko Sedang)
    if (jumlahAktif >= 1) return "#eab308"; // Kuning (Risiko Rendah / Waspada)
    return "#22c55e";                        // Hijau (Aman / Nihil Kasus)
  };

  const dapatkanNamaWarnaTeksPM = (jumlahAktif) => {
    if (jumlahAktif >= 5) return "Merah (KLB)";
    if (jumlahAktif >= 3) return "Oranye (Sedang)";
    if (jumlahAktif >= 1) return "Kuning (Waspada)";
    return "Hijau (Aman)";
  };

  // Menentukan warna heksadesimal berdasarkan beban kasus kronis (PTM)
  const dapatkanWarnaBebanPTM = (jumlahKasus) => {
    if (jumlahKasus >= 10) return "#7c3aed"; // Violet/Ungu Tua (Sangat Tinggi)
    if (jumlahKasus >= 5) return "#4f46e5";  // Indigo (Tinggi)
    if (jumlahKasus >= 1) return "#0ea5e9";  // Light Blue (Sedang)
    return "#64748b";                        // Slate (Rendah / Nihil)
  };

  const dapatkanNamaWarnaTeksPTM = (jumlahKasus) => {
    if (jumlahKasus >= 10) return "Ungu (Beban Tinggi)";
    if (jumlahKasus >= 5) return "Indigo (Beban Sedang)";
    if (jumlahKasus >= 1) return "Biru (Beban Rendah)";
    return "Slate (Nihil)";
  };

  const handleDelete = async (id) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus data pasien ini secara permanen dari server?")) {
      try {
        const response = await axios.delete(`http://127.0.0.1:5000/api/pasien/${id}`);
        if (response.status === 200) {
          alert("Data pasien berhasil dihapus!");
          refreshData();
          if (selectedKec) {
            const updatedPasien = statistikKecamatan[selectedKec].pasien.filter(p => p.id !== id);
            if (updatedPasien.length === 0) {
              setSelectedKec(null);
              setSelectedKecData(null);
            } else {
              const updatedAktif = updatedPasien.filter(p => p.status !== 'Sembuh' && p.status !== 'Meninggal').length;
              const updatedSembuh = updatedPasien.filter(p => p.status === 'Sembuh').length;
              const updatedMeninggal = updatedPasien.filter(p => p.status === 'Meninggal').length;
              
              const newKecData = {
                total: updatedPasien.length,
                aktif: updatedAktif,
                sembuh: updatedSembuh,
                meninggal: updatedMeninggal,
                pasien: updatedPasien,
                koordinat: koordinatKecamatan[selectedKec]
              };
              statistikKecamatan[selectedKec] = newKecData; 
              setSelectedKecData(newKecData);
            }
          }
        }
      } catch (error) {
        console.error("Gagal menghapus data:", error);
      }
    }
  };

  const handleKecClick = (namaKec) => {
    setSelectedKec(namaKec);
    setSelectedKecData(statistikKecamatan[namaKec]);
  };

  const daftarKecamatanTerfilter = Object.keys(statistikKecamatan).filter(k => 
    k.toLowerCase().includes(searchKecamatan.toLowerCase())
  );

  return (
    <div className="flex flex-col lg:flex-row h-screen max-h-screen w-full gap-6 p-4 bg-slate-50 overflow-hidden">
      
      {/* KIRI: Peta Visualisasi Dengan Switcher Mode dan Polyline Rujukan */}
      <div className="flex-1 h-[55vh] lg:h-full bg-white rounded-[2.5rem] shadow-xl border border-slate-100 overflow-hidden relative">
        
        {/* Floating Mode Switcher (Glassmorphic) */}
        <div className="absolute top-4 left-16 z-[1000] flex bg-white/95 backdrop-blur-md p-1 rounded-2xl shadow-xl border border-slate-200/50 gap-1">
          <button
            type="button"
            onClick={() => setModeSpasial('PM')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black tracking-tight transition-all duration-200 ${
              modeSpasial === 'PM'
                ? 'bg-rose-500 text-white shadow-md shadow-rose-200'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Microscope size={14} className="inline mr-1" /> Surveilans Menular (PM)
          </button>
          <button
            type="button"
            onClick={() => setModeSpasial('PTM')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black tracking-tight transition-all duration-200 ${
              modeSpasial === 'PTM'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <TrendingUp size={14} className="inline mr-1" /> Skrining Kronis (PTM)
          </button>
        </div>

        <MapContainer 
          center={[-7.6152, 111.6242]} 
          zoom={11} 
          style={{ height: '100%', width: '100%' }}
          zoomControl={true}
        >
          <LayersControl position="topright">
            <LayersControl.BaseLayer checked name="Peta Voyager (Light)">
              <TileLayer
                url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                attribution='&copy; OpenStreetMap contributors'
              />
            </LayersControl.BaseLayer>

            <LayersControl.BaseLayer name="GeoDisease Dark Mode">
              <TileLayer
                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                attribution='&copy; CARTO'
              />
            </LayersControl.BaseLayer>

            <LayersControl.Overlay checked name="Zonasi Risiko Wilayah">
              <LayerGroup>
                {Object.entries(koordinatKecamatan).map(([namaKec, koordinat]) => {
                  const dataKec = statistikKecamatan[namaKec];
                  if (!dataKec) return null;

                  const warnaZonasi = modeSpasial === 'PM'
                    ? dapatkanWarnaRisikoPM(dataKec.aktif)
                    : dapatkanWarnaBebanPTM(dataKec.total);

                  const namaWarnaTeks = modeSpasial === 'PM'
                    ? dapatkanNamaWarnaTeksPM(dataKec.aktif)
                    : dapatkanNamaWarnaTeksPTM(dataKec.total);

                  const hitungRadius = 800 + (dataKec.total * 150);

                  return (
                    <React.Fragment key={`group-${namaKec}`}>
                      {/* 1. Lingkaran Besar Wilayah (Transparan) */}
                      <Circle
                        center={koordinat}
                        radius={hitungRadius}
                        pathOptions={{
                          fillColor: warnaZonasi,
                          fillOpacity: 0.15,
                          color: warnaZonasi,
                          weight: 1.5,
                          dashArray: modeSpasial === 'PM' ? '4, 4' : '1, 5'
                        }}
                        interactive={false} 
                      />

                      {/* 2. Titik Lingkaran Kecil di Setiap Koordinat Kecamatan */}
                      <CircleMarker
                        center={koordinat}
                        radius={8}
                        pathOptions={{
                          fillColor: warnaZonasi,
                          fillOpacity: 1,
                          color: '#ffffff',
                          weight: 2,
                        }}
                        interactive={true}
                        eventHandlers={{
                          click: () => handleKecClick(namaKec)
                        }}
                      >
                        <Tooltip 
                          permanent 
                          direction="top"
                          className="shadow-md rounded-lg border-0"
                          style={{ background: 'transparent', border: 'none', boxShadow: 'none' }}
                          interactive={true}
                        >
                          <div style={{ 
                            fontFamily: 'sans-serif', 
                            fontSize: '10px', 
                            fontWeight: '800', 
                            padding: '3px 8px',
                            backgroundColor: warnaZonasi,
                            color: 'white',
                            borderRadius: '6px',
                            boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
                            textAlign: 'center',
                            border: '1.5px solid white'
                          }}>
                            {namaWarnaTeks}
                          </div>
                        </Tooltip>
                      </CircleMarker>
                    </React.Fragment>
                  );
                })}
              </LayerGroup>
            </LayersControl.Overlay>

            <LayersControl.Overlay checked name="Pin Lokasi Pasien">
              <LayerGroup>
                {dataPasienTerfiltrasi.map((p) => {
                  let lat = parseFloat(p.latitude);
                  let lng = parseFloat(p.longitude);

                  if (!lat || !lng || isNaN(lat) || isNaN(lng)) {
                    const fallKec = p.wilayah_id ? Object.keys(koordinatKecamatan).find(k => k.toLowerCase() === p.wilayah_id.toString().toLowerCase().trim()) : null;
                    if (fallKec) [lat, lng] = koordinatKecamatan[fallKec];
                    else return null;
                  }

                  let pinColor = '#ef4444'; // default aktif PM
                  if (p.status?.trim() === 'Sembuh') pinColor = '#10b981';
                  else if (p.status?.trim() === 'Meninggal') pinColor = '#334155';
                  else if (modeSpasial === 'PTM') pinColor = '#4f46e5';

                  return (
                    <Marker key={`pin-${p.id}`} position={[lat, lng]} icon={createCustomMarker(pinColor)}>
                      <Popup>
                        <div className="text-xs p-2.5 space-y-2 max-w-[220px]">
                          <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
                            <p className="font-black text-slate-800 uppercase tracking-tight text-[11px] truncate">{p.nama}</p>
                            <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-full text-white ${
                              p.status === 'Sembuh' ? 'bg-emerald-500' : p.status === 'Rujukan' ? 'bg-rose-500 animate-pulse' : 'bg-amber-500'
                            }`}>
                              {p.status || 'Aktif'}
                            </span>
                          </div>
                          
                          <div className="space-y-1">
                            <p className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded inline-block">
                              🩺 {p.penyakit_id}
                            </p>
                            {p.umur && <p className="text-[9px] text-slate-500 font-bold flex items-center gap-1"><User size={9} /> Umur: {p.umur} Tahun</p>}
                            <p className="text-[9px] text-slate-500 font-semibold truncate flex items-center gap-1"><MapPin size={9} /> {p.alamat || 'Alamat tidak tertera'}</p>
                          </div>

                          {/* Indikator Rekam Medis CKG jika ada */}
                          {(p.tekanan_darah || p.gula_darah || p.imt_skor) && (
                            <div className="pt-1.5 border-t border-slate-100 space-y-1">
                              <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Parameter Klinis CKG</p>
                              <div className="flex flex-col gap-0.5 text-[9px] font-bold text-slate-600">
                                {p.tekanan_darah && p.tekanan_darah !== '0/0' && p.tekanan_darah !== '/' && <div>🩸 TD: {p.tekanan_darah} mmHg</div>}
                                {p.gula_darah > 0 && <div className="flex items-center gap-1"><Droplets size={12} /> GDS: {p.gula_darah} mg/dL</div>}
                                {p.imt_skor > 0 && <div>⚖️ IMT: {p.imt_skor} ({p.status_gizi || '-'})</div>}
                              </div>
                            </div>
                          )}
                        </div>
                      </Popup>
                    </Marker>
                  );
                })}
              </LayerGroup>
            </LayersControl.Overlay>

            <LayersControl.Overlay name="Fasilitas Kesehatan (Faskes)">
              <LayerGroup>
                {dataFaskes.map((faskes, idx) => (
                  <Marker key={`faskes-${idx}`} position={faskes.koordinat} icon={faskesIcon}>
                    <Popup>
                      <div className="p-2 min-w-[180px]">
                        <h4 className="font-black text-sm text-indigo-600 m-0">{faskes.nama}</h4>
                        <p className="text-[10px] font-bold text-slate-400 my-0.5">{faskes.tipe}</p>
                        <p className="text-[11px] text-slate-500 font-mono my-0.5 flex items-center gap-1.5"><Phone size={11}/> {faskes.telp}</p>
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </LayerGroup>
            </LayersControl.Overlay>
          </LayersControl>

          {/* Jalur Rujukan Pasien ke Faskes Terdekat (SOP Rujukan Terintegrasi) */}
          {dataPasienTerfiltrasi.map((p, idx) => {
            if (p.status?.trim() === 'Rujukan') {
              let lat = parseFloat(p.latitude);
              let lng = parseFloat(p.longitude);

              if (!lat || !lng || isNaN(lat) || isNaN(lng)) {
                const fallKec = p.wilayah_id ? Object.keys(koordinatKecamatan).find(k => k.toLowerCase() === p.wilayah_id.toString().toLowerCase().trim()) : null;
                if (fallKec) [lat, lng] = koordinatKecamatan[fallKec];
                else return null;
              }

              const rujukan = cariFaskesTerdekat(lat, lng);
              if (rujukan && rujukan.faskes) {
                const fCoords = rujukan.faskes.koordinat;
                return (
                  <Polyline
                    key={`route-${p.id || idx}`}
                    positions={[[lat, lng], fCoords]}
                    pathOptions={{
                      color: '#ef4444',
                      weight: 2,
                      dashArray: '5, 5',
                      opacity: 0.8,
                      lineJoin: 'round'
                    }}
                  >
                    <Tooltip sticky>
                      <div className="text-[10px] p-1 font-semibold text-slate-800">
                        <AlertTriangle size={14} className="inline mr-1" /> <span className="font-black text-rose-600">Jalur Rujukan SOP:</span><br/>
                        {p.nama} ➔ {rujukan.faskes.nama} ({rujukan.jarak.toFixed(2)} km)
                      </div>
                    </Tooltip>
                  </Polyline>
                );
              }
            }
            return null;
          })}

          {/* Legenda Dinamis */}
          <div className="absolute bottom-6 left-6 z-[1000] bg-white/95 backdrop-blur-md px-5 py-4 rounded-3xl border border-slate-100 shadow-xl flex flex-col gap-2 max-w-[260px]">
            {modeSpasial === 'PM' ? (
              <>
                <span className="text-[9px] font-black text-rose-500 uppercase tracking-widest block mb-1">Zonasi Risiko Menular (PM)</span>
                <div className="flex items-center gap-3 text-xs font-bold text-slate-700">
                  <span className="w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white shadow-sm inline-block"></span> Aman (0 Kasus)
                </div>
                <div className="flex items-center gap-3 text-xs font-bold text-slate-700">
                  <span className="w-3.5 h-3.5 rounded-full bg-yellow-500 border-2 border-white shadow-sm inline-block"></span> Waspada (1-2 Kasus)
                </div>
                <div className="flex items-center gap-3 text-xs font-bold text-slate-700">
                  <span className="w-3.5 h-3.5 rounded-full bg-orange-500 border-2 border-white shadow-sm inline-block"></span> Risiko Sedang (3-4 Kasus)
                </div>
                <div className="flex items-center gap-3 text-xs font-bold text-slate-700">
                  <span className="w-3.5 h-3.5 rounded-full bg-rose-500 border-2 border-white shadow-sm inline-block"></span> KLB / Wabah (&ge; 5 Kasus)
                </div>
              </>
            ) : (
              <>
                <span className="text-[9px] font-black text-indigo-600 uppercase tracking-widest block mb-1">Kepadatan Skrining Kronis (PTM)</span>
                <div className="flex items-center gap-3 text-xs font-bold text-slate-700">
                  <span className="w-3.5 h-3.5 rounded-full bg-slate-500 border-2 border-white shadow-sm inline-block"></span> Nihil Kasus (0 Kasus)
                </div>
                <div className="flex items-center gap-3 text-xs font-bold text-slate-700">
                  <span className="w-3.5 h-3.5 rounded-full bg-sky-400 border-2 border-white shadow-sm inline-block"></span> Prevalensi Rendah (1-4 Kasus)
                </div>
                <div className="flex items-center gap-3 text-xs font-bold text-slate-700">
                  <span className="w-3.5 h-3.5 rounded-full bg-indigo-600 border-2 border-white shadow-sm inline-block"></span> Prevalensi Sedang (5-9 Kasus)
                </div>
                <div className="flex items-center gap-3 text-xs font-bold text-slate-700">
                  <span className="w-3.5 h-3.5 rounded-full bg-violet-700 border-2 border-white shadow-sm inline-block"></span> Prevalensi Tinggi (&ge; 10 Kasus)
                </div>
              </>
            )}
            <div className="border-t border-slate-100 pt-2 flex items-center gap-2 text-[10px] font-bold text-slate-400">
              <span className="text-rose-500 font-extrabold">-- --</span> Jalur Rujukan SOP
            </div>
          </div>
        </MapContainer>
      </div>

      {/* KANAN: Sidebar Informasi & List Dashboard */}
      <div className="w-full lg:w-[450px] flex flex-col gap-6 h-[40vh] lg:h-full overflow-hidden">
        
        {/* Panel Kontrol & Filter Penyakit */}
        <div className="bg-white p-6 rounded-[2.5rem] shadow-xl border border-slate-100 flex flex-col gap-4 shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl"><MapIcon size={20} /></div>
              <div>
                <h2 className="text-base font-black text-slate-800 tracking-tight">Geo-Surveilans CKG</h2>
                <p className="text-xs text-slate-400 font-medium">Kabupaten Madiun &bull; {modeSpasial === 'PM' ? 'Penyakit Menular' : 'Penyakit Tidak Menular'}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-1 border-t border-slate-50 mt-1">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest"><Filter size={10} /> Penyakit</label>
              <select 
                value={filterPenyakit} 
                onChange={(e) => { setFilterPenyakit(e.target.value); setSelectedKec(null); setSelectedKecData(null); }} 
                className="bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 outline-none"
              >
                {daftarOpsiPenyakit.map((opsi, idx) => (<option key={idx} value={opsi}>{opsi}</option>))}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest"><Activity size={10} /> Status Medis</label>
              <select 
                value={filterStatus} 
                onChange={(e) => { setFilterStatus(e.target.value); setSelectedKec(null); setSelectedKecData(null); }} 
                className="bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 outline-none"
              >
                <option value="Semua">Semua Status</option>
                <option value="Aktif">Aktif</option>
                <option value="Sembuh">Sembuh</option>
                <option value="Meninggal">Meninggal</option>
              </select>
            </div>
          </div>
        </div>

        {/* Panel Detail Kecamatan & Daftar Pasien */}
        <div className="flex-1 bg-white rounded-[2.5rem] shadow-xl border border-slate-100 overflow-hidden flex flex-col min-h-0">
          {!selectedKecData ? (
            <div className="flex-1 flex flex-col p-6 overflow-y-auto">
              
              {/* Ringkasan Kasus live */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-slate-50/70 p-4 rounded-2xl border border-slate-100">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Total Terdata</span>
                  <h4 className="text-2xl font-black text-slate-800 mt-1">{totalPasienKabupaten} <span className="text-xs font-bold text-slate-400">Jiwa</span></h4>
                </div>
                <div className={`p-4 rounded-2xl border transition-all ${
                  modeSpasial === 'PM' 
                    ? 'bg-rose-50/40 border-rose-100/50 text-rose-700' 
                    : 'bg-indigo-50/40 border-indigo-100/50 text-indigo-700'
                }`}>
                  <span className="text-[9px] font-black uppercase tracking-widest block opacity-70">
                    {modeSpasial === 'PM' ? 'Kasus Aktif PM' : 'Kasus Aktif PTM'}
                  </span>
                  <h4 className="text-2xl font-black mt-1">{totalAktifKabupaten} <span className="text-xs font-bold opacity-60">Jiwa</span></h4>
                </div>
              </div>

              {/* PENCARIAN KECAMATAN */}
              <div className="relative mb-4">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                <input 
                  type="text"
                  placeholder="Cari kecamatan di Madiun..."
                  value={searchKecamatan}
                  onChange={(e) => setSearchKecamatan(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-100 rounded-xl pl-10 pr-4 py-2.5 text-xs font-bold text-slate-700 outline-none focus:border-indigo-400 focus:bg-white transition-all"
                />
              </div>

              {/* LIST KECAMATAN DI SIDEBAR */}
              <div className="w-full grid grid-cols-2 gap-2 max-h-[200px] overflow-y-auto pr-1">
                {daftarKecamatanTerfilter.map(kName => {
                  const dataKec = statistikKecamatan[kName];
                  const warnaZona = modeSpasial === 'PM'
                    ? dapatkanWarnaRisikoPM(dataKec.aktif)
                    : dapatkanWarnaBebanPTM(dataKec.total);

                  return (
                    <button 
                      key={kName}
                      onClick={() => handleKecClick(kName)}
                      className="px-3 py-2.5 rounded-xl border border-slate-100 bg-slate-50 hover:bg-indigo-50 hover:border-indigo-100 hover:text-indigo-600 transition-all text-xs font-bold text-slate-600 text-left flex justify-between items-center"
                    >
                      <span className="truncate">Kec. {kName}</span>
                      <span 
                        className="text-[9px] px-1.5 py-0.5 rounded font-black text-white shadow-sm min-w-[20px] text-center"
                        style={{ backgroundColor: warnaZona }}
                      >
                        {dataKec.total}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="flex-1 flex flex-col items-center justify-center text-center text-slate-400 border-2 border-dashed border-slate-100 rounded-[2rem] p-4 mt-4 bg-slate-50/30">
                <p className="font-black text-[9px] uppercase tracking-widest text-slate-400/80 leading-relaxed">
                  Pilih salah satu kecamatan di peta atau daftar di atas untuk memuat visualisasi rekam medis individu
                </p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col h-full overflow-hidden">
              {/* Header Detail Kecamatan */}
              <div className="p-6 border-b border-slate-100 bg-gradient-to-b from-slate-50/50 to-white relative shrink-0">
                <button onClick={() => { setSelectedKec(null); setSelectedKecData(null); }} className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all"><X size={16} /></button>
                <span className={`text-[9px] font-black px-3 py-1 rounded-md tracking-wider uppercase ${
                  modeSpasial === 'PM' ? 'bg-rose-50 text-rose-600' : 'bg-indigo-50 text-indigo-600'
                }`}>
                  Analisis Wilayah CKG &bull; {modeSpasial === 'PM' ? 'Menular' : 'Kronis'}
                </span>
                <h3 className="text-xl font-black text-slate-800 tracking-tight mt-2">{selectedKec === 'Mejayan' ? 'Mejayan (Caruban)' : selectedKec}</h3>
                
                <div className="grid grid-cols-3 gap-2 mt-4">
                  <div className="bg-rose-50/50 border border-rose-100/50 p-2 rounded-xl text-center">
                    <span className="text-[8px] font-black text-rose-400 uppercase tracking-wider block">Kasus Aktif</span>
                    <span className="text-xs font-black text-rose-600">{selectedKecData.aktif}</span>
                  </div>
                  <div className="bg-emerald-50/50 border border-emerald-100/50 p-2 rounded-xl text-center">
                    <span className="text-[8px] font-black text-emerald-400 uppercase tracking-wider block">Sembuh</span>
                    <span className="text-xs font-black text-emerald-600">{selectedKecData.sembuh}</span>
                  </div>
                  <div className="bg-slate-50 border border-slate-200/60 p-2 rounded-xl text-center">
                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-wider block">Meninggal</span>
                    <span className="text-xs font-black text-slate-700">{selectedKecData.meninggal}</span>
                  </div>
                </div>
              </div>

              {/* Daftar Rekam Medis Individu di Kecamatan */}
              <div className="flex-1 overflow-y-auto p-6 space-y-3 min-h-0 bg-slate-50/30">
                {selectedKecData.pasien.map((p) => {
                  const rujukan = p.status === 'Rujukan' ? cariFaskesTerdekat(parseFloat(p.latitude), parseFloat(p.longitude)) : null;
                  return (
                    <div key={p.id} className="group border border-slate-100 rounded-2xl p-4 bg-white hover:border-indigo-100 hover:shadow-md transition-all relative">
                      <div className="flex flex-row items-start justify-between gap-3">
                        <div className="space-y-2 flex-1 min-w-0">
                          
                          {/* Nama, Umur & Lokasi */}
                          <div className="flex items-start gap-2.5">
                            <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center text-slate-500 font-bold text-xs shrink-0"><User size={14} /></div>
                            <div className="flex-1 min-w-0">
                              <h4 className="text-xs font-black text-slate-700 tracking-tight break-words">{p.nama}</h4>
                              <div className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-[9px] text-slate-400 font-bold mt-0.5">
                                <span>{p.umur || '-'} Tahun</span>
                                <span>•</span>
                                <div className="inline-flex items-center gap-0.5 text-slate-400 max-w-full">
                                  <MapPin size={9} className="text-indigo-400 shrink-0" />
                                  <span className="truncate max-w-[140px]">{p.alamat || 'Alamat tidak tertera'}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          {/* Diagnosis & Certainty Factor */}
                          <div className="flex flex-wrap items-center gap-2 pt-1.5 border-t border-slate-50">
                            <div className="flex items-center gap-1 text-[10px] font-black text-slate-600 bg-slate-100/80 px-2 py-0.5 rounded">
                              <Stethoscope size={11} className="text-indigo-500" />
                              <span className="truncate max-w-[180px]">{p.penyakit_id}</span>
                            </div>
                            <div className="flex items-center gap-1 text-[10px] font-black text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100/30">
                              <BadgePercent size={11} />
                              <span>CF: {dapatkanCFPakar(p.penyakit_id)}</span>
                            </div>
                          </div>

                          {/* Data Pemeriksaan Fisik CKG */}
                          {(p.tekanan_darah || p.gula_darah || p.imt_skor) && (
                            <div className="flex flex-wrap gap-1.5 pt-1.5">
                              {p.tekanan_darah && p.tekanan_darah !== '0/0' && p.tekanan_darah !== '/' && (
                                <span className="text-[9px] bg-red-50 text-red-700 font-bold px-1.5 py-0.5 rounded border border-red-100 flex items-center gap-0.5">
                                  🩸 TD: {p.tekanan_darah} mmHg
                                </span>
                              )}
                              {p.gula_darah > 0 && (
                                <span className="text-[9px] bg-amber-50 text-amber-700 font-bold px-1.5 py-0.5 rounded border border-amber-100 flex items-center gap-0.5">
                                  <Droplets size={12} className="inline mr-1" /> GDS: {p.gula_darah} mg/dL
                                </span>
                              )}
                              {p.imt_skor > 0 && (
                                <span className="text-[9px] bg-indigo-50 text-indigo-700 font-bold px-1.5 py-0.5 rounded border border-indigo-100 flex items-center gap-0.5" title={p.status_gizi}>
                                  ⚖️ IMT: {p.imt_skor}
                                </span>
                              )}
                            </div>
                          )}

                          {/* Informasi Rujukan Faskes Terdekat */}
                          {rujukan && rujukan.faskes && (
                            <div className="bg-rose-50 border border-rose-100 rounded-lg p-2 text-[10px] font-bold text-rose-700 flex items-center gap-1.5 mt-1.5">
                              <Building2 size={12} className="shrink-0 text-rose-500 animate-pulse" />
                              <span className="truncate">Rujuk ke: <strong>{rujukan.faskes.nama}</strong> ({rujukan.jarak.toFixed(1)} km)</span>
                            </div>
                          )}

                        </div>

                        {/* Status Kondisi & Tombol Delete */}
                        <div className="flex flex-col items-end gap-3 shrink-0 border-l border-slate-100 pl-2 self-stretch justify-between">
                          <span className={`text-[8px] font-black px-2 py-1 rounded-full text-white uppercase tracking-wider text-center ${
                            p.status === 'Sembuh' ? 'bg-emerald-500' : p.status === 'Rujukan' ? 'bg-rose-500' : 'bg-amber-500'
                          }`}>
                            {p.status?.toUpperCase() || 'AKTIF'}
                          </span>
                          <button onClick={() => handleDelete(p.id)} className="p-1.5 text-slate-300 hover:text-rose-500 rounded-lg hover:bg-slate-100 transition-all opacity-0 group-hover:opacity-100" title="Hapus Data">
                            <Trash2 size={14} />
                          </button>
                        </div>

                      </div>
                    </div>
                  );
                })}
                
                {selectedKecData.pasien.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-10 text-slate-300">
                    <ShieldCheck size={36} className="mb-2 opacity-20 text-emerald-500" />
                    <p className="font-black text-[9px] uppercase tracking-widest">Nihil kasus aktif</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default Peta;
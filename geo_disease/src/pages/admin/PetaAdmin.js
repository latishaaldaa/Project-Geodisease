import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { 
  Users, 
  Activity, 
  ShieldCheck, 
  Map as MapIcon,
  Stethoscope,
  Clock,
  User,
  Filter,
  RefreshCw,
  Building2,
  Calendar,
  AlertCircle,
  AlertTriangle,
  Thermometer,
  Heart,
  Home
} from 'lucide-react';

// KOORDINAT UTAMA KECAMATAN DI KABUPATEN MADIUN
const koordinatFaskesMadiun = {
  "Balerejo": [-7.5583, 111.6425], "Dagangan": [-7.7335, 111.6111],
  "Dolopo": [-7.7811, 111.5833], "Geger": [-7.7000, 111.5500],
  "Gemarang": [-7.5833, 111.7500], "Jiwan": [-7.6167, 111.5000],
  "Kare": [-7.6833, 111.7333], "Kebonsari": [-7.7500, 111.5333],
  "Madiun": [-7.5833, 111.5500], "Mejayan": [-7.5167, 111.6667],
  "Pilangkenceng": [-7.4667, 111.6833], "Saradan": [-7.5500, 111.7333],
  "Sawahan": [-7.6000, 111.4667], "Wonoasri": [-7.5167, 111.6167],
  "Wungu": [-7.6667, 111.5833]
};

// PUSAT RUMAH SAKIT MONITORING (Command Center)
const centerHospital = [-7.5912, 111.6500]; // Central Madiun

// Custom Hospital Marker Icon (Pulsing Red)
const createHospitalIcon = () => {
  return L.divIcon({
    html: `
      <div style="position: relative; display: flex; justify-content: center; align-items: center; width: 30px; height: 30px;">
        <div style="position: absolute; width: 28px; height: 28px; background-color: #6366F1; opacity: 0.3; border-radius: 50%; animation: pulse-glow 2s infinite;"></div>
        <div style="background-color: #6366F1; color: white; width: 20px; height: 20px; border-radius: 6px; border: 2px solid white; display: flex; align-items: center; justify-content: center; font-weight: 900; box-shadow: 0 0 10px rgba(99, 102, 241, 0.6); font-size: 11px;">H</div>
      </div>
      <style>
        @keyframes pulse-glow {
          0% { transform: scale(0.8); opacity: 0.5; }
          100% { transform: scale(1.6); opacity: 0; }
        }
      </style>
    `,
    className: 'custom-hospital-icon',
    iconSize: [30, 30],
    iconAnchor: [15, 15]
  });
};

// Custom Patient Icons by Severity/Status
const createPatientIcon = (status) => {
  let color = '#3B82F6'; // Default: Blue (Rawat Jalan / Isolasi)
  const statusLower = status?.toLowerCase() || '';

  if (statusLower === 'icu' || statusLower === 'meninggal') {
    color = '#EF4444'; // Red (Critical)
  } else if (statusLower === 'rawat inap' || statusLower === 'perawatan') {
    color = '#F59E0B'; // Amber (Inpatient/Urgent)
  } else if (statusLower === 'sembuh') {
    color = '#10B981'; // Green (Recovered)
  }

  return L.divIcon({
    html: `<div style="background-color: ${color}; width: 14px; height: 14px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.3);"></div>`,
    className: 'custom-patient-icon',
    iconSize: [14, 14],
    iconAnchor: [7, 7]
  });
};

const PetaAdmin = ({ dataPasien = [], dataPenyakit = [], daftarKecamatan = [], refreshData, loading }) => {
  const [selectedKec, setSelectedKec] = useState("Semua");
  const [filterPenyakit, setFilterPenyakit] = useState("Semua");
  const [filterStatus, setFilterStatus] = useState("Semua");

  const daftarKecamatanMadiun = daftarKecamatan.length > 0 ? daftarKecamatan : Object.keys(koordinatFaskesMadiun);
  const daftarOpsiPenyakit = ['Semua', ...new Set(dataPasien.map(p => p.penyakit_id || p.penyakit).filter(Boolean))];

  // LOGIKA FILTERING DATA MONITORING SPASIAL
  const filteredPasien = dataPasien.filter(p => {
    const wilayahPasien = p.wilayah_id || p.kecamatan;
    const penyakitPasien = p.penyakit_id || p.penyakit;
    const statusPasien = p.status || 'Rawat Inap';
    
    const matchKecamatan = selectedKec === "Semua" || wilayahPasien === selectedKec;
    const matchPenyakit = filterPenyakit === "Semua" || penyakitPasien === filterPenyakit;
    
    let matchStatus = false;
    if (filterStatus === "Semua") {
      matchStatus = true;
    } else if (filterStatus === "Rawat Inap") {
      matchStatus = statusPasien === "Rawat Inap" || statusPasien === "Perawatan";
    } else if (filterStatus === "Rawat Jalan") {
      matchStatus = statusPasien === "Rawat Jalan" || statusPasien === "Isolasi Mandiri";
    } else {
      matchStatus = statusPasien === filterStatus;
    }
    
    return matchKecamatan && matchPenyakit && matchStatus;
  });

  // METRIK KINERJA OPERASIONAL
  const totalKasus = filteredPasien.length;
  const rawatInapAktif = filteredPasien.filter(p => p.status === 'Rawat Inap' || p.status === 'Perawatan').length;
  const icuAktif = filteredPasien.filter(p => p.status === 'ICU').length;
  const sembuhCount = filteredPasien.filter(p => p.status === 'Sembuh').length;

  return (
    <div className="flex flex-col gap-6 p-1 bg-slate-50 antialiased">
      
      {/* 1. FILTERING PANEL */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white p-4 rounded-3xl shadow-sm border border-slate-100">
        {/* Filter Wilayah Rujukan */}
        <div className="flex flex-col justify-center">
          <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Kecamatan Asal Rujukan</label>
          <select 
            value={selectedKec}
            onChange={(e) => setSelectedKec(e.target.value)}
            className="w-full bg-slate-50 border border-slate-100 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500/20"
          >
            <option value="Semua">Seluruh Kecamatan / Puskesmas</option>
            {daftarKecamatanMadiun.map(kec => (
              <option key={kec} value={kec}>{kec}</option>
            ))}
          </select>
        </div>

        {/* Filter Diagnosa Penyakit */}
        <div className="flex flex-col justify-center">
          <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1"><Filter size={10} className="inline mr-1" />Diagnosis Penyakit</label>
          <select 
            value={filterPenyakit}
            onChange={(e) => setFilterPenyakit(e.target.value)}
            className="w-full bg-slate-50 border border-slate-100 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500/20"
          >
            <option value="Semua">Semua Diagnosa</option>
            {daftarOpsiPenyakit.filter(o => o !== 'Semua').map((opsi, idx) => (
              <option key={idx} value={opsi}>{opsi}</option>
            ))}
          </select>
        </div>

        {/* Filter Status Medis */}
        <div className="flex flex-col justify-center">
          <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Status Klinis Pasien</label>
          <select 
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full bg-slate-50 border border-slate-100 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500/20"
          >
            <option value="Semua">Semua Status Medis</option>
            <option value="Rawat Inap">Rawat Inap / Perawatan</option>
            <option value="Rawat Jalan">Rawat Jalan / Kontrol</option>
            <option value="ICU">Perawatan ICU (Kritis)</option>
            <option value="Sembuh">Sembuh / Discharge</option>
            <option value="Meninggal">Meninggal Dunia</option>
          </select>
        </div>
      </div>

      {/* 2. STATISTIK RINGKAS SPASIAL */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-3">
          <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-2xl"><Users size={16} /></div>
          <div>
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Total Rujukan</span>
            <span className="text-base font-black text-slate-800 block leading-tight">{totalKasus} Pasien</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-3">
          <div className="p-2.5 bg-amber-50 text-amber-600 rounded-2xl"><Activity size={16} /></div>
          <div>
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Rawat Inap Aktif</span>
            <span className="text-base font-black text-amber-600 block leading-tight">{rawatInapAktif} Bed</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-3">
          <div className="p-2.5 bg-rose-50 text-rose-600 rounded-2xl"><AlertTriangle size={16} /></div>
          <div>
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">ICU (Kritis)</span>
            <span className="text-base font-black text-rose-600 block leading-tight">{icuAktif} Pasien</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-3">
          <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-2xl"><ShieldCheck size={16} /></div>
          <div>
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Discharge/Sembuh</span>
            <span className="text-base font-black text-emerald-600 block leading-tight">{sembuhCount} Sembuh</span>
          </div>
        </div>
      </div>

      {/* 3. MAP PANEL & LOG STREAM */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* MAP CONTAINER (2/3 width) */}
        <div className="lg:col-span-2 bg-white p-5 rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
          <div className="flex items-center justify-between mb-4 px-1">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl"><MapIcon size={16} /></div>
              <div>
                <h3 className="text-xs font-black text-slate-800 tracking-tight uppercase">Peta Aliran Rujukan Masuk Rumah Sakit</h3>
                <p className="text-[10px] text-slate-400 font-bold">Menampilkan pusat RSUD Caruban dan rute asal pengiriman pasien</p>
              </div>
            </div>
            {refreshData && (
              <button 
                onClick={refreshData} 
                disabled={loading}
                className="p-2 text-slate-400 hover:text-indigo-600 rounded-xl bg-slate-50 hover:bg-indigo-50 transition-colors disabled:opacity-50"
                title="Refresh Peta"
              >
                <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
              </button>
            )}
          </div>

          <div className="h-[480px] rounded-2xl overflow-hidden border border-slate-100 relative">
            <MapContainer center={centerHospital} zoom={11} style={{ height: '100%', width: '100%', zIndex: 1 }}>
              <TileLayer
                url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                attribution='&copy; OpenStreetMap &copy; CARTO'
              />

              {/* Marker Rumah Sakit Rujukan Pusat */}
              <Marker position={centerHospital} icon={createHospitalIcon()}>
                <Popup>
                  <div className="p-2 w-48">
                    <div className="flex items-center gap-2 border-b border-slate-100 pb-2 mb-2">
                      <div className="p-1 bg-indigo-50 text-indigo-600 rounded"><Home size={14} /></div>
                      <div>
                        <h4 className="text-xs font-black text-slate-800">RSUD Caruban Madiun</h4>
                        <p className="text-[9px] text-slate-400 font-bold">Pusat Komando & Rujukan</p>
                      </div>
                    </div>
                    <div className="text-[10px] text-slate-600 font-semibold space-y-1">
                      <p>Kapasitas Total: 150 Bed</p>
                      <p>Menangani Rujukan Aktif: {rawatInapAktif + icuAktif} Pasien</p>
                    </div>
                  </div>
                </Popup>
              </Marker>

              {/* Marker Pasien & Rute Rujukan */}
              {filteredPasien.map((pasien, index) => {
                const wilayahId = pasien.wilayah_id || pasien.kecamatan;
                const baseKoordinat = koordinatFaskesMadiun[wilayahId];
                
                if (baseKoordinat) {
                  // Jittering Spasial agar tidak bertumpuk
                  const penyesuaianLat = (Math.sin(index * 45) * 0.005);
                  const penyesuaianLng = (Math.cos(index * 45) * 0.005);
                  const koordinatFinal = [baseKoordinat[0] + penyesuaianLat, baseKoordinat[1] + penyesuaianLng];

                  return (
                    <React.Fragment key={pasien.id || index}>
                      {/* Garis Alur Rujukan dari Koordinat Pasien ke RSUD */}
                      {(pasien.status !== 'Sembuh' && pasien.status !== 'Meninggal') && (
                        <Polyline 
                          positions={[koordinatFinal, centerHospital]} 
                          color={pasien.status === 'ICU' ? '#EF4444' : '#6366F1'} 
                          weight={1.5} 
                          opacity={0.45} 
                          dashArray="4, 8" 
                        />
                      )}

                      {/* Marker Pasien */}
                      <Marker position={koordinatFinal} icon={createPatientIcon(pasien.status)}>
                        <Popup>
                          <div className="p-2.5 w-52 text-slate-700">
                            {/* Identitas */}
                            <div className="flex items-center gap-2 border-b border-slate-100 pb-2 mb-2">
                              <div className="w-6 h-6 bg-slate-50 rounded-lg flex items-center justify-center text-slate-500 font-bold text-xs">
                                {pasien.nama?.charAt(0).toUpperCase()}
                              </div>
                              <div className="min-w-0 flex-1">
                                <h4 className="text-xs font-black text-slate-800 truncate leading-none">{pasien.nama}</h4>
                                <p className="text-[9px] text-slate-400 font-bold mt-1">Umur: {pasien.umur || '-'} Th | Darah: {pasien.gol_darah || '-'}</p>
                              </div>
                            </div>

                            {/* Tanda Vital & Bangsal */}
                            <div className="space-y-1.5 text-[10px] font-bold text-slate-600">
                              <div className="flex items-center gap-2">
                                <Building2 size={11} className="text-indigo-500 shrink-0" />
                                <span className="text-slate-800 truncate">{pasien.kamar || 'Bangsal Melati'}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Stethoscope size={11} className="text-indigo-500 shrink-0" />
                                <span className="truncate uppercase text-slate-700">{pasien.penyakit_id || '-'}</span>
                              </div>
                              
                              {/* Vital Parameters */}
                              <div className="grid grid-cols-3 gap-1 bg-slate-50 p-1.5 rounded-lg text-[9px] mt-1 border border-slate-100">
                                <div className="text-center">
                                  <span className="block text-[8px] text-slate-400 uppercase">Suhu</span>
                                  <span className="font-extrabold text-slate-700">{pasien.suhu || '36.5'}°C</span>
                                </div>
                                <div className="text-center border-x border-slate-200">
                                  <span className="block text-[8px] text-slate-400 uppercase">Tensi</span>
                                  <span className="font-extrabold text-slate-700">{pasien.tensi || '120/80'}</span>
                                </div>
                                <div className="text-center">
                                  <span className="block text-[8px] text-slate-400 uppercase">Nadi</span>
                                  <span className="font-extrabold text-slate-700">{pasien.nadi || '80'}</span>
                                </div>
                              </div>

                              <div className="flex items-center gap-2 border-t border-dashed border-slate-100 pt-1.5 mt-1 text-[9px] text-slate-400">
                                <Clock size={11} />
                                <span>Rujukan: Kec. {wilayahId}</span>
                              </div>
                            </div>

                            {/* Status Badge */}
                            <div className={`mt-3 py-1 text-center rounded-lg text-[8px] font-black uppercase tracking-widest text-white
                              ${pasien.status === 'Sembuh' 
                                ? 'bg-emerald-500' 
                                : pasien.status === 'ICU' || pasien.status === 'Meninggal'
                                ? 'bg-rose-500' 
                                : 'bg-amber-500'}`}>
                              {pasien.status || 'Rawat Inap'}
                            </div>
                          </div>
                        </Popup>
                      </Marker>
                    </React.Fragment>
                  );
                }
                return null;
              })}
            </MapContainer>
          </div>
        </div>

        {/* PATIENT LISTING STREAM (1/3 width) */}
        <div className="bg-white p-5 rounded-[2rem] shadow-sm border border-slate-100 flex flex-col h-[555px]">
          <div className="mb-4">
            <h3 className="text-xs font-black text-slate-800 uppercase tracking-tight">Aliran Rujukan Terkini</h3>
            <p className="text-[10px] text-slate-400 font-bold">Daftar monitoring pasien aktif di RSUD</p>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3 pr-1">
            {filteredPasien.map((p) => (
              <div key={p.id} className="border border-slate-100 rounded-2xl p-3 bg-white hover:bg-slate-50/50 transition-all flex flex-col gap-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center text-xs font-bold"><User size={13} /></div>
                    <div className="min-w-0">
                      <h4 className="text-xs font-black text-slate-700 truncate">{p.nama}</h4>
                      <p className="text-[9px] text-slate-400 font-bold">Rujukan: {p.wilayah_id || p.kecamatan}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1 text-[9px] text-slate-400 font-semibold">
                    <Calendar size={10} />
                    {p.tanggal_input?.split('-').reverse().slice(0,2).join('/') || '-'}
                  </div>
                </div>

                {/* Vitals in Sidebar list */}
                <div className="flex gap-3 bg-slate-50/60 p-1.5 rounded-lg text-[9px] font-bold text-slate-500">
                  <span>Suhu: <span className="text-rose-600">{p.suhu || '36.5'}°C</span></span>
                  <span>Tensi: <span className="text-indigo-600">{p.tensi || '120/80'}</span></span>
                  <span>Kamar: <span className="text-slate-700">{p.kamar || 'Melati'}</span></span>
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-dashed border-slate-100 text-[9px] font-bold">
                  <div className="flex items-center gap-1 text-slate-500 uppercase">
                    <Stethoscope size={11} className="text-indigo-500" /> {p.penyakit_id || p.penyakit}
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider text-white 
                    ${p.status === 'Sembuh' 
                      ? 'bg-emerald-500' 
                      : p.status === 'ICU' || p.status === 'Meninggal'
                      ? 'bg-rose-500' 
                      : 'bg-amber-500'}`}>
                    {p.status || 'Rawat Inap'}
                  </span>
                </div>
              </div>
            ))}

            {filteredPasien.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-300 border-2 border-dashed border-slate-100 rounded-2xl">
                <AlertCircle size={32} className="mb-2 opacity-30 text-amber-500" />
                <p className="text-[9px] font-black uppercase tracking-widest leading-relaxed">Nihil data pasien terpantau</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default PetaAdmin;
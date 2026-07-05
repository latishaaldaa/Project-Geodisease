# 📘 Panduan Penggunaan Sistem Monitoring Admin

**Sistem Informasi Geografis Penyebaran Penyakit**  
**Role:** Admin (Read-Only Monitoring)  
**Tanggal:** 5 Juli 2026

---

## 🎯 Tujuan Sistem Admin

Sistem Admin dirancang khusus untuk **monitoring dan supervisi** data kesehatan yang diinput oleh Dinas Kesehatan (Dinkes). Admin **TIDAK DAPAT** mengubah, menambah, atau menghapus data. Semua data yang ditampilkan adalah **sinkronisasi real-time** dari database utama.

---

## 🔐 Login ke Sistem

1. Buka aplikasi di browser: `http://localhost:3000`
2. Pilih role **"Admin"** saat login
3. Masukkan kredensial Admin yang valid
4. Sistem akan mengarahkan ke Dashboard Monitoring

---

## 📊 Halaman-Halaman Admin

### 1. **Dashboard Admin** (Hospital Command Center)

**Fungsi Utama:**
- Monitoring Bed Occupancy Rate (BOR) rumah sakit
- Melihat statistik pasien: Rawat Inap, ICU, Rawat Jalan, Sembuh
- Grafik tren admisi pasien masuk
- Sebaran wilayah rujukan tertinggi
- Proporsi kondisi klinis pasien
- Top 5 diagnosa penyakit terbanyak
- Kapasitas bangsal (Melati, Dahlia, ICU, IGD)
- Log aktivitas sistem terkini

**Cara Menggunakan:**
1. Lihat KPI cards di bagian atas (BOR, Rawat Inap, ICU, Sembuh)
2. Gunakan **Filter Tren** untuk melihat data spesifik (Semua/Rawat Inap/ICU/dll)
3. Klik tombol **Export** untuk download data dashboard ke Excel
4. Scroll ke bawah untuk melihat grafik dan chart detail
5. Klik "Analitik Klinis" untuk ke halaman Statistik

**Catatan:**
- Data diperbarui otomatis saat refresh halaman
- BOR dihitung berdasarkan kapasitas 150 bed
- Chart menggunakan data 7 hari terakhir

---

### 2. **Rekam Medis** (Monitoring)

**Fungsi Utama:**
- Melihat daftar lengkap rekam medis pasien
- Filter/pencarian berdasarkan: Nama, NIK, Bangsal, Diagnosa, Wilayah
- Export data rekam medis ke Excel
- Melihat detail: Identitas, Vital Sign, Bangsal, Diagnosa, Status

**Cara Menggunakan:**
1. Ketik di search box untuk mencari pasien (Nama/NIK/Diagnosa/Wilayah)
2. Lihat data lengkap di tabel:
   - **Identitas Pasien:** Nama, NIK, No HP, Umur, Jenis Kelamin, Gol Darah
   - **Tanda Vital:** Suhu, Tekanan Darah, Denyut Nadi
   - **Bangsal & Wilayah:** Kamar perawatan, Kecamatan asal
   - **Diagnosa:** Penyakit terdeteksi, Keluhan
   - **Status Medis:** Rawat Inap/ICU/Sembuh/dll
3. Kolom "Tindakan" menampilkan **"View Only"** (tidak ada tombol edit/hapus)
4. Klik tombol **"Ekspor Excel"** untuk download seluruh data

**Badge/Indikator:**
- 🟢 Badge hijau: "Monitoring Read-Only Mode" di header
- ✅ "Terverifikasi RS" di setiap pasien
- 🎨 Status berwarna: ICU (Merah), Rawat Inap (Kuning), Sembuh (Hijau)

**Catatan:**
- Admin **TIDAK BISA** menambah/edit/hapus data pasien
- Semua data sinkron real-time dari input Dinkes
- File export berisi semua field termasuk tanda vital

---

### 3. **Statistik Admin**

**Fungsi Utama:**
- Analitik klinis terpadu rumah sakit
- KPI: BOR, ICU Terisi, Total Pasien, Audit Berkas RM
- Grafik tren admisi rujukan masuk (7 hari terakhir)
- Pie chart proporsi kondisi klinis pasien
- Bar chart top 5 diagnosa dengan kode ICD-10
- Bar chart top 5 kecamatan rujukan

**Cara Menggunakan:**
1. Gunakan **Filter Kecamatan** untuk melihat data per wilayah
2. Klik tombol **Refresh** untuk update data terbaru
3. Klik tombol **Export** untuk download statistik ke Excel
4. Analisis grafik:
   - **Line Chart:** Tren pasien masuk per hari
   - **Pie Chart:** Distribusi status (ICU/Rawat Inap/Sembuh)
   - **Bar Chart 1:** Beban penyakit tertinggi (dengan ICD-10)
   - **Bar Chart 2:** Kontribusi rujukan per kecamatan

**Contoh Kode ICD-10:**
- A91: DBD (Dengue)
- J18: Pneumonia
- J11: Influenza
- A01: Typhoid
- E11: Diabetes Mellitus
- I10: Hipertensi

**Catatan:**
- Filter kecamatan memfilter semua chart secara otomatis
- Data "Audit Berkas RM Incomplete" = pasien tanpa NIK/tanda vital
- File export dinamis sesuai filter aktif

---

### 4. **Peta Admin** (Geospasial Monitoring)

**Fungsi Utama:**
- Peta interaktif aliran rujukan ke rumah sakit
- Marker rumah sakit pusat (RSUD Caruban)
- Marker pasien dengan warna status
- Garis rute rujukan dari kecamatan ke RS
- Filter: Kecamatan, Diagnosa, Status Medis
- Sidebar daftar rujukan terkini

**Cara Menggunakan:**
1. Gunakan **3 Filter** di bagian atas:
   - Filter Kecamatan Asal Rujukan
   - Filter Diagnosis Penyakit
   - Filter Status Klinis Pasien
2. Klik tombol **Export Data** untuk download data peta ke Excel
3. Interaksi Peta:
   - **Zoom In/Out:** Gunakan tombol +/- atau scroll mouse
   - **Klik Marker RS:** Lihat info RSUD Caruban (kapasitas, hunian)
   - **Klik Marker Pasien:** Lihat detail lengkap (identitas, vital, bangsal)
4. Lihat **Sidebar Kanan:** Daftar aliran rujukan terkini dengan vital sign

**Legend Warna Marker:**
- 🔴 **Merah:** ICU / Meninggal (Kritis)
- 🟠 **Orange:** Rawat Inap / Perawatan (Urgent)
- 🔵 **Biru:** Rawat Jalan / Isolasi Mandiri
- 🟢 **Hijau:** Sembuh / Discharge

**Fitur Garis Rujukan:**
- Garis putus-putus dari kecamatan ke RS
- Warna merah: Pasien ICU
- Warna biru: Pasien non-kritis
- Tidak ada garis: Pasien sudah sembuh/meninggal

**Catatan:**
- Koordinat kecamatan: 15 kecamatan Kabupaten Madiun
- Jittering spatial otomatis untuk marker tidak bertumpuk
- Popup menampilkan tanda vital real-time

---

## 📤 Fitur Export Excel

Semua halaman dilengkapi tombol **Export** untuk keperluan pelaporan:

### Isi Export per Halaman:

**Dashboard:**
- Nama Pasien, NIK, Umur, Jenis Kelamin, Gol Darah
- Wilayah Kecamatan, Diagnosa, Bangsal/Kamar
- Status Medis, Suhu, Tekanan Darah, Denyut Nadi
- Tanggal Input

**Rekam Medis:**
- Semua field identitas dan tanda vital
- Suhu Tubuh (°C), Tekanan Darah (mmHg), Denyut Nadi (bpm)
- Kecamatan Rujukan, Diagnosa, Bangsal/Kamar
- Status Kondisi Klinis, Keluhan Utama, Alamat

**Statistik:**
- Data pasien lengkap dengan IMT, Gula Darah
- Status Gizi, Tinggi, Berat
- Diagnosa, Status Medis, Bangsal/Kamar
- Filter berdasarkan kecamatan yang dipilih

**Peta:**
- Data pasien dengan koordinat geografis
- Latitude, Longitude (jika ada)
- Wilayah Kecamatan, Alamat, Diagnosa
- Tanda Vital, Status Medis

**Cara Export:**
1. Klik tombol **"Export"** atau **"Ekspor Excel"**
2. File `.xlsx` akan otomatis terdownload
3. Nama file format: `[NamaHalaman]_[Filter]_[Tanggal].xlsx`

---

## 🔍 Tips Monitoring Efektif

### 1. **Monitoring Harian**
- Cek Dashboard pagi hari untuk overview BOR
- Pantau jumlah pasien ICU (critical alert)
- Review log aktivitas untuk tracking perubahan
- Export data harian untuk laporan

### 2. **Analisis Mingguan**
- Gunakan Statistik untuk tren 7 hari
- Identifikasi lonjakan kasus per kecamatan
- Cek top 5 diagnosa dan antisipasi kebutuhan
- Bandingkan BOR minggu ini vs minggu lalu

### 3. **Evaluasi Bulanan**
- Export semua data dari 4 halaman
- Analisis distribusi geografis (Peta)
- Review audit berkas RM yang incomplete
- Laporan ke pimpinan rumah sakit

### 4. **Filter Smart**
**Dashboard:**
- Filter "ICU" untuk monitoring pasien kritis
- Filter "Sembuh" untuk hitung discharge rate

**Statistik:**
- Filter per kecamatan untuk evaluasi puskesmas pengirim
- Identifikasi kecamatan dengan rujukan tertinggi

**Peta:**
- Kombinasi filter: Kecamatan + Penyakit + Status
- Contoh: "Mejayan + DBD + Rawat Inap" → Kluster outbreak DBD

---

## ⚠️ Batasan Sistem Admin

### ❌ **Tidak Bisa Dilakukan:**
1. **Tambah Data Pasien Baru** - Hanya Dinkes yang bisa
2. **Edit Data Pasien** - Tidak ada tombol edit/form input
3. **Hapus Rekam Medis** - Tidak ada tombol delete
4. **Import Excel** - Hanya tersedia di Dinkes
5. **Ubah Status Pasien** - Data read-only dari database
6. **Tambah/Hapus Bangsal** - Konfigurasi fixed

### ✅ **Yang Bisa Dilakukan:**
1. **View/Lihat** - Semua data pasien real-time
2. **Search/Filter** - Berdasarkan berbagai kriteria
3. **Export Excel** - Semua halaman untuk laporan
4. **Refresh Data** - Update tampilan terbaru
5. **Navigasi Antar Halaman** - Dashboard, RM, Statistik, Peta
6. **Zoom/Interaksi Peta** - Eksplorasi geografis

---

## 🚨 Troubleshooting

### 1. **Data Tidak Muncul**
**Solusi:**
- Pastikan backend API berjalan (`http://127.0.0.1:5000`)
- Klik tombol Refresh di halaman
- Logout dan login kembali
- Cek koneksi internet/jaringan lokal

### 2. **Export Excel Gagal**
**Solusi:**
- Pastikan tidak ada Excel file dengan nama sama yang terbuka
- Cek izin folder Downloads browser
- Coba filter data lebih spesifik (reduce size)

### 3. **Peta Tidak Tampil**
**Solusi:**
- Refresh halaman (F5)
- Clear browser cache
- Pastikan koneksi internet aktif (untuk basemap)
- Cek console browser untuk error (F12)

### 4. **Data Tidak Sinkron dengan Dinkes**
**Solusi:**
- Pastikan Dinkes sudah save/submit data
- Refresh halaman Admin (F5)
- Cek apakah API endpoint sama: `/api/pasien`
- Restart backend server jika perlu

### 5. **Grafik Kosong**
**Solusi:**
- Pastikan ada data pasien di database
- Cek filter yang aktif (ubah ke "Semua")
- Pastikan field `tanggal_input` terisi di data

---

## 📞 Kontak & Support

**Tim Teknis:**
- Developer: Kiro AI Assistant
- Email Support: support@geodisease.com
- Hotline: (0351) 123-4567

**Jam Operasional Support:**
- Senin - Jumat: 08.00 - 16.00 WIB
- Sabtu: 08.00 - 12.00 WIB
- Minggu/Libur: Emergency only

---

## 📝 Changelog

### v2.5 - 5 Juli 2026
- ✅ Implementasi Read-Only Mode untuk Admin
- ✅ Hapus tombol CRUD di RekamMedis
- ✅ Tambah fitur Export Excel di semua halaman
- ✅ Sinkronisasi real-time dengan Dinkes
- ✅ Badge "Monitoring Read-Only Mode"
- ✅ Filter dinamis di Dashboard & Statistik

### Upcoming Features (Future)
- 🔜 Notifikasi real-time saat data baru masuk
- 🔜 Dashboard customizable widgets
- 🔜 Export PDF untuk laporan resmi
- 🔜 Audit trail lengkap per user
- 🔜 Alert otomatis saat BOR > 80%

---

**Terima kasih telah menggunakan Sistem Monitoring GeoDisease!**  
Untuk panduan teknis developer, lihat: `ADMIN_MONITORING_SETUP.md`

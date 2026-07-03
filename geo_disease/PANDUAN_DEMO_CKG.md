# 🎯 PANDUAN DEMO FITUR INPUT DATA PEMERIKSAAN CKG
## Siap Demo Senin - Data Murni (Bukan Dummy)

---

## 📋 FITUR YANG SUDAH DITAMBAHKAN

### ✅ 1. Form Input Data Pemeriksaan Gigi Real-time
- Form lengkap sesuai standar Kemenkes RI
- Input data identitas pasien (NIK, Nama, Alamat lengkap)
- Input data pemeriksaan gigi (D-M-F-T Index)
- Kalkulasi DMF-T otomatis
- Diagnosis dan tindakan medis

### ✅ 2. Validasi NIK Otomatis
- Cek duplikasi NIK (pasien tidak bisa didaftarkan 2x)
- Validasi format NIK 16 digit
- Alert real-time jika NIK sudah terdaftar

### ✅ 3. Penyimpanan Data Lokal (LocalStorage)
- **TIDAK PERLU BACKEND/DATABASE**
- Data tersimpan di browser secara permanen
- Data tetap ada meskipun refresh halaman
- Cocok untuk demo tanpa koneksi server

### ✅ 4. Tabel Data Pemeriksaan
- Tampilan data dalam tabel lengkap
- Kolom: NIK, Nama, Tgl Lahir, Alamat, D-M-F, DMF-T, Puskesmas, Status
- Tombol Edit & Hapus untuk setiap data

### ✅ 5. Approval Workflow
- Status: Draft → Pending → Verified → Approved
- Dropdown untuk ubah status langsung di tabel
- Warna berbeda untuk setiap status

### ✅ 6. Update DMF-T Otomatis
- Dashboard DMF-T diupdate otomatis dari data pemeriksaan real
- Kalkulasi per Puskesmas secara otomatis
- Kategori DMF-T (Sangat Rendah, Rendah, Sedang, Tinggi, Sangat Tinggi)

### ✅ 7. Export Data ke CSV/Excel
- Export semua data pemeriksaan
- Format CSV siap dibuka di Excel
- Lengkap dengan header dan informasi

---

## 🚀 CARA MENGGUNAKAN UNTUK DEMO

### LANGKAH 1: Buka Halaman Katalog Diagnosa
1. Login ke aplikasi
2. Navigasi ke menu "Katalog Diagnosa"
3. Lihat 3 tombol baru di bagian atas:
   - **Input Data Pemeriksaan Gigi Real-time** (Hijau)
   - **Lihat Data Pemeriksaan** (Biru)
   - **Export Data Pemeriksaan** (Ungu)

### LANGKAH 2: Input Data Pasien Pertama
1. Klik tombol **"Input Data Pemeriksaan Gigi Real-time"**
2. Form akan terbuka dengan 4 section:
   
   **Section 1: Data Identitas Pasien**
   - NIK: `3579012345678901` (16 digit)
   - Nama: `Ahmad Rizki Pratama`
   - Tanggal Lahir: `2010-05-15`
   - Jenis Kelamin: `Laki-laki`
   - Alamat: `Jl. Mawar No. 12`
   - RT: `001`
   - RW: `005`
   - Kelurahan: `Kartoharjo`
   - Kecamatan: `Kartoharjo`

   **Section 2: Data Pemeriksaan Gigi**
   - Tanggal Pemeriksaan: (tanggal hari ini)
   - Puskesmas: `Puskesmas Kartoharjo`
   - D - Gigi Karies: `4`
   - M - Gigi Hilang: `1`
   - F - Gigi Ditambal: `2`
   - DMF-T Index: **7.00** (otomatis terhitung)

   **Section 3: Diagnosis & Tindakan**
   - Diagnosis: `Karies multipel, gingivitis ringan`
   - Tindakan Medis: `Edukasi sikat gigi, scaling, rujukan tambal gigi`

   **Section 4: Petugas & Lokasi**
   - Nama Petugas: `drg. Siti Nurhaliza`
   - Lokasi Pemeriksaan: `SD Negeri 1 Kartoharjo`

3. Klik **"Simpan Data Pemeriksaan"**
4. Alert sukses akan muncul!

### LANGKAH 3: Lihat Data yang Tersimpan
1. Klik tombol **"Lihat Data Pemeriksaan"**
2. Tabel akan muncul menampilkan data yang baru diinput
3. Perhatikan:
   - Data lengkap tersimpan
   - DMF-T sudah terhitung otomatis
   - Status default: **Draft**

### LANGKAH 4: Tambah Data Pasien Kedua
Input data pasien lain untuk menunjukkan variasi DMF-T:

**Pasien 2:**
- NIK: `3579087654321098`
- Nama: `Siti Aisyah Rahmawati`
- Tanggal Lahir: `2011-08-22`
- Jenis Kelamin: `Perempuan`
- Alamat: `Jl. Melati No. 45`
- RT: `003`, RW: `007`
- Kelurahan: `Taman`, Kecamatan: `Taman`
- Puskesmas: `Puskesmas Taman`
- D: `2`, M: `0`, F: `1` → DMF-T: **3.00**
- Diagnosis: `Karies ringan`
- Tindakan: `Aplikasi fluor, edukasi oral hygiene`
- Petugas: `drg. Bambang Suryanto`
- Lokasi: `TK Aisyiyah Bustanul Athfal`

### LANGKAH 5: Tambah Data Pasien Ketiga
**Pasien 3:**
- NIK: `3579011122334455`
- Nama: `Budi Santoso`
- Tanggal Lahir: `2009-03-10`
- Jenis Kelamin: `Laki-laki`
- Alamat: `Jl. Anggrek No. 8`
- RT: `002`, RW: `004`
- Kelurahan: `Manguharjo`, Kecamatan: `Manguharjo`
- Puskesmas: `Puskesmas Manguharjo`
- D: `6`, M: `2`, F: `1` → DMF-T: **9.00** (Kategori Tinggi!)
- Diagnosis: `Karies gigi anterior dan posterior, periodontitis`
- Tindakan: `Rujukan ke RSGM untuk perawatan lanjut`
- Petugas: `drg. Ratna Sari`
- Lokasi: `Posyandu Melati RW 04`

### LANGKAH 6: Test Validasi NIK Duplikat
1. Coba input data baru dengan NIK yang sama: `3579012345678901`
2. Ketika blur (klik keluar dari field NIK), akan muncul alert:
   **"⚠️ NIK sudah terdaftar! Pasien sudah pernah diperiksa."**
3. Ini menunjukkan validasi duplikasi berjalan!

### LANGKAH 7: Ubah Status Approval
1. Di tabel data pemeriksaan, lihat kolom **Status**
2. Klik dropdown status pada salah satu data
3. Ubah dari **Draft** → **Pending** → **Verified** → **Approved**
4. Perhatikan warna berubah:
   - Draft: Abu-abu
   - Pending: Kuning
   - Verified: Biru
   - Approved: Hijau

### LANGKAH 8: Lihat Update DMF-T Dashboard
1. Scroll ke atas ke Dashboard Monitoring CKG
2. Panel kanan **"Indeks DMF-T"** akan otomatis update!
3. Sekarang data bukan dummy lagi, tapi dari data pemeriksaan real yang diinput
4. Perhatikan:
   - Puskesmas Kartoharjo: DMF-T dari pasien 1
   - Puskesmas Taman: DMF-T dari pasien 2
   - Puskesmas Manguharjo: DMF-T dari pasien 3 (akan berwarna merah karena tinggi!)

### LANGKAH 9: Export Data
1. Klik tombol **"Export Data Pemeriksaan"** (ungu)
2. File CSV akan otomatis terdownload
3. Buka file dengan Excel untuk melihat data lengkap
4. Tunjukkan ke dosen bahwa data bisa diekspor untuk laporan

### LANGKAH 10: Edit Data
1. Klik tombol **Edit** (icon pensil) pada salah satu data
2. Form akan terbuka dengan data yang sudah terisi
3. Ubah beberapa nilai (misal: ubah jumlah D dari 4 menjadi 5)
4. Simpan → Data terupdate dan DMF-T otomatis recalculate

### LANGKAH 11: Hapus Data
1. Klik tombol **Hapus** (icon tempat sampah)
2. Konfirmasi penghapusan
3. Data hilang dari tabel
4. Dashboard DMF-T otomatis update

---

## 🎓 POIN PENTING SAAT PRESENTASI

### 1. Tekankan "Data Murni, Bukan Dummy"
- "Berbeda dengan data dummy yang statis, fitur ini memungkinkan input data pemeriksaan real-time"
- "Data yang diinput langsung mempengaruhi dashboard DMF-T"
- "Validasi NIK mencegah duplikasi data"

### 2. Sesuai Standar Kemenkes RI
- "Form mengikuti standar pemeriksaan kesehatan gigi Kemenkes"
- "DMF-T Index menggunakan rumus WHO/Kemenkes: D + M + F"
- "Kategori DMF-T sesuai pedoman: <1.2 (Sangat Rendah), 1.2-2.6 (Rendah), 2.7-4.4 (Sedang), 4.5-6.5 (Tinggi), >6.5 (Sangat Tinggi)"

### 3. Workflow Approval
- "Ada 4 level status: Draft → Pending → Verified → Approved"
- "Memungkinkan multi-level verification sebelum data final"
- "Meningkatkan kualitas dan akurabilitas data"

### 4. Tidak Perlu Backend (Untuk Demo)
- "Menggunakan localStorage untuk penyimpanan lokal"
- "Data tetap tersimpan meskipun refresh browser"
- "Mudah untuk demo tanpa perlu setup database"
- "Untuk produksi, tinggal ganti localStorage dengan API backend"

### 5. Export untuk Pelaporan
- "Data bisa diekspor ke CSV/Excel untuk laporan resmi"
- "Format standar yang mudah dibaca"
- "Siap untuk integrasi dengan sistem pelaporan Dinas Kesehatan"

---

## 🔥 DEMO FLOW YANG IMPRESSIVE

### Alur Demo 15 Menit:

**Menit 1-2: Pembukaan**
- "Saya akan mendemonstrasikan fitur Input Data Pemeriksaan CKG yang menghasilkan data murni"
- "Fitur ini mengatasi masalah data dummy dengan memungkinkan input data real-time"

**Menit 3-5: Input Data Pertama**
- Tunjukkan form lengkap dengan 4 section
- Input data pasien pertama secara live
- Tunjukkan kalkulasi DMF-T otomatis
- Simpan dan tunjukkan alert sukses

**Menit 6-7: Lihat Tabel Data**
- Buka tabel data pemeriksaan
- Jelaskan kolom-kolom penting
- Tunjukkan status approval

**Menit 8-10: Input Data Kedua & Ketiga**
- Input 2 data lagi dengan DMF-T berbeda
- Tunjukkan variasi data
- Tunjukkan validasi NIK duplikat (coba input NIK sama)

**Menit 11-12: Update Dashboard Real-time**
- Scroll ke dashboard DMF-T
- Tunjukkan data sudah berubah dari dummy menjadi real
- Jelaskan kategori DMF-T dan warna indikator

**Menit 13-14: Workflow & Export**
- Ubah status approval dari Draft → Approved
- Tunjukkan perubahan warna
- Export data ke CSV dan buka di Excel

**Menit 15: Kesimpulan**
- "Fitur ini menghasilkan data murni yang bisa langsung digunakan untuk monitoring CKG"
- "Sesuai standar Kemenkes, ada validasi, approval workflow, dan export untuk pelaporan"
- "Data tersimpan lokal untuk demo, tapi mudah diintegrasikan dengan backend untuk produksi"

---

## ✅ CHECKLIST SEBELUM DEMO

- [ ] Buka browser (Chrome/Edge recommended)
- [ ] Clear localStorage untuk mulai dari data kosong (F12 → Application → Local Storage → Clear)
- [ ] Login ke aplikasi
- [ ] Navigasi ke Katalog Diagnosa
- [ ] Siapkan data dummy untuk diinput (3 pasien)
- [ ] Test sekali sebelum presentasi
- [ ] Siapkan Excel untuk buka hasil export

---

## 🐛 TROUBLESHOOTING

### Jika data tidak tersimpan:
- Cek browser console (F12) untuk error
- Pastikan localStorage tidak diblok
- Coba refresh halaman

### Jika DMF-T tidak update:
- Data otomatis update setelah simpan
- Coba refresh halaman untuk reload data dari localStorage

### Jika export tidak jalan:
- Pastikan browser tidak memblokir download
- Cek folder Downloads

---

## 🎉 SELAMAT DEMO!

Fitur ini menunjukkan implementasi yang solid dari:
- Input data real-time
- Validasi data
- Approval workflow
- Export data
- Update dashboard otomatis
- Penyimpanan lokal (siap upgrade ke backend)

**Semua berjalan TANPA perlu backend/database**, cocok untuk demo!

Good luck untuk presentasi besok Senin! 🚀

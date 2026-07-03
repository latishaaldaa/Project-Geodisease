# 🚀 PANDUAN LENGKAP - Backend CKG GeoDisease

## 📦 File-file yang Sudah Dibuat

```
backend/
├── app.py                  # File utama Flask API
├── requirements.txt        # Dependencies Python
├── README.md              # Dokumentasi lengkap
├── install.bat            # Script instalasi Windows
├── run.bat                # Script menjalankan server
├── test_api.py            # Script testing API
├── add_sample_data.py     # Script tambah data sample
└── .gitignore             # Git ignore file
```

## ⚡ CARA INSTALASI & MENJALANKAN

### Step 1: Install Dependencies

Buka Command Prompt/PowerShell, masuk ke folder backend:

```bash
cd C:\Users\Asus\Documents\GeoDisease\backend
```

**Opsi A - Otomatis (Recommended):**
```bash
install.bat
```

**Opsi B - Manual:**
```bash
pip install -r requirements.txt
```

### Step 2: Jalankan Server Backend

**Opsi A - Otomatis:**
```bash
run.bat
```

**Opsi B - Manual:**
```bash
python app.py
```

Server akan berjalan di: **http://127.0.0.1:5000**

### Step 3: Jalankan Frontend React

Di terminal/CMD baru, masuk ke folder frontend:

```bash
cd C:\Users\Asus\Documents\GeoDisease\geo_disease
npm start
```

Frontend akan berjalan di: **http://localhost:3000**

---

## 🧪 Testing API

Untuk memastikan backend berfungsi dengan baik:

```bash
python test_api.py
```

Test ini akan mengecek semua endpoint API.

---

## 📊 Database Otomatis Terinisialisasi

Saat pertama kali menjalankan `python app.py`, database SQLite akan dibuat otomatis dengan data sample:

### ✅ Data DMF-T (5 Puskesmas)
- Puskesmas Madiun Kota: DMF-T 2.8 (Rendah)
- Puskesmas Taman: DMF-T 4.5 (Sedang)
- Puskesmas Kartoharjo: DMF-T 6.2 (Tinggi)
- Puskesmas Manguharjo: DMF-T 3.4 (Rendah)
- Puskesmas Oro-Oro Ombo: DMF-T 5.1 (Sedang)

### ✅ Program Intervensi CKG (3 Program)
- Program Sikat Gigi Massal SD
- Edukasi Kesehatan Gigi Remaja
- Pemeriksaan Gigi Gratis Lansia

### ✅ Aktivitas Tim (3 Aktivitas Hari Ini)
- Tim A - Pemeriksaan gigi siswa SD
- Tim B - Penyuluhan ibu hamil
- Tim C - Scaling dan pembersihan

---

## 🔄 Menambah Data Sample Lainnya

Jika ingin menambah lebih banyak data testing:

```bash
python add_sample_data.py
```

Pilih menu:
1. Data Penyakit Sample (Karies, Gingivitis, dll)
2. Update Data DMF-T
3. Program CKG Baru
4. Aktivitas Tim Hari Ini
5. Semua Data di Atas

---

## 📡 API Endpoints yang Tersedia

### 1. Penyakit (Katalog Diagnosa)

**GET** `/api/penyakit` - Ambil semua data penyakit
```bash
curl http://127.0.0.1:5000/api/penyakit
```

**POST** `/api/penyakit` - Tambah penyakit baru
```bash
curl -X POST http://127.0.0.1:5000/api/penyakit \
  -H "Content-Type: application/json" \
  -d '{
    "nama": "Karies Gigi",
    "kategori": "Gigi",
    "kode_icd": "K02",
    "tingkat_urgensi": "Normal",
    "tindakan_medis": "Tambal gigi"
  }'
```

**PUT** `/api/penyakit/<id>` - Update penyakit

**DELETE** `/api/penyakit/<id>` - Hapus penyakit

### 2. DMF-T Data

**GET** `/api/dmft` - Ambil data DMF-T semua wilayah
```bash
curl http://127.0.0.1:5000/api/dmft
```

**POST** `/api/dmft` - Update/Insert data DMF-T
```bash
curl -X POST http://127.0.0.1:5000/api/dmft \
  -H "Content-Type: application/json" \
  -d '{
    "wilayah": "Puskesmas Madiun Kota",
    "dmft_index": 2.5,
    "decayed": 1.0,
    "missing": 0.8,
    "filled": 0.7,
    "jumlah_pasien": 500,
    "kategori": "Rendah"
  }'
```

### 3. Program CKG

**GET** `/api/program-ckg` - Ambil semua program
```bash
curl http://127.0.0.1:5000/api/program-ckg
```

**POST** `/api/program-ckg` - Tambah program baru
```bash
curl -X POST http://127.0.0.1:5000/api/program-ckg \
  -H "Content-Type: application/json" \
  -d '{
    "nama_program": "Sikat Gigi Massal",
    "wilayah_target": "Puskesmas Taman",
    "status": "Berjalan",
    "tanggal_mulai": "2026-06-30",
    "target_dmft": "< 4.0"
  }'
```

### 4. Aktivitas Tim

**GET** `/api/aktivitas-tim` - Ambil aktivitas hari ini
```bash
curl http://127.0.0.1:5000/api/aktivitas-tim
```

**POST** `/api/aktivitas-tim` - Tambah aktivitas baru
```bash
curl -X POST http://127.0.0.1:5000/api/aktivitas-tim \
  -H "Content-Type: application/json" \
  -d '{
    "tim": "Tim A - Dr. Siti",
    "kegiatan": "Pemeriksaan gigi SD",
    "waktu": "08:30",
    "jumlah_pasien": 45,
    "wilayah": "Puskesmas Madiun Kota"
  }'
```

---

## 🗄️ Struktur Database (SQLite)

File database: `ckg_database.db` (dibuat otomatis)

### Table: `penyakit`
- id (PK), nama, kategori, deskripsi
- gambarUrl, linkArtikel, kode_icd
- tingkat_urgensi, tindakan_medis
- last_updated_by, created_at, updated_at

### Table: `dmft`
- id (PK), wilayah (unique)
- dmft_index, decayed, missing, filled
- jumlah_pasien, kategori, updated_at

### Table: `program_ckg`
- id (PK), nama_program, wilayah_target
- status, tanggal_mulai, target_dmft, created_at

### Table: `aktivitas_tim`
- id (PK), tim, kegiatan, waktu
- jumlah_pasien, wilayah, tanggal, created_at

---

## 🔧 Troubleshooting

### Error: "Python tidak ditemukan"
- Install Python dari: https://www.python.org/downloads/
- Pastikan checkbox "Add Python to PATH" dicentang saat instalasi

### Error: "pip tidak dikenali"
- Restart Command Prompt/PowerShell
- Atau gunakan: `python -m pip install -r requirements.txt`

### Error: "Port 5000 sudah digunakan"
- Matikan aplikasi lain yang menggunakan port 5000
- Atau ubah port di `app.py` baris terakhir: `app.run(port=5001)`

### Error: "CORS policy"
- CORS sudah diatasi dengan Flask-CORS
- Pastikan backend berjalan di http://127.0.0.1:5000

### Frontend tidak terhubung ke backend
- Pastikan backend sudah berjalan terlebih dahulu
- Cek console browser untuk error network
- Verifikasi URL di KatalogDiagnosa.js: `http://127.0.0.1:5000`

---

## 📝 Catatan Penting

### ✅ Fitur yang Sudah Berfungsi:
- CRUD Penyakit (Create, Read, Update, Delete)
- Real-time monitoring DMF-T per wilayah
- Tracking Program Intervensi CKG
- Monitoring Aktivitas Tim Kesehatan
- Auto-refresh data setiap 10-15 detik di frontend

### 🔄 Auto-Refresh Intervals:
- DMF-T Data: 10 detik
- Program CKG: 15 detik
- Aktivitas Tim: 15 detik

### 📊 Database Realtime:
- Setiap CRUD di frontend langsung update database
- Tidak ada data mock/simulasi
- Semua data dari SQLite database

---

## 🎯 Cara Menggunakan System

1. **Jalankan Backend** (port 5000)
2. **Jalankan Frontend** (port 3000)
3. **Buka Browser**: http://localhost:3000
4. **Login sebagai User/Admin**
5. **Buka halaman Katalog Diagnosa**
6. **Data akan muncul otomatis dari database**

### Fitur Frontend yang Tersedia:
- ✅ 3 Panel monitoring real-time
- ✅ Tambah/Edit/Hapus penyakit
- ✅ Filter penyakit (Semua/Wabah/Normal)
- ✅ Search penyakit berdasarkan nama/kode ICD
- ✅ Monitoring DMF-T dengan breakdown D-M-F
- ✅ Kontak cepat koordinator Puskesmas via WhatsApp
- ✅ Tracking program intervensi CKG
- ✅ Monitoring aktivitas tim lapangan

---

## 🆘 Support

Jika ada masalah teknis:
1. Cek apakah backend dan frontend sudah berjalan
2. Jalankan `python test_api.py` untuk test koneksi
3. Cek console browser (F12) untuk error
4. Cek terminal backend untuk error log

---

## 📞 Quick Commands

```bash
# Install dependencies
cd backend
pip install -r requirements.txt

# Run backend
python app.py

# Test API
python test_api.py

# Add sample data
python add_sample_data.py

# Run frontend (terminal baru)
cd ../geo_disease
npm start
```

---

✅ **Backend SIAP DIGUNAKAN!**

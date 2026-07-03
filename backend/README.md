# Backend CKG (Cek Kesehatan Gigi) - GeoDisease System

Backend API untuk sistem monitoring kesehatan gigi berbasis wilayah menggunakan Flask dan SQLite.

## 📋 Fitur

- ✅ CRUD Penyakit (Katalog Diagnosa)
- ✅ Monitoring DMF-T (Decayed, Missing, Filled-Teeth) per Wilayah
- ✅ Manajemen Program Intervensi CKG
- ✅ Tracking Aktivitas Tim Kesehatan Lapangan
- ✅ RESTful API dengan CORS enabled
- ✅ Database SQLite (mudah dipindahkan)

## 🚀 Cara Menjalankan

### 1. Install Python Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 2. Jalankan Server

```bash
python app.py
```

Server akan berjalan di: `http://127.0.0.1:5000`

### 3. Database Otomatis Terinisialisasi

Saat pertama kali dijalankan, database SQLite akan dibuat otomatis dengan data sample:
- 5 Wilayah Puskesmas dengan data DMF-T
- 3 Program Intervensi CKG aktif
- 3 Aktivitas tim kesehatan hari ini

## 📡 API Endpoints

### Penyakit (Katalog Diagnosa)

- `GET /api/penyakit` - Ambil semua data penyakit
- `POST /api/penyakit` - Tambah penyakit baru
- `PUT /api/penyakit/<id>` - Update penyakit
- `DELETE /api/penyakit/<id>` - Hapus penyakit

### DMF-T Data

- `GET /api/dmft` - Ambil data DMF-T semua wilayah
- `POST /api/dmft` - Update/Insert data DMF-T wilayah

### Program CKG

- `GET /api/program-ckg` - Ambil semua program intervensi
- `POST /api/program-ckg` - Tambah program baru

### Aktivitas Tim

- `GET /api/aktivitas-tim` - Ambil aktivitas tim hari ini
- `POST /api/aktivitas-tim` - Tambah aktivitas baru

### Utility

- `GET /` - Health check server
- `POST /api/fetch-metadata` - Fetch metadata artikel (mock)

## 🗄️ Struktur Database

### Table: `penyakit`
- id, nama, kategori, deskripsi, gambarUrl, linkArtikel
- kode_icd, tingkat_urgensi, tindakan_medis, last_updated_by
- created_at, updated_at

### Table: `dmft`
- id, wilayah, dmft_index, decayed, missing, filled
- jumlah_pasien, kategori, updated_at

### Table: `program_ckg`
- id, nama_program, wilayah_target, status
- tanggal_mulai, target_dmft, created_at

### Table: `aktivitas_tim`
- id, tim, kegiatan, waktu, jumlah_pasien
- wilayah, tanggal, created_at

## 🔧 Konfigurasi

File database SQLite: `ckg_database.db` (dibuat otomatis)

CORS enabled untuk semua origin (development mode)

## 📝 Contoh Request

### Tambah Penyakit Baru

```json
POST /api/penyakit
{
  "nama": "Karies Gigi",
  "kategori": "Gigi",
  "deskripsi": "Kerusakan struktur gigi",
  "kode_icd": "K02",
  "tingkat_urgensi": "Normal",
  "tindakan_medis": "Tambal gigi atau pencabutan"
}
```

### Update Data DMF-T

```json
POST /api/dmft
{
  "wilayah": "Puskesmas Madiun Kota",
  "dmft_index": 2.5,
  "decayed": 1.0,
  "missing": 0.8,
  "filled": 0.7,
  "jumlah_pasien": 500,
  "kategori": "Rendah"
}
```

## 🛡️ Keamanan

⚠️ Backend ini untuk development/demo. Untuk production:
- Tambahkan authentication (JWT/OAuth)
- Gunakan database production (PostgreSQL/MySQL)
- Tambahkan input validation
- Enable HTTPS
- Rate limiting

## 📞 Support

Untuk pertanyaan teknis, hubungi tim developer.

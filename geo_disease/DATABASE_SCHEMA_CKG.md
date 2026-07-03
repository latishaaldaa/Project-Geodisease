# 🗄️ SKEMA DATABASE RIIL UNTUK PROGRAM CKG
## Arsitektur Data Real-time & Non-Dummy

---

## 📊 DIAGRAM STRUKTUR DATABASE

```
┌─────────────────────────┐
│      PUSKESMAS          │
├─────────────────────────┤
│ id (PK)                 │
│ nama_puskesmas          │
│ kecamatan               │
│ alamat                  │
│ telepon                 │
│ koordinator             │
└─────────────────────────┘
           │
           │ 1:N
           ▼
┌─────────────────────────┐
│     PASIEN_ANAK         │
├─────────────────────────┤
│ id (PK)                 │
│ nik                     │
│ nama_lengkap            │
│ tanggal_lahir           │
│ jenis_kelamin           │
│ alamat                  │
│ rt, rw                  │
│ kelurahan               │
│ kecamatan               │
│ nama_ortu               │
└─────────────────────────┘
           │
           │ 1:N
           ▼
┌─────────────────────────┐
│  PEMERIKSAAN_GIGI       │
├─────────────────────────┤
│ id (PK)                 │
│ pasien_id (FK)          │
│ puskesmas_id (FK)       │
│ tanggal_pemeriksaan     │
│ nilai_d (karies)        │
│ nilai_m (hilang)        │
│ nilai_f (tambal)        │
│ dmft_total (calculated) │
│ diagnosis               │
│ tindakan                │
│ petugas_nama            │
│ lokasi_pemeriksaan      │
│ status_verifikasi       │
│ created_at              │
│ updated_at              │
└─────────────────────────┘
           │
           │ 1:N
           ▼
┌─────────────────────────┐
│   PROGRAM_INTERVENSI    │
├─────────────────────────┤
│ id (PK)                 │
│ puskesmas_id (FK)       │
│ nama_program            │
│ wilayah_target          │
│ tanggal_mulai           │
│ tanggal_selesai         │
│ target_peserta          │
│ realisasi_peserta       │
│ target_dmft             │
│ status                  │
│ anggaran                │
│ deskripsi               │
└─────────────────────────┘

┌─────────────────────────┐
│   AKTIVITAS_TIM         │
├─────────────────────────┤
│ id (PK)                 │
│ puskesmas_id (FK)       │
│ nama_tim                │
│ kegiatan                │
│ lokasi                  │
│ latitude                │
│ longitude               │
│ jumlah_pasien_diperiksa │
│ waktu_mulai             │
│ waktu_selesai           │
│ status                  │
│ created_at              │
└─────────────────────────┘

┌─────────────────────────┐
│   STATISTIK_DMFT        │ (VIEW/MATERIALIZED)
├─────────────────────────┤
│ puskesmas_id            │
│ nama_puskesmas          │
│ total_pasien            │
│ rata_rata_d             │
│ rata_rata_m             │
│ rata_rata_f             │
│ dmft_index              │
│ kategori (RENDAH/SEDANG/TINGGI) │
│ last_updated            │
└─────────────────────────┘
```

---

## 📝 SQL SCHEMA (PostgreSQL/MySQL)

### 1. Tabel PUSKESMAS
```sql
CREATE TABLE puskesmas (
    id SERIAL PRIMARY KEY,
    nama_puskesmas VARCHAR(200) NOT NULL,
    kecamatan VARCHAR(100) NOT NULL,
    alamat TEXT,
    telepon VARCHAR(20),
    koordinator VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Data Seed
INSERT INTO puskesmas (nama_puskesmas, kecamatan, telepon, koordinator) VALUES
('Puskesmas Kartoharjo', 'Kartoharjo', '0351123456', 'drg. Siti Nurhaliza'),
('Puskesmas Taman', 'Taman', '0351234567', 'drg. Bambang Suryanto'),
('Puskesmas Manguharjo', 'Manguharjo', '0351345678', 'drg. Ratna Sari'),
('Puskesmas Madiun Kota', 'Madiun Kota', '0351456789', 'drg. Ahmad Fauzi'),
('Puskesmas Oro-Oro Ombo', 'Oro-Oro Ombo', '0351567890', 'drg. Dewi Lestari');
```

### 2. Tabel PASIEN_ANAK
```sql
CREATE TABLE pasien_anak (
    id SERIAL PRIMARY KEY,
    nik VARCHAR(16) UNIQUE NOT NULL,
    nama_lengkap VARCHAR(200) NOT NULL,
    tanggal_lahir DATE NOT NULL,
    jenis_kelamin ENUM('L', 'P') NOT NULL,
    alamat TEXT,
    rt VARCHAR(5),
    rw VARCHAR(5),
    kelurahan VARCHAR(100),
    kecamatan VARCHAR(100),
    nama_ortu VARCHAR(200),
    telepon_ortu VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_nik (nik)
);
```

### 3. Tabel PEMERIKSAAN_GIGI (Inti Data DMF-T)
```sql
CREATE TABLE pemeriksaan_gigi (
    id SERIAL PRIMARY KEY,
    pasien_id INT NOT NULL,
    puskesmas_id INT NOT NULL,
    tanggal_pemeriksaan DATE NOT NULL,
    
    -- Komponen DMF-T
    nilai_d INT DEFAULT 0 COMMENT 'Decayed - Gigi Karies',
    nilai_m INT DEFAULT 0 COMMENT 'Missing - Gigi Hilang',
    nilai_f INT DEFAULT 0 COMMENT 'Filled - Gigi Ditambal',
    dmft_total DECIMAL(5,2) GENERATED ALWAYS AS (nilai_d + nilai_m + nilai_f) STORED,
    
    diagnosis TEXT,
    tindakan TEXT,
    petugas_nama VARCHAR(100) NOT NULL,
    lokasi_pemeriksaan VARCHAR(200),
    
    status_verifikasi ENUM('draft', 'pending', 'verified', 'approved') DEFAULT 'draft',
    verified_by INT,
    verified_at TIMESTAMP NULL,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (pasien_id) REFERENCES pasien_anak(id) ON DELETE CASCADE,
    FOREIGN KEY (puskesmas_id) REFERENCES puskesmas(id) ON DELETE CASCADE,
    
    INDEX idx_puskesmas (puskesmas_id),
    INDEX idx_tanggal (tanggal_pemeriksaan),
    INDEX idx_status (status_verifikasi)
);
```

### 4. Tabel PROGRAM_INTERVENSI
```sql
CREATE TABLE program_intervensi (
    id SERIAL PRIMARY KEY,
    puskesmas_id INT NOT NULL,
    nama_program VARCHAR(200) NOT NULL,
    wilayah_target VARCHAR(100),
    tanggal_mulai DATE NOT NULL,
    tanggal_selesai DATE,
    target_peserta INT DEFAULT 0,
    realisasi_peserta INT DEFAULT 0,
    target_dmft DECIMAL(4,2),
    status ENUM('perencanaan', 'berjalan', 'selesai', 'ditunda') DEFAULT 'perencanaan',
    anggaran DECIMAL(15,2),
    deskripsi TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (puskesmas_id) REFERENCES puskesmas(id) ON DELETE CASCADE,
    INDEX idx_status (status),
    INDEX idx_tanggal (tanggal_mulai)
);
```

### 5. Tabel AKTIVITAS_TIM
```sql
CREATE TABLE aktivitas_tim (
    id SERIAL PRIMARY KEY,
    puskesmas_id INT NOT NULL,
    nama_tim VARCHAR(100) NOT NULL,
    kegiatan TEXT NOT NULL,
    lokasi VARCHAR(200),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    jumlah_pasien_diperiksa INT DEFAULT 0,
    waktu_mulai DATETIME NOT NULL,
    waktu_selesai DATETIME,
    status ENUM('berlangsung', 'selesai') DEFAULT 'berlangsung',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (puskesmas_id) REFERENCES puskesmas(id) ON DELETE CASCADE,
    INDEX idx_waktu (waktu_mulai),
    INDEX idx_status (status)
);
```

### 6. VIEW untuk Statistik DMF-T Real-time
```sql
CREATE VIEW v_statistik_dmft AS
SELECT 
    p.id AS puskesmas_id,
    p.nama_puskesmas,
    p.kecamatan,
    COUNT(DISTINCT pg.pasien_id) AS total_pasien,
    
    -- Rata-rata komponen DMF-T
    ROUND(AVG(pg.nilai_d), 2) AS rata_rata_d,
    ROUND(AVG(pg.nilai_m), 2) AS rata_rata_m,
    ROUND(AVG(pg.nilai_f), 2) AS rata_rata_f,
    
    -- Indeks DMF-T
    ROUND(AVG(pg.dmft_total), 2) AS dmft_index,
    
    -- Kategori Otomatis
    CASE 
        WHEN AVG(pg.dmft_total) < 2.6 THEN 'RENDAH'
        WHEN AVG(pg.dmft_total) BETWEEN 2.6 AND 4.4 THEN 'SEDANG'
        WHEN AVG(pg.dmft_total) > 4.4 THEN 'TINGGI'
        ELSE 'BELUM ADA DATA'
    END AS kategori,
    
    MAX(pg.updated_at) AS last_updated
FROM 
    puskesmas p
LEFT JOIN 
    pemeriksaan_gigi pg ON p.id = pg.puskesmas_id
WHERE 
    pg.status_verifikasi IN ('verified', 'approved')
    AND pg.tanggal_pemeriksaan >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
GROUP BY 
    p.id, p.nama_puskesmas, p.kecamatan
ORDER BY 
    dmft_index DESC;
```

---

## 🔄 TRIGGER UNTUK AUTO-UPDATE

### Trigger: Update timestamp otomatis
```sql
-- PostgreSQL
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_pemeriksaan_modtime
BEFORE UPDATE ON pemeriksaan_gigi
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();
```

---

## 📊 QUERY PENTING UNTUK DASHBOARD

### 1. Get DMF-T per Puskesmas dengan Kategori
```sql
SELECT * FROM v_statistik_dmft;
```

### 2. Get Program Intervensi Aktif
```sql
SELECT 
    pi.*,
    p.nama_puskesmas,
    p.kecamatan
FROM program_intervensi pi
JOIN puskesmas p ON pi.puskesmas_id = p.id
WHERE pi.status = 'berjalan'
ORDER BY pi.tanggal_mulai DESC
LIMIT 10;
```

### 3. Get Aktivitas Tim Hari Ini
```sql
SELECT 
    at.*,
    p.nama_puskesmas
FROM aktivitas_tim at
JOIN puskesmas p ON at.puskesmas_id = p.id
WHERE DATE(at.waktu_mulai) = CURDATE()
ORDER BY at.waktu_mulai DESC;
```

### 4. Get Detail DMF-T dengan Breakdown
```sql
SELECT 
    p.nama_puskesmas,
    COUNT(DISTINCT pg.pasien_id) AS total_pasien,
    AVG(pg.nilai_d) AS avg_karies,
    AVG(pg.nilai_m) AS avg_hilang,
    AVG(pg.nilai_f) AS avg_tambal,
    AVG(pg.dmft_total) AS dmft_index,
    CASE 
        WHEN AVG(pg.dmft_total) < 2.6 THEN 'RENDAH'
        WHEN AVG(pg.dmft_total) BETWEEN 2.6 AND 4.4 THEN 'SEDANG'
        ELSE 'TINGGI'
    END AS kategori
FROM puskesmas p
LEFT JOIN pemeriksaan_gigi pg ON p.id = pg.puskesmas_id
WHERE pg.status_verifikasi = 'approved'
GROUP BY p.id, p.nama_puskesmas;
```

---

## 🎯 LOGIKA KALKULASI DMF-T

### Rumus DMF-T (Sesuai Standar WHO/Kemenkes):
```
DMF-T = D + M + F

Dimana:
- D (Decayed)  = Jumlah gigi dengan karies (berlubang)
- M (Missing)  = Jumlah gigi yang hilang/dicabut
- F (Filled)   = Jumlah gigi yang sudah ditambal

Kategori:
- RENDAH:  DMF-T < 2.6
- SEDANG:  DMF-T 2.6 - 4.4  
- TINGGI:  DMF-T > 4.4
```

### Implementasi di Database:
- **GENERATED COLUMN**: `dmft_total` dihitung otomatis dari nilai_d + nilai_m + nilai_f
- **VIEW**: `v_statistik_dmft` menghitung rata-rata per Puskesmas dan menentukan kategori otomatis
- **NO MANUAL CALCULATION**: Semua otomatis di database level

---

## 💡 KEUNTUNGAN ARSITEKTUR INI

1. ✅ **Data Real-time**: Setiap input pemeriksaan langsung update dashboard
2. ✅ **No Dummy Data**: Semua data dari input petugas lapangan
3. ✅ **Auto-calculation**: DMF-T dan kategori dihitung otomatis
4. ✅ **Scalable**: Bisa handle ribuan pemeriksaan
5. ✅ **Audit Trail**: Semua data ada timestamp created/updated
6. ✅ **Relational**: Foreign key untuk data integrity
7. ✅ **Optimized**: Index untuk query cepat
8. ✅ **Flexible**: Mudah tambah fitur baru

---

## 📌 NEXT STEPS

Setelah database schema ini:
1. Buat API endpoints (lihat file `API_ENDPOINTS_CKG.md`)
2. Refactor frontend untuk consume API ini
3. Migrate data dummy ke data real

**File berikutnya**: API Endpoints & Backend Logic

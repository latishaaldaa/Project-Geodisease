# 🚀 PANDUAN UNTUK ORANG YANG MELAKUKAN DEPLOYMENT
# Dibuat: 5 Juli 2026

---

## ⚠️ PENTING - BACA INI DULU!

File ini berisi panduan lengkap untuk **orang yang akan melakukan deployment ke Docker hosting**. 
Aplikasi mengalami error karena struktur database MySQL di hosting tidak sesuai dengan kode aplikasi.

**Error yang terjadi:**
```
(pymysql.err.OperationalError) (1054, "Unknown column 'user.name' in 'field list'")
```

---

## 📋 YANG SUDAH DISIAPKAN

Semua file sudah siap, tinggal ikuti langkah-langkah di bawah:

1. ✅ `backend/app.py` - Sudah diupdate support MySQL
2. ✅ `backend/requirements.txt` - Sudah include PyMySQL, gunicorn, python-dotenv
3. ✅ `backend/migration_add_columns.sql` - Script SQL untuk fix database
4. ✅ `backend/.env` - Template konfigurasi (HARUS DIISI!)
5. ✅ `backend/Dockerfile` - Sudah siap
6. ✅ `docker-compose.yml` - Sudah siap (opsional)

---

## 🔧 LANGKAH-LANGKAH DEPLOYMENT

### **LANGKAH 1: FIX DATABASE MYSQL** ⭐ PALING PENTING!

Login ke **phpMyAdmin** atau MySQL client di hosting, pilih database yang dipakai, lalu:

1. Klik tab **SQL**
2. Copy-paste isi file `backend/migration_add_columns.sql` 
3. Atau jalankan SQL ini:

```sql
-- CEK STRUKTUR TABEL DULU
DESCRIBE user;

-- JIKA KOLOM nama_instansi ADA, JALANKAN OPSI A:
ALTER TABLE user CHANGE COLUMN nama_instansi name VARCHAR(200) NOT NULL;
ALTER TABLE user ADD COLUMN google_id VARCHAR(200) NULL AFTER role;
ALTER TABLE user ADD COLUMN picture VARCHAR(500) NULL AFTER google_id;
ALTER TABLE user ADD COLUMN created_at DATETIME DEFAULT CURRENT_TIMESTAMP AFTER picture;

-- JIKA KOLOM nama_instansi TIDAK ADA, JALANKAN OPSI B:
-- ALTER TABLE user ADD COLUMN name VARCHAR(200) NOT NULL DEFAULT 'User' AFTER id;
-- ALTER TABLE user ADD COLUMN google_id VARCHAR(200) NULL AFTER role;
-- ALTER TABLE user ADD COLUMN picture VARCHAR(500) NULL AFTER google_id;
-- ALTER TABLE user ADD COLUMN created_at DATETIME DEFAULT CURRENT_TIMESTAMP AFTER picture;

-- VERIFIKASI HASILNYA
DESCRIBE user;
```

**HASIL YANG DIHARAPKAN setelah migration:**
```
+-------------+--------------+------+-----+-------------------+
| Field       | Type         | Null | Key | Default           |
+-------------+--------------+------+-----+-------------------+
| id          | int          | NO   | PRI | NULL              |
| name        | varchar(200) | NO   |     | NULL              |
| email       | varchar(200) | NO   | UNI | NULL              |
| password    | varchar(500) | YES  |     | NULL              |
| role        | varchar(50)  | YES  |     | NULL              |
| google_id   | varchar(200) | YES  |     | NULL              |
| picture     | varchar(500) | YES  |     | NULL              |
| created_at  | datetime     | YES  |     | CURRENT_TIMESTAMP |
+-------------+--------------+------+-----+-------------------+
```

---

### **LANGKAH 2: ISI FILE .env DI BACKEND**

Edit file `backend/.env` dan isi dengan kredensial MySQL hosting:

```env
# GANTI DENGAN KREDENSIAL MYSQL HOSTING YANG SEBENARNYA!
DATABASE_URL=mysql+pymysql://USERNAME:PASSWORD@HOSTNAME:3306/DATABASE_NAME

# Contoh nyata:
# DATABASE_URL=mysql+pymysql://geodisease_user:SecurePass123@mysql.hosting.com:3306/geodisease_db

# Jika MySQL di localhost (hosting yang sama):
# DATABASE_URL=mysql+pymysql://root:password@localhost:3306/geodisease_db
```

**Cara mendapatkan kredensial MySQL:**
- Login ke **cPanel** atau **Plesk** hosting
- Cari menu **MySQL Databases** atau **Databases**
- Catat:
  - Username MySQL
  - Password MySQL (buat user baru jika perlu)
  - Hostname MySQL (biasanya: `localhost` atau `mysql.namahosting.com`)
  - Nama Database

**⚠️ PENTING:** 
- Pastikan user MySQL punya akses penuh ke database
- Test koneksi MySQL dulu sebelum deploy Docker

---

### **LANGKAH 3: BUILD & DEPLOY DOCKER**

#### **OPSI A: Deploy Backend Saja**

```bash
# Masuk ke folder backend
cd backend

# Build Docker image
docker build -t geodisease-backend .

# Stop container lama jika ada
docker stop geodisease-backend 2>/dev/null || true
docker rm geodisease-backend 2>/dev/null || true

# Run container baru
docker run -d \
  --name geodisease-backend \
  -p 5000:5000 \
  --env-file .env \
  --restart unless-stopped \
  geodisease-backend

# Cek log untuk memastikan tidak ada error
docker logs geodisease-backend
```

#### **OPSI B: Deploy Backend + Frontend (Docker Compose)**

Edit `docker-compose.yml` di root folder, set `DATABASE_URL` yang benar, lalu:

```bash
# Build dan run semua services
docker-compose up -d --build

# Cek log
docker-compose logs -f backend
```

---

### **LANGKAH 4: VERIFIKASI DEPLOYMENT**

#### 4.1. Cek Backend Running

```bash
# Test health check
curl http://localhost:5000/

# Atau di browser:
# http://IP_HOSTING:5000/
```

**Response yang diharapkan:**
```json
{
  "status": "Server CKG Backend Running",
  "version": "1.0",
  "timestamp": "2026-07-05T..."
}
```

#### 4.2. Test Registrasi User

```bash
curl -X POST http://localhost:5000/api/register \
  -H "Content-Type: application/json" \
  -d '{
    "nama": "Test User Deploy",
    "email": "testdeploy@example.com",
    "password": "test12345",
    "role": "user"
  }'
```

**Response sukses:**
```json
{
  "success": true,
  "message": "..."
}
```

#### 4.3. Test Login

```bash
curl -X POST http://localhost:5000/api/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testdeploy@example.com",
    "password": "test12345"
  }'
```

#### 4.4. Cek Data di Database

Login ke phpMyAdmin dan jalankan:
```sql
SELECT * FROM user ORDER BY created_at DESC LIMIT 5;
```

Seharusnya ada data user baru yang tadi didaftarkan.

---

## 🐛 TROUBLESHOOTING

### Error: "Access denied for user"
**Penyebab:** Username atau password MySQL salah
**Solusi:** 
- Cek kredensial di `.env`
- Test koneksi MySQL manual: `mysql -u username -p -h hostname database_name`

### Error: "Can't connect to MySQL server"
**Penyebab:** Hostname atau port salah, atau firewall blocking
**Solusi:**
- Cek hostname (biasanya `localhost` atau IP hosting)
- Cek port (default: 3306)
- Pastikan MySQL service running: `systemctl status mysql`
- Cek firewall: `ufw allow 3306` (jika diperlukan)

### Error: "Unknown database"
**Penyebab:** Database belum dibuat
**Solusi:**
```sql
CREATE DATABASE geodisease_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### Error: "Unknown column 'user.name'"
**Penyebab:** Migration SQL belum dijalankan
**Solusi:** Kembali ke LANGKAH 1, jalankan migration SQL

### Error: "Table 'user' doesn't exist"
**Penyebab:** Tabel belum dibuat
**Solusi:** Jalankan file SQL dump lengkap yang diberikan, atau biarkan Flask create tables otomatis saat pertama kali run

### Container terus restart
**Penyebab:** Biasanya error koneksi database
**Solusi:**
```bash
# Cek log error
docker logs geodisease-backend

# Stop container
docker stop geodisease-backend

# Test koneksi manual dari host
mysql -u username -p -h hostname database_name
```

---

## 📝 CHECKLIST DEPLOYMENT

Centang setiap langkah yang sudah selesai:

**Persiapan Database:**
- [ ] Login ke phpMyAdmin/MySQL client
- [ ] Jalankan migration SQL (`migration_add_columns.sql`)
- [ ] Verifikasi struktur tabel dengan `DESCRIBE user;`
- [ ] Pastikan kolom `name`, `google_id`, `picture`, `created_at` sudah ada

**Konfigurasi Backend:**
- [ ] Edit file `backend/.env`
- [ ] Isi `DATABASE_URL` dengan kredensial MySQL yang benar
- [ ] Test koneksi MySQL dari terminal/command line

**Docker Deployment:**
- [ ] Build Docker image: `docker build -t geodisease-backend .`
- [ ] Run container dengan env file: `docker run -d --name geodisease-backend -p 5000:5000 --env-file .env geodisease-backend`
- [ ] Cek container running: `docker ps`
- [ ] Cek log tidak ada error: `docker logs geodisease-backend`

**Testing:**
- [ ] Test endpoint health: `curl http://localhost:5000/`
- [ ] Test registrasi user baru
- [ ] Test login dengan user yang baru dibuat
- [ ] Cek data di database MySQL
- [ ] Test dari frontend (browser)

**Cleanup (jika ada masalah):**
- [ ] Stop container: `docker stop geodisease-backend`
- [ ] Remove container: `docker rm geodisease-backend`
- [ ] Remove image: `docker rmi geodisease-backend`
- [ ] Rebuild dari awal

---

## 📞 KONTAK

Jika ada masalah atau error yang tidak bisa diselesaikan:
1. Screenshot error yang muncul
2. Copy log dari `docker logs geodisease-backend`
3. Screenshot hasil `DESCRIBE user;` dari database
4. Kirim ke developer untuk troubleshooting

---

## 🎯 RINGKASAN SINGKAT (TL;DR)

```bash
# 1. Fix database (di phpMyAdmin)
# Jalankan: migration_add_columns.sql

# 2. Edit backend/.env
DATABASE_URL=mysql+pymysql://user:pass@host:3306/dbname

# 3. Deploy
cd backend
docker build -t geodisease-backend .
docker run -d --name geodisease-backend -p 5000:5000 --env-file .env geodisease-backend

# 4. Test
curl http://localhost:5000/
```

---

**Good luck! 🚀**

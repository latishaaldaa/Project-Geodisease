# Quick Start - Deployment ke Hosting dengan MySQL

## Ringkasan Masalah
Error saat registrasi: `Unknown column 'user.name' in 'field list'`

**Penyebab:** Database MySQL di hosting tidak memiliki kolom `name`, `google_id`, `picture`, dan `created_at` yang dibutuhkan oleh aplikasi Flask.

---

## Solusi Cepat (3 Langkah)

### 1️⃣ Update Database MySQL di Hosting

Login ke phpMyAdmin atau MySQL client di hosting Anda, pilih database yang digunakan, lalu jalankan SQL berikut:

```sql
-- PILIHAN A: Ubah nama_instansi menjadi name
ALTER TABLE user CHANGE COLUMN nama_instansi name VARCHAR(200) NOT NULL;
ALTER TABLE user ADD COLUMN google_id VARCHAR(200) NULL AFTER role;
ALTER TABLE user ADD COLUMN picture VARCHAR(500) NULL AFTER google_id;
ALTER TABLE user ADD COLUMN created_at DATETIME DEFAULT CURRENT_TIMESTAMP AFTER picture;

-- ATAU PILIHAN B: Tambah kolom name baru (jika ingin tetap pakai nama_instansi)
-- ALTER TABLE user ADD COLUMN name VARCHAR(200) NOT NULL DEFAULT '' AFTER id;
-- ALTER TABLE user ADD COLUMN google_id VARCHAR(200) NULL AFTER role;
-- ALTER TABLE user ADD COLUMN picture VARCHAR(500) NULL AFTER google_id;
-- ALTER TABLE user ADD COLUMN created_at DATETIME DEFAULT CURRENT_TIMESTAMP AFTER picture;
-- UPDATE user SET name = nama_instansi WHERE name = '';
```

### 2️⃣ Konfigurasi Database URL

Edit file `backend/.env` dan set DATABASE_URL sesuai kredensial MySQL hosting:

```env
DATABASE_URL=mysql+pymysql://username:password@hostname:3306/database_name
```

**Contoh:**
```env
DATABASE_URL=mysql+pymysql://myuser:mypass123@mysql.hosting.com:3306/geodisease_db
```

### 3️⃣ Deploy Ulang dengan Docker

```bash
# Masuk ke direktori backend
cd backend

# Build image baru
docker build -t geodisease-backend .

# Stop container lama (jika ada)
docker stop geodisease-backend
docker rm geodisease-backend

# Run container baru dengan environment variable
docker run -d \
  --name geodisease-backend \
  -p 5000:5000 \
  -e DATABASE_URL="mysql+pymysql://username:password@hostname:3306/database_name" \
  geodisease-backend
```

**ATAU** gunakan Docker Compose (lebih mudah):

```bash
# Edit docker-compose.yml dulu, set DATABASE_URL yang benar
# Lalu jalankan:
docker-compose up -d --build
```

---

## Verifikasi

1. **Cek struktur database sudah benar:**
```sql
DESCRIBE user;
```

Harus ada kolom: `id`, `name`, `email`, `password`, `role`, `google_id`, `picture`, `created_at`

2. **Test backend health:**
```bash
curl http://your-backend-url:5000/
```

3. **Test registrasi:**
```bash
curl -X POST http://your-backend-url:5000/api/register \
  -H "Content-Type: application/json" \
  -d '{"nama":"Test User","email":"test@test.com","password":"pass123","role":"user"}'
```

---

## File-File yang Sudah Disiapkan

- ✅ `backend/migration_add_columns.sql` - Script SQL untuk update tabel
- ✅ `backend/.env` - Template konfigurasi database
- ✅ `backend/.env.example` - Contoh konfigurasi
- ✅ `backend/app.py` - Sudah diupdate support MySQL
- ✅ `backend/requirements.txt` - Sudah include PyMySQL, gunicorn
- ✅ `docker-compose.yml` - Untuk deploy frontend + backend sekaligus
- ✅ `PANDUAN_DEPLOYMENT_MYSQL.md` - Dokumentasi lengkap

---

## Troubleshooting Cepat

| Error | Solusi |
|-------|--------|
| "Access denied for user" | Periksa username/password di DATABASE_URL |
| "Can't connect to MySQL server" | Periksa hostname dan port (3306) |
| "Unknown database" | Database belum dibuat, buat dulu: `CREATE DATABASE geodisease_db;` |
| "Unknown column" | Migration SQL belum dijalankan, jalankan script `migration_add_columns.sql` |

---

Untuk dokumentasi lengkap, lihat `PANDUAN_DEPLOYMENT_MYSQL.md`

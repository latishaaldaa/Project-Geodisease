# Panduan Deployment dengan MySQL

## Masalah yang Terjadi

Error: `(pymysql.err.OperationalError) (1054, "Unknown column 'user.name' in 'field list'")`

**Penyebab:** Database MySQL di hosting memiliki struktur tabel `user` yang berbeda dengan model Flask SQLAlchemy di kode backend.

### Struktur Tabel Saat Ini (di Hosting):
- id
- email
- password
- role
- nama_instansi

### Struktur Tabel yang Dibutuhkan:
- id
- name
- email
- password
- role
- google_id
- picture
- created_at

---

## Langkah-Langkah Perbaikan

### 1. Update Struktur Database MySQL

Akses database MySQL Anda di hosting (melalui phpMyAdmin atau MySQL client) dan jalankan migration script:

**File:** `migration_add_columns.sql`

**Pilih salah satu opsi:**

**OPSI 1** - Ubah `nama_instansi` menjadi `name`:
```sql
ALTER TABLE user CHANGE COLUMN nama_instansi name VARCHAR(200) NOT NULL;
ALTER TABLE user ADD COLUMN google_id VARCHAR(200) NULL AFTER role;
ALTER TABLE user ADD COLUMN picture VARCHAR(500) NULL AFTER google_id;
ALTER TABLE user ADD COLUMN created_at DATETIME DEFAULT CURRENT_TIMESTAMP AFTER picture;
```

**OPSI 2** - Pertahankan `nama_instansi` dan tambah `name` baru:
```sql
ALTER TABLE user ADD COLUMN name VARCHAR(200) NOT NULL DEFAULT '' AFTER id;
ALTER TABLE user ADD COLUMN google_id VARCHAR(200) NULL AFTER role;
ALTER TABLE user ADD COLUMN picture VARCHAR(500) NULL AFTER google_id;
ALTER TABLE user ADD COLUMN created_at DATETIME DEFAULT CURRENT_TIMESTAMP AFTER picture;

-- Copy data dari nama_instansi ke name
UPDATE user SET name = nama_instansi WHERE name = '';
```

### 2. Verifikasi Struktur Tabel

Jalankan query ini di MySQL untuk memastikan struktur sudah benar:
```sql
DESCRIBE user;
```

### 3. Konfigurasi Environment Variable untuk Production

Buat file `.env` di direktori backend dengan konten berikut (sesuaikan dengan kredensial hosting Anda):

```env
# Production MySQL Configuration
DATABASE_URL=mysql+pymysql://username:password@hostname:3306/database_name

# Contoh:
# DATABASE_URL=mysql+pymysql://geodisease_user:P@ssw0rd123@mysql.hosting.com:3306/geodisease_db
```

**PENTING:** Ganti dengan kredensial sebenarnya:
- `username` = username MySQL Anda
- `password` = password MySQL Anda
- `hostname` = host MySQL (biasanya localhost atau domain hosting)
- `database_name` = nama database Anda

### 4. Update Docker Configuration

Pastikan file `.env` disertakan dalam Docker build. Update `.dockerignore` jika perlu:

**File backend/.dockerignore** - Pastikan `.env` TIDAK ada di dalamnya agar file environment variables ikut ter-copy.

Atau, lebih baik lagi, set environment variable langsung di Docker command atau Docker Compose.

### 5. Deploy dengan Docker

#### Opsi A: Menggunakan Docker dengan .env file

```bash
cd backend

# Build Docker image
docker build -t geodisease-backend .

# Run dengan environment variable dari file
docker run -d -p 5000:5000 --env-file .env geodisease-backend
```

#### Opsi B: Set environment variable langsung

```bash
docker run -d -p 5000:5000 \
  -e DATABASE_URL="mysql+pymysql://user:pass@host:3306/dbname" \
  geodisease-backend
```

#### Opsi C: Menggunakan Docker Compose (Recommended)

Buat file `docker-compose.yml`:

```yaml
version: '3.8'

services:
  backend:
    build: ./backend
    ports:
      - "5000:5000"
    environment:
      - DATABASE_URL=mysql+pymysql://user:pass@host:3306/dbname
    restart: unless-stopped

  frontend:
    build: ./geo_disease
    ports:
      - "80:80"
    environment:
      - REACT_APP_API_URL=http://your-backend-url:5000
    restart: unless-stopped
```

Lalu jalankan:
```bash
docker-compose up -d
```

---

## Testing Setelah Deployment

### 1. Test Koneksi Database

Akses endpoint health check:
```bash
curl http://your-backend-url:5000/
```

Response yang diharapkan:
```json
{
  "status": "Server CKG Backend Running",
  "version": "1.0",
  "timestamp": "2026-07-05T..."
}
```

### 2. Test Registrasi User

```bash
curl -X POST http://your-backend-url:5000/api/register \
  -H "Content-Type: application/json" \
  -d '{
    "nama": "Test User",
    "email": "test@example.com",
    "password": "password123",
    "role": "user"
  }'
```

### 3. Test Login

```bash
curl -X POST http://your-backend-url:5000/api/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

---

## Troubleshooting

### Error: "Access denied for user"
- Periksa username dan password MySQL di `.env`
- Pastikan user memiliki hak akses ke database

### Error: "Can't connect to MySQL server"
- Periksa hostname MySQL (localhost vs IP vs domain)
- Periksa port MySQL (default: 3306)
- Pastikan firewall membuka akses ke MySQL

### Error: "Unknown database"
- Pastikan nama database sudah benar
- Buat database jika belum ada: `CREATE DATABASE geodisease_db;`

### Error: "Table doesn't exist"
- Jalankan migration script untuk membuat/update tabel
- Atau jalankan Flask untuk create tables: `python app.py` (jika init_database aktif)

---

## Catatan Keamanan

1. **JANGAN commit file `.env` ke Git**
   - Tambahkan `.env` ke `.gitignore`
   
2. **Gunakan password yang kuat untuk database**

3. **Di production, gunakan password hashing**
   - Install: `pip install bcrypt`
   - Update login/register endpoint untuk hash password

4. **Set CORS dengan benar untuk production**
   - Jangan gunakan `CORS(app)` tanpa konfigurasi
   - Batasi origin yang diizinkan

---

## Checklist Deployment

- [ ] Jalankan migration SQL di database hosting
- [ ] Verifikasi struktur tabel dengan `DESCRIBE user;`
- [ ] Buat file `.env` dengan kredensial MySQL yang benar
- [ ] Test koneksi database lokal sebelum deploy
- [ ] Update `requirements.txt` (sudah include PyMySQL, gunicorn, python-dotenv)
- [ ] Build Docker image
- [ ] Deploy container dengan environment variables
- [ ] Test endpoint `/` untuk health check
- [ ] Test endpoint `/api/register` dan `/api/login`
- [ ] Monitor logs untuk error

---

## File yang Sudah Diupdate

1. ✅ `backend/app.py` - Menambahkan support untuk DATABASE_URL dari environment variable
2. ✅ `backend/requirements.txt` - Menambahkan PyMySQL, gunicorn, python-dotenv
3. ✅ `backend/.env.example` - Template konfigurasi database
4. ✅ `backend/migration_add_columns.sql` - Script SQL untuk update struktur tabel
5. ✅ `backend/PANDUAN_DEPLOYMENT_MYSQL.md` - Dokumentasi lengkap (file ini)

---

Jika ada pertanyaan atau masalah, silakan hubungi tim development.

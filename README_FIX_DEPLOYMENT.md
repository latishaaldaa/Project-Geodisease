# 🚨 FIX ERROR DEPLOYMENT - GeoDisease Backend

**Tanggal:** 5 Juli 2026  
**Error:** `(pymysql.err.OperationalError) (1054, "Unknown column 'user.name' in 'field list'")`  
**Status:** ✅ SUDAH DIPERBAIKI - Tinggal Deploy Ulang

---

## 📌 UNTUK: Orang yang Melakukan Deployment

Aplikasi mengalami error saat registrasi karena database MySQL di hosting tidak memiliki kolom yang dibutuhkan oleh kode Flask. Semua file sudah disiapkan, tinggal ikuti 3 langkah mudah.

---

## 🎯 SOLUSI CEPAT (3 LANGKAH)

### **1️⃣ FIX DATABASE** (5 menit)
- Login ke **phpMyAdmin** di hosting
- Pilih database yang dipakai
- Buka file `backend/migration_add_columns.sql`
- Copy-paste dan jalankan SQL-nya
- Verifikasi dengan `DESCRIBE user;`

### **2️⃣ ISI KONFIGURASI** (2 menit)
- Buka file `backend/.env`
- Isi kredensial MySQL:
  ```
  DATABASE_URL=mysql+pymysql://user:pass@host:3306/dbname
  ```

### **3️⃣ DEPLOY DOCKER** (3 menit)
```bash
cd backend
docker build -t geodisease-backend .
docker run -d --name geodisease-backend -p 5000:5000 --env-file .env geodisease-backend
```

**Total waktu: ±10 menit** ⏱️

---

## 📂 FILE-FILE PENTING

Berikut file-file yang sudah disiapkan untuk deployment:

| File | Lokasi | Fungsi |
|------|--------|--------|
| **UNTUK_ORANG_YANG_DEPLOY.md** | Root | 📘 Panduan lengkap deployment |
| **CHECKLIST_DEPLOYMENT.md** | Root | ✅ Checklist step-by-step |
| **migration_add_columns.sql** | backend/ | 🗄️ Script SQL fix database |
| **.env.template** | backend/ | ⚙️ Template konfigurasi |
| **.env** | backend/ | ⚙️ File konfigurasi (WAJIB diisi!) |

---

## 🔍 APA YANG SUDAH DIPERBAIKI?

### 1. **Backend Code (app.py)**
- ✅ Ditambahkan support untuk MySQL melalui environment variable
- ✅ Fallback ke SQLite untuk development
- ✅ Load kredensial dari file `.env`

### 2. **Dependencies (requirements.txt)**
- ✅ Ditambahkan `PyMySQL` untuk koneksi MySQL
- ✅ Ditambahkan `gunicorn` untuk production server
- ✅ Ditambahkan `python-dotenv` untuk load environment variables

### 3. **Database Migration (SQL Script)**
- ✅ Script SQL untuk menambahkan kolom yang kurang:
  - `name` (VARCHAR 200)
  - `google_id` (VARCHAR 200)
  - `picture` (VARCHAR 500)
  - `created_at` (DATETIME)

### 4. **Dokumentasi**
- ✅ Panduan lengkap untuk orang yang deploy
- ✅ Checklist deployment
- ✅ Template konfigurasi
- ✅ Troubleshooting guide

---

## 🛠️ PERUBAHAN STRUKTUR DATABASE

**SEBELUM (di hosting saat ini):**
```
user:
├── id
├── email
├── password
├── role
└── nama_instansi
```

**SESUDAH (setelah migration):**
```
user:
├── id
├── name (dari nama_instansi atau kolom baru)
├── email
├── password
├── role
├── google_id (baru)
├── picture (baru)
└── created_at (baru)
```

---

## 📖 CARA PAKAI

### Untuk Anda (Developer):
1. ✅ Zip semua file di folder `GeoDisease`
2. ✅ Kirim ke teman yang melakukan deployment
3. ✅ Minta dia buka file `UNTUK_ORANG_YANG_DEPLOY.md`
4. ✅ Minta dia ikuti checklist di `CHECKLIST_DEPLOYMENT.md`

### Untuk Teman yang Deploy:
1. 📖 Buka file `UNTUK_ORANG_YANG_DEPLOY.md` - Baca panduan lengkap
2. ✅ Buka file `CHECKLIST_DEPLOYMENT.md` - Centang setiap langkah
3. 🗄️ Jalankan `backend/migration_add_columns.sql` di phpMyAdmin
4. ⚙️ Isi `backend/.env` dengan kredensial MySQL
5. 🐳 Deploy Docker sesuai panduan

---

## ⚠️ YANG HARUS DIPERHATIKAN

1. **Migration SQL harus dijalankan SEBELUM deploy Docker**
2. **File `.env` WAJIB diisi dengan kredensial MySQL yang benar**
3. **Pastikan user MySQL punya akses penuh ke database**
4. **Test koneksi MySQL sebelum deploy Docker**
5. **Simpan screenshot untuk dokumentasi**

---

## 🧪 CARA TEST SETELAH DEPLOYMENT

```bash
# 1. Test backend running
curl http://localhost:5000/

# 2. Test registrasi
curl -X POST http://localhost:5000/api/register \
  -H "Content-Type: application/json" \
  -d '{"nama":"Test User","email":"test@test.com","password":"test123","role":"user"}'

# 3. Test login
curl -X POST http://localhost:5000/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test123"}'
```

**Jika semua test berhasil, deployment SUKSES!** ✅

---

## 🐛 TROUBLESHOOTING CEPAT

| Error | Solusi |
|-------|--------|
| "Unknown column 'user.name'" | Migration SQL belum dijalankan |
| "Access denied for user" | Kredensial MySQL di `.env` salah |
| "Can't connect to MySQL" | Hostname atau port salah |
| "Unknown database" | Database belum dibuat |

**Dokumentasi lengkap troubleshooting ada di `UNTUK_ORANG_YANG_DEPLOY.md`**

---

## 📞 SUPPORT

Jika ada masalah:
1. Cek log Docker: `docker logs geodisease-backend`
2. Cek struktur tabel: `DESCRIBE user;` di phpMyAdmin
3. Screenshot error + log
4. Kirim ke developer untuk bantuan

---

## ✅ CHECKLIST SEBELUM KIRIM KE TEMAN

- [x] Backend code sudah diupdate
- [x] Requirements.txt sudah include dependencies yang dibutuhkan
- [x] Migration SQL sudah siap
- [x] Template .env sudah dibuat
- [x] Panduan deployment lengkap sudah dibuat
- [x] Checklist deployment sudah dibuat
- [x] README ringkasan sudah dibuat
- [ ] Zip semua file
- [ ] Kirim ke teman yang deploy

---

## 🎉 NEXT STEPS

1. **Zip folder `GeoDisease`** (atau kirim via Git/Cloud)
2. **Kirim ke teman** yang akan melakukan deployment
3. **Minta dia buka `UNTUK_ORANG_YANG_DEPLOY.md`** terlebih dahulu
4. **Monitoring** - Minta screenshot saat deployment sukses

---

**Good luck with the deployment! 🚀**

---

## 📁 Struktur File yang Sudah Disiapkan

```
GeoDisease/
├── README_FIX_DEPLOYMENT.md          ← File ini (ringkasan)
├── UNTUK_ORANG_YANG_DEPLOY.md        ← Panduan lengkap
├── CHECKLIST_DEPLOYMENT.md           ← Checklist deployment
├── QUICK_FIX.md                      ← Quick reference
├── docker-compose.yml                ← Docker Compose (opsional)
│
├── backend/
│   ├── app.py                        ← ✅ Updated (support MySQL)
│   ├── requirements.txt              ← ✅ Updated (PyMySQL, gunicorn)
│   ├── Dockerfile                    ← Ready
│   ├── migration_add_columns.sql     ← ✅ Script SQL fix database
│   ├── .env                          ← ⚠️ WAJIB diisi!
│   ├── .env.template                 ← Template konfigurasi
│   ├── .env.example                  ← Contoh konfigurasi
│   └── PANDUAN_DEPLOYMENT_MYSQL.md   ← Dokumentasi lengkap
│
└── geo_disease/                      ← Frontend (React)
    └── ...
```

---

**Dibuat oleh:** Kiro AI Assistant  
**Untuk:** Deployment GeoDisease Backend  
**Tanggal:** 5 Juli 2026

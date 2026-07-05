# ✅ CHECKLIST DEPLOYMENT - UNTUK ORANG YANG DEPLOY
**Tanggal: 5 Juli 2026**

Print atau buka file ini saat melakukan deployment. Centang setiap langkah yang sudah selesai.

---

## 📦 PERSIAPAN AWAL

- [ ] Download/extract file zip dari developer
- [ ] Pastikan Docker sudah terinstall di server
- [ ] Pastikan MySQL server sudah running
- [ ] Punya akses ke phpMyAdmin atau MySQL client
- [ ] Punya kredensial MySQL (username, password, hostname, database name)

---

## 🗄️ STEP 1: FIX DATABASE

- [ ] Login ke phpMyAdmin atau MySQL client
- [ ] Pilih database yang akan dipakai aplikasi
- [ ] Buka file `backend/migration_add_columns.sql`
- [ ] Jalankan query `DESCRIBE user;` untuk cek struktur tabel saat ini
- [ ] Tentukan pakai OPSI A atau OPSI B:
  - [ ] OPSI A: Jika ada kolom `nama_instansi` (akan diubah jadi `name`)
  - [ ] OPSI B: Jika tidak ada kolom `nama_instansi` (akan ditambah kolom `name` baru)
- [ ] Copy-paste dan jalankan SQL sesuai opsi yang dipilih
- [ ] Verifikasi dengan `DESCRIBE user;` - pastikan ada kolom:
  - [ ] `name` (VARCHAR 200)
  - [ ] `google_id` (VARCHAR 200)
  - [ ] `picture` (VARCHAR 500)
  - [ ] `created_at` (DATETIME)
- [ ] Test query: `SELECT id, name, email, role FROM user LIMIT 5;`
- [ ] Screenshot hasil `DESCRIBE user;` untuk dokumentasi

---

## ⚙️ STEP 2: KONFIGURASI BACKEND

- [ ] Buka file `backend/.env` atau copy dari `backend/.env.template`
- [ ] Isi kredensial MySQL dengan format:
  ```
  DATABASE_URL=mysql+pymysql://USERNAME:PASSWORD@HOSTNAME:3306/DATABASE_NAME
  ```
- [ ] Ganti `USERNAME` dengan user MySQL
- [ ] Ganti `PASSWORD` dengan password MySQL
- [ ] Ganti `HOSTNAME` dengan host MySQL (biasanya `localhost`)
- [ ] Ganti `DATABASE_NAME` dengan nama database
- [ ] Simpan file `.env`
- [ ] Verifikasi tidak ada spasi atau typo

---

## 🧪 STEP 3: TEST KONEKSI MYSQL (OPTIONAL TAPI RECOMMENDED)

- [ ] Test koneksi MySQL dari terminal:
  ```bash
  mysql -u USERNAME -p -h HOSTNAME DATABASE_NAME
  ```
- [ ] Jika berhasil connect, ketik `exit;`
- [ ] Jika gagal, perbaiki kredensial di `.env` dan coba lagi

---

## 🐳 STEP 4: BUILD DOCKER IMAGE

- [ ] Buka terminal/command prompt
- [ ] Masuk ke folder backend:
  ```bash
  cd backend
  ```
- [ ] Build Docker image:
  ```bash
  docker build -t geodisease-backend .
  ```
- [ ] Tunggu sampai selesai (biasanya 1-3 menit)
- [ ] Pastikan tidak ada error saat build
- [ ] Verifikasi image sudah ada:
  ```bash
  docker images | grep geodisease-backend
  ```

---

## 🚀 STEP 5: RUN DOCKER CONTAINER

- [ ] Stop container lama jika ada:
  ```bash
  docker stop geodisease-backend 2>/dev/null
  docker rm geodisease-backend 2>/dev/null
  ```
- [ ] Run container baru:
  ```bash
  docker run -d \
    --name geodisease-backend \
    -p 5000:5000 \
    --env-file .env \
    --restart unless-stopped \
    geodisease-backend
  ```
- [ ] Cek container running:
  ```bash
  docker ps
  ```
- [ ] Cek log container (pastikan tidak ada error):
  ```bash
  docker logs geodisease-backend
  ```
- [ ] Screenshot log untuk dokumentasi

---

## ✅ STEP 6: TESTING & VERIFIKASI

### Test 1: Health Check
- [ ] Jalankan:
  ```bash
  curl http://localhost:5000/
  ```
- [ ] Atau buka di browser: `http://IP_SERVER:5000/`
- [ ] Harus muncul response JSON:
  ```json
  {
    "status": "Server CKG Backend Running",
    "version": "1.0",
    "timestamp": "..."
  }
  ```

### Test 2: Registrasi User
- [ ] Jalankan:
  ```bash
  curl -X POST http://localhost:5000/api/register \
    -H "Content-Type: application/json" \
    -d '{"nama":"Test Deploy","email":"testdeploy@test.com","password":"test123","role":"user"}'
  ```
- [ ] Harus muncul response sukses (tidak ada error `Unknown column`)

### Test 3: Login User
- [ ] Jalankan:
  ```bash
  curl -X POST http://localhost:5000/api/login \
    -H "Content-Type: application/json" \
    -d '{"email":"testdeploy@test.com","password":"test123"}'
  ```
- [ ] Harus muncul response dengan `"success": true`

### Test 4: Cek Database
- [ ] Login ke phpMyAdmin
- [ ] Jalankan query:
  ```sql
  SELECT * FROM user ORDER BY created_at DESC LIMIT 5;
  ```
- [ ] Harus ada data user `testdeploy@test.com` yang baru dibuat

### Test 5: Test dari Frontend
- [ ] Buka aplikasi frontend di browser
- [ ] Coba registrasi user baru dari halaman Register
- [ ] Coba login dengan user yang baru dibuat
- [ ] Pastikan tidak ada error di console browser (F12)

---

## 📊 STEP 7: MONITORING

- [ ] Bookmark command untuk cek log:
  ```bash
  docker logs -f geodisease-backend
  ```
- [ ] Bookmark command untuk restart container:
  ```bash
  docker restart geodisease-backend
  ```
- [ ] Bookmark command untuk cek status:
  ```bash
  docker ps -a | grep geodisease
  ```

---

## 🐛 TROUBLESHOOTING (Jika Ada Error)

### Error: "Access denied for user"
- [ ] Periksa username dan password di `.env`
- [ ] Test koneksi MySQL manual
- [ ] Pastikan user punya privilege yang cukup

### Error: "Can't connect to MySQL server"
- [ ] Periksa hostname di `.env`
- [ ] Cek MySQL service: `systemctl status mysql`
- [ ] Cek firewall: `ufw status`

### Error: "Unknown database"
- [ ] Database belum dibuat, buat dengan:
  ```sql
  CREATE DATABASE geodisease_db;
  ```

### Error: "Unknown column 'user.name'"
- [ ] Migration SQL belum dijalankan
- [ ] Kembali ke STEP 1

### Container terus restart
- [ ] Cek log: `docker logs geodisease-backend`
- [ ] Biasanya karena DATABASE_URL salah
- [ ] Stop container, fix `.env`, rebuild, run lagi

---

## 📝 DOKUMENTASI

Simpan informasi berikut untuk dokumentasi:

- [ ] Screenshot hasil `DESCRIBE user;`
- [ ] Screenshot `docker ps` (container running)
- [ ] Screenshot `docker logs geodisease-backend` (tidak ada error)
- [ ] Screenshot test registrasi sukses
- [ ] Screenshot test login sukses
- [ ] Screenshot data user di database
- [ ] Catat URL backend: `http://_______________:5000`
- [ ] Catat DATABASE_URL yang dipakai (sensor password!)

---

## 🎉 DEPLOYMENT SELESAI!

Jika semua checklist di atas sudah dicentang dan tidak ada error:
- ✅ Database sudah fix
- ✅ Backend Docker sudah running
- ✅ Registrasi dan login sudah work
- ✅ Data masuk ke database MySQL

**Deployment berhasil!** 🚀

---

## 📞 KONTAK DEVELOPER

Jika ada masalah yang tidak bisa diselesaikan:
1. Screenshot error yang muncul
2. Copy log dari `docker logs geodisease-backend`
3. Screenshot hasil `DESCRIBE user;`
4. Kirim ke developer

---

**File Checklist ini dibuat: 5 Juli 2026**

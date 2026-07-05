# 🚀 PANDUAN DEPLOY BACKEND FLASK KE PYTHONANYWHERE

## Step 1: Daftar Account PythonAnywhere (GRATIS)

1. Buka: https://www.pythonanywhere.com
2. Klik "Pricing & signup"
3. Pilih **"Create a Beginner account"** (FREE - Tidak perlu kartu kredit)
4. Isi form registrasi:
   - Username: pilih username unik (contoh: geodisease)
   - Email: email Anda
   - Password: buat password kuat

## Step 2: Upload File Backend

### File yang Perlu Di-upload:
1. `app.py` (file utama backend)
2. `requirements.txt` (dependencies Python)
3. `add_sample_data.py` (optional - untuk data sample)

### Cara Upload:

1. Setelah login, klik tab **"Files"** di menu atas
2. Anda akan berada di folder home: `/home/yourusername/`
3. Klik tombol **"Upload a file"**
4. Upload file-file berikut dari folder `backend`:
   - `app.py`
   - `requirements.txt`
   - File lainnya yang diperlukan

**ATAU** Upload via Git (lebih mudah):
1. Klik tab **"Consoles"**
2. Klik **"Bash"**
3. Jalankan command:
```bash
git clone https://github.com/latishaaldaa/Project-Geodisease.git
cd Project-Geodisease/backend
```

## Step 3: Install Dependencies

1. Di Bash console yang masih terbuka, jalankan:
```bash
pip3.10 install --user flask flask-cors flask-sqlalchemy
```

2. Atau jika ada requirements.txt:
```bash
pip3.10 install --user -r requirements.txt
```

## Step 4: Setup Web App

1. Klik tab **"Web"** di menu atas
2. Klik **"Add a new web app"**
3. Pilih domain gratis: `yourusername.pythonanywhere.com`
4. Pilih **"Manual configuration"**
5. Pilih **Python 3.10**

## Step 5: Konfigurasi WSGI File

1. Setelah web app dibuat, scroll ke bagian **"Code"**
2. Klik link **"WSGI configuration file"** (contoh: `/var/www/yourusername_pythonanywhere_com_wsgi.py`)
3. **Hapus semua isi file**, lalu ganti dengan:

```python
import sys
import os

# Path ke folder backend Anda
path = '/home/yourusername/Project-Geodisease/backend'
if path not in sys.path:
    sys.path.append(path)

# Ubah working directory
os.chdir(path)

# Import Flask app
from app import app as application
```

**PENTING:** Ganti `yourusername` dengan username PythonAnywhere Anda!

4. Klik **"Save"** di pojok kanan atas

## Step 6: Setup Virtual Environment (Optional tapi Recommended)

1. Scroll ke bagian **"Virtualenv"**
2. Klik **"Enter path to a virtualenv"**
3. Masukkan: `/home/yourusername/.virtualenvs/geodisease`
4. Akan muncul error, klik **"Create this virtualenv"**
5. Tunggu beberapa saat

## Step 7: Reload Web App

1. Scroll ke atas halaman
2. Klik tombol besar **"Reload yourusename.pythonanywhere.com"** (warna hijau)
3. Tunggu beberapa detik

## Step 8: Test Backend API

1. Buka browser baru
2. Akses: `https://yourusername.pythonanywhere.com/`
3. Anda harus melihat response JSON atau halaman home backend
4. Test endpoint: `https://yourusername.pythonanywhere.com/api/penyakit`

## Step 9: Update Frontend

Setelah backend berhasil, update URL di frontend:

**URL Backend Anda:**
```
https://yourusername.pythonanywhere.com
```

Ganti `yourusername` dengan username PythonAnywhere Anda.

## 📝 Troubleshooting

### Error: "ModuleNotFoundError"
- Install ulang dependencies di Bash console
- Pastikan path di WSGI file sudah benar

### Error: "Database not found"
- Database SQLite akan dibuat otomatis saat pertama kali diakses
- Cek di Files tab apakah `ckg_database.db` sudah muncul

### Error: 502 Bad Gateway
- Cek WSGI configuration file
- Pastikan tidak ada typo di path
- Reload web app

### Logs untuk Debugging
- Klik tab "Web"
- Scroll ke bagian "Log files"
- Klik "Error log" untuk melihat error

## 🎉 Selesai!

Setelah backend berhasil di PythonAnywhere, Anda akan punya:
- **Frontend**: https://geo-disease-6xa8s1eln-latishaaldaas-projects.vercel.app (Vercel)
- **Backend**: https://yourusername.pythonanywhere.com (PythonAnywhere)

Keduanya bisa berkomunikasi dan aplikasi GeoDisease Anda sudah full online!

## 💡 Tips

1. **Free tier PythonAnywhere** memiliki limit:
   - 1 web app
   - 512 MB storage
   - Bandwidth reasonable untuk project demo
   - Database SQLite (cukup untuk demo)

2. **CORS sudah dihandle** di backend dengan `flask-cors`

3. **Database** akan reset jika tidak diakses >3 bulan di free tier

4. **Custom domain** hanya untuk paid account

## 📞 Support

Jika ada masalah, cek:
- https://help.pythonanywhere.com/pages/Flask/
- https://www.pythonanywhere.com/forums/

---
**Catatan:** Panduan ini dibuat untuk Project GeoDisease - Sistem Monitoring Kesehatan Gigi

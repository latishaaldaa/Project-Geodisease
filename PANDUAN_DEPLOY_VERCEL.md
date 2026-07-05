# 🚀 Panduan Deploy GeoDisease ke Vercel

## ✅ File yang Sudah Dibuat

### 1. Struktur Proyek
```
C:\Users\Asus\Documents\GeoDisease\
├── vercel.json                    # Konfigurasi routing Vercel
├── requirements.txt               # Dependencies Python backend
├── .vercelignore                  # File yang diabaikan saat deploy
├── api/
│   └── index.py                   # Backend Python (Serverless Function)
├── geo_disease/
│   ├── .env.local                 # Environment untuk development lokal
│   ├── .env.production            # Environment untuk production Vercel
│   ├── src/
│   │   ├── config/
│   │   │   └── api.js            # Konfigurasi API base URL
│   │   └── ... (semua file sudah diupdate)
│   └── package.json              # Script vercel-build sudah ditambahkan
└── backend/                      # Folder lama (tidak digunakan di Vercel)
```

### 2. File Konfigurasi API (src/config/api.js)
```javascript
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:5000';
export default API_BASE_URL;
```

### 3. Environment Variables
- **Development (.env.local)**: `REACT_APP_API_URL=http://127.0.0.1:5000`
- **Production (.env.production)**: `REACT_APP_API_URL=/api`

### 4. File yang Sudah Diupdate (33 endpoint)
✅ src/components/layout/Header.js
✅ src/pages/auth/Login.js
✅ src/pages/auth/Register.js
✅ src/pages/user/Dashboard.js
✅ src/pages/user/DataPasien.js
✅ src/pages/admin/RekamMedis.js
✅ src/pages/tim kesehatan/CKGratis.js

Semua file sudah menggunakan `API_BASE_URL` dari config.

---

## 🎯 Langkah Deploy ke Vercel

### Opsi 1: Deploy via CLI (Recommended)

#### Step 1: Install Vercel CLI
```bash
npm install -g vercel
```

#### Step 2: Login ke Vercel
```bash
vercel login
```

#### Step 3: Deploy dari Root Project
```bash
cd C:\Users\Asus\Documents\GeoDisease
vercel
```

Pilihan saat setup:
- **Set up and deploy**: `Y`
- **Which scope**: Pilih akun Anda
- **Link to existing project**: `N`
- **Project name**: `geodisease` (atau nama lain)
- **In which directory is your code located**: `./` (tekan Enter)

#### Step 4: Deploy Production
```bash
vercel --prod
```

### Opsi 2: Deploy via GitHub (Alternative)

1. Push code ke GitHub repository
2. Buka https://vercel.com
3. Klik "Import Project"
4. Pilih repository GitHub Anda
5. Vercel akan otomatis detect konfigurasi dari `vercel.json`
6. Klik "Deploy"

---

## 🔧 Cara Kerja

1. **Frontend React** → Build di `geo_disease/build/`
2. **Request ke `/api/*`** → Diarahkan ke `api/index.py` (Python Serverless)
3. **Request lainnya** → Serve static files dari React build
4. **Environment Variables** → Otomatis switch berdasarkan mode (dev/prod)

---

## ⚙️ Testing Lokal Sebelum Deploy

### 1. Test Backend Python
```bash
cd C:\Users\Asus\Documents\GeoDisease\api
python index.py
```
Backend akan jalan di http://127.0.0.1:5000

### 2. Test Frontend React
```bash
cd C:\Users\Asus\Documents\GeoDisease\geo_disease
npm start
```
Frontend akan jalan di http://localhost:3000

### 3. Test Production Build Lokal
```bash
cd C:\Users\Asus\Documents\GeoDisease\geo_disease
npm run build
```

---

## ⚠️ Catatan Penting

### 1. Database SQLite di Vercel
- SQLite di Vercel bersifat **ephemeral** (hilang saat cold start)
- Untuk production, disarankan migrasi ke database eksternal:
  - **PostgreSQL**: Neon (https://neon.tech) - GRATIS
  - **PostgreSQL**: Supabase (https://supabase.com) - GRATIS
  - **MySQL**: PlanetScale (https://planetscale.com) - GRATIS

### 2. Update Backend untuk PostgreSQL (Opsional)
Jika ingin upgrade ke PostgreSQL, ubah di `api/index.py`:
```python
# Ganti ini:
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:////tmp/ckg_database.db'

# Dengan ini (gunakan PostgreSQL dari Neon/Supabase):
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL')
```

Lalu tambahkan Environment Variable di Vercel Dashboard:
- Key: `DATABASE_URL`
- Value: `postgresql://user:pass@host/dbname` (dari Neon/Supabase)

### 3. Environment Variables di Vercel
Setelah deploy, jika perlu tambahan config:
1. Buka Vercel Dashboard → Project Settings
2. Pilih tab "Environment Variables"
3. Tambahkan variable yang diperlukan (misalnya `DATABASE_URL`, `GOOGLE_CLIENT_ID`, dll)

### 4. Custom Domain (Opsional)
Setelah deploy berhasil, Anda bisa tambahkan custom domain:
1. Buka Vercel Dashboard → Project Settings → Domains
2. Tambahkan domain Anda
3. Update DNS records sesuai instruksi Vercel

---

## 🐛 Troubleshooting

### Error: "Module not found"
Pastikan semua dependencies terinstall:
```bash
cd geo_disease
npm install
```

### Error: Python "No module named flask"
Pastikan `requirements.txt` ada di root project.

### API tidak connect setelah deploy
1. Cek URL Vercel Anda (misal: https://geodisease.vercel.app)
2. Test endpoint: https://geodisease.vercel.app/api/penyakit
3. Buka browser console untuk cek error

### Build gagal di Vercel
1. Cek Vercel deployment logs
2. Pastikan `vercel.json` ada di root
3. Pastikan `geo_disease/package.json` memiliki script `vercel-build`

---

## 📞 Support

Jika ada masalah saat deployment:
1. Cek Vercel deployment logs di dashboard
2. Cek browser console untuk frontend errors
3. Test API endpoint langsung di browser

---

## 🎉 Setelah Deploy Berhasil

URL Anda akan seperti: `https://geodisease-xxx.vercel.app`

Test endpoint:
- Frontend: https://geodisease-xxx.vercel.app
- Backend API: https://geodisease-xxx.vercel.app/api/penyakit

Selamat! Proyek GeoDisease Anda sekarang online dan dapat diakses dari mana saja! 🚀

---

**Dibuat**: 3 Juli 2026
**Status**: ✅ Ready to Deploy
**Platform**: Vercel (FREE Tier)
**Tech Stack**: React.js + Python Flask (Serverless)

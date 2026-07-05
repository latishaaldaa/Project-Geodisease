# 🌐 CARA UPDATE FRONTEND SETELAH BACKEND DEPLOY

## Setelah Backend Anda Deploy di PythonAnywhere

Ikuti langkah ini untuk menghubungkan frontend dengan backend:

### 1. Dapatkan URL Backend Anda

URL backend Anda di PythonAnywhere akan seperti ini:
```
https://YOURUSERNAME.pythonanywhere.com
```

**Contoh:**
- Username: `geodisease`
- URL: `https://geodisease.pythonanywhere.com`

### 2. Update File Konfigurasi Frontend

Buka file: `geo_disease/src/config/api.js`

Ganti isi file dengan:

```javascript
// Konfigurasi API Base URL
const API_BASE_URL = process.env.REACT_APP_API_URL || (
  process.env.NODE_ENV === 'production' 
    ? 'https://YOURUSERNAME.pythonanywhere.com'  // Ganti dengan URL PythonAnywhere Anda
    : 'http://127.0.0.1:5000'  // Development lokal
);

export default API_BASE_URL;
```

**PENTING:** Ganti `YOURUSERNAME` dengan username PythonAnywhere Anda!

### 3. Build Ulang Frontend

Buka terminal/PowerShell di folder project, lalu jalankan:

```powershell
cd geo_disease
npm run build
```

### 4. Deploy Ulang ke Vercel

Setelah build selesai:

```powershell
vercel --prod --yes
```

### 5. Test Aplikasi

Setelah deployment selesai:
1. Buka URL Vercel terbaru
2. Coba login atau akses fitur yang butuh backend
3. Pastikan tidak ada error "Gagal terhubung ke Backend Python"

---

## ✅ Checklist Final

- [ ] Backend sudah deploy di PythonAnywhere
- [ ] Backend bisa diakses (test: https://yourusername.pythonanywhere.com)
- [ ] File `api.js` sudah diupdate dengan URL backend
- [ ] Frontend sudah di-build ulang
- [ ] Frontend sudah di-deploy ulang ke Vercel
- [ ] Test end-to-end: Frontend bisa connect ke Backend

## 🎉 Selesai!

Aplikasi GeoDisease Anda sekarang sudah FULL ONLINE:
- **Frontend**: Vercel
- **Backend**: PythonAnywhere
- **Status**: Production Ready!

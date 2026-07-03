# PANDUAN SINGKAT: Setup Google OAuth untuk Semua User

## Setup Google Cloud Console (5-10 menit)

### 1. Aktifkan 2-Step Verification
- Buka: https://myaccount.google.com/signinoptions/two-step-verification
- Pilih metode (SMS/Google Authenticator)
- Selesaikan setup

### 2. Buat Project
- Buka: https://console.cloud.google.com/
- Klik "NEW PROJECT"
- Nama: `GeoDisease`
- Klik "CREATE"

### 3. OAuth Consent Screen
- Menu: APIs & Services → OAuth consent screen
- Pilih: **External** ✓ (ini penting agar semua orang bisa login)
- App name: `GeoDisease`
- User support email: pilih email Anda
- Developer contact: masukkan email Anda
- Klik "SAVE AND CONTINUE"
- Di Scopes: tambahkan `userinfo.email`, `userinfo.profile`, `openid`
- Klik "SAVE AND CONTINUE"
- **PENTING**: Di Test users, SKIP/kosongkan (jangan tambahkan email)
- Klik "SAVE AND CONTINUE"

### 4. Buat Credentials
- Menu: APIs & Services → Credentials
- Klik "CREATE CREDENTIALS" → "OAuth client ID"
- Application type: **Web application**
- Name: `GeoDisease Web`
- Authorized JavaScript origins:
  ```
  http://localhost:3000
  ```
- Authorized redirect URIs:
  ```
  http://localhost:3000
  ```
- Klik "CREATE"

### 5. Copy Client ID
Format: `123456789-xxxxxxxxxxxxxxxx.apps.googleusercontent.com`

### 6. Publish App (Agar Semua Orang Bisa Login)
- Kembali ke: OAuth consent screen
- Klik tombol **"PUBLISH APP"**
- Konfirmasi publish
- Status berubah dari "Testing" ke "In Production"

**CATATAN PENTING**: 
- Jika app masih dalam status "Testing" dan Test users kosong, hanya Anda yang bisa login
- Jika app di-"PUBLISH", maka SEMUA orang dengan akun Google bisa login
- Untuk development, biarkan "Testing" dulu, nanti publish saat siap production

---

## Setelah Dapat Client ID:

Buka file `.env` dan ganti:
```
REACT_APP_GOOGLE_CLIENT_ID=PASTE_CLIENT_ID_DISINI
```

Restart server:
```bash
npm start
```

Selesai! Tombol Google Login akan aktif dan semua user bisa login dengan Google mereka.

# Panduan Setup Google OAuth untuk GeoDisease

## Langkah 1: Membuat Google OAuth Client ID

### 1. Buka Google Cloud Console
- Kunjungi: https://console.cloud.google.com/
- Login dengan akun Google Anda

### 2. Buat Project Baru (atau pilih yang sudah ada)
- Klik dropdown project di bagian atas
- Klik "NEW PROJECT"
- Beri nama project: `GeoDisease` atau nama lain yang Anda inginkan
- Klik "CREATE"

### 3. Aktifkan Google OAuth API
- Di menu samping, pilih "APIs & Services" → "Library"
- Cari "Google+ API" atau "Google Identity Services"
- Klik dan tekan "ENABLE"

### 4. Konfigurasi OAuth Consent Screen
- Di menu samping, pilih "APIs & Services" → "OAuth consent screen"
- Pilih "External" (untuk testing)
- Klik "CREATE"
- Isi informasi yang diperlukan:
  - App name: `GeoDisease`
  - User support email: email Anda
  - Developer contact email: email Anda
- Klik "SAVE AND CONTINUE"
- Di bagian Scopes, klik "ADD OR REMOVE SCOPES"
- Pilih scope berikut:
  - `userinfo.email`
  - `userinfo.profile`
  - `openid`
- Klik "SAVE AND CONTINUE"
- Di bagian Test users, tambahkan email Anda: `latishaaldazzahra@student.uns.ac.id`
- Klik "SAVE AND CONTINUE"

### 5. Buat OAuth 2.0 Client ID
- Di menu samping, pilih "APIs & Services" → "Credentials"
- Klik "CREATE CREDENTIALS" → "OAuth client ID"
- Pilih Application type: "Web application"
- Beri nama: `GeoDisease Web Client`
- Di bagian "Authorized JavaScript origins", tambahkan:
  ```
  http://localhost:3000
  ```
- Di bagian "Authorized redirect URIs", tambahkan:
  ```
  http://localhost:3000
  ```
- Klik "CREATE"
- **PENTING**: Copy Client ID yang muncul (format: `xxxxx.apps.googleusercontent.com`)

## Langkah 2: Konfigurasi di Project

### 1. Update file `.env`
Buka file `.env` di root project dan ganti `YOUR_GOOGLE_CLIENT_ID_HERE` dengan Client ID yang sudah Anda copy:

```
REACT_APP_GOOGLE_CLIENT_ID=123456789-xxxxxxxxxxxxxxxxxxxxxxxx.apps.googleusercontent.com
```

### 2. Restart Development Server
Setelah mengubah file `.env`, restart server React:
```bash
# Stop server (Ctrl+C)
# Jalankan kembali
npm start
```

## Langkah 3: Setup Backend Flask

Tambahkan endpoint berikut di file `app.py`:

```python
@app.route('/api/google-login', methods=['POST'])
def google_login():
    try:
        data = request.json
        email = data.get('email')
        name = data.get('name')
        google_id = data.get('googleId')
        picture = data.get('picture')
        
        # Cek apakah user sudah ada di database
        cursor = mysql.connection.cursor()
        cursor.execute("SELECT id, name, email, role FROM users WHERE email = %s", (email,))
        user = cursor.fetchone()
        
        if user:
            # User sudah ada, login
            cursor.close()
            return jsonify({
                'success': True,
                'role': user[3],  # kolom role
                'userName': user[1]  # kolom name
            })
        else:
            # User baru, registrasi otomatis dengan role 'user'
            cursor.execute(
                "INSERT INTO users (name, email, password, role) VALUES (%s, %s, %s, %s)",
                (name, email, google_id, 'user')
            )
            mysql.connection.commit()
            cursor.close()
            
            return jsonify({
                'success': True,
                'role': 'user',
                'userName': name
            })
    except Exception as e:
        return jsonify({
            'success': False,
            'message': str(e)
        }), 500
```

## Troubleshooting

### Error: "Access blocked: Authorization Error"
- Pastikan email Anda sudah ditambahkan di Test Users (Langkah 4)
- Pastikan OAuth Consent Screen sudah dikonfigurasi
- Pastikan Client ID sudah benar di file `.env`

### Error: "invalid_client"
- Client ID tidak valid atau belum dikonfigurasi
- Periksa kembali file `.env` dan pastikan Client ID sudah benar
- Restart development server setelah mengubah `.env`

### Error: "redirect_uri_mismatch"
- Authorized redirect URIs belum dikonfigurasi
- Tambahkan `http://localhost:3000` di Google Cloud Console

### User tidak bisa login
- Pastikan backend Flask sudah berjalan di `http://127.0.0.1:5000`
- Pastikan endpoint `/api/google-login` sudah ditambahkan
- Pastikan database MySQL sudah berjalan dan tabel users sudah ada

## Catatan Penting

1. File `.env` tidak boleh di-commit ke Git (sudah ada di `.gitignore`)
2. Untuk production, gunakan domain yang sebenarnya bukan localhost
3. Untuk production, ubah OAuth Consent Screen dari "Testing" ke "Published"
4. Client ID berbeda untuk setiap environment (development, staging, production)

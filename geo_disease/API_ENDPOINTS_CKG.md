# 🔌 API ENDPOINTS BACKEND - PROGRAM CKG
## Node.js Express + Auto-calculation DMF-T

---

## 📁 STRUKTUR BACKEND

```
backend/
├── server.js                 # Entry point
├── config/
│   └── database.js          # Database connection
├── routes/
│   ├── puskesmas.routes.js
│   ├── pasien.routes.js
│   ├── pemeriksaan.routes.js
│   ├── program.routes.js
│   └── aktivitas.routes.js
├── controllers/
│   ├── puskesmas.controller.js
│   ├── pemeriksaan.controller.js
│   ├── program.controller.js
│   └── aktivitas.controller.js
└── models/
    ├── puskesmas.model.js
    ├── pemeriksaan.model.js
    ├── program.model.js
    └── aktivitas.model.js
```

---

## 🚀 FILE 1: server.js (Main Entry)

```javascript
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
const puskesmasRoutes = require('./routes/puskesmas.routes');
const pemeriksaanRoutes = require('./routes/pemeriksaan.routes');
const programRoutes = require('./routes/program.routes');
const aktivitasRoutes = require('./routes/aktivitas.routes');

app.use('/api/puskesmas', puskesmasRoutes);
app.use('/api/pemeriksaan', pemeriksaanRoutes);
app.use('/api/program-ckg', programRoutes);
app.use('/api/aktivitas-tim', aktivitasRoutes);

// API untuk Dashboard DMF-T (PENTING!)
app.use('/api/dmft', require('./routes/dmft.routes'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Backend CKG berjalan!' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server CKG running on port ${PORT}`);
});

module.exports = app;
```

---

## 🗄️ FILE 2: config/database.js

```javascript
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'db_ckg',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Test connection
pool.getConnection()
  .then(connection => {
    console.log('✅ Database connected successfully!');
    connection.release();
  })
  .catch(err => {
    console.error('❌ Database connection failed:', err.message);
  });

module.exports = pool;
```

---

## 📊 FILE 3: routes/dmft.routes.js (INTI UNTUK DASHBOARD!)

```javascript
const express = require('express');
const router = express.Router();
const db = require('../config/database');

/**
 * GET /api/dmft
 * Mengembalikan data DMF-T per Puskesmas dengan kategori otomatis
 * Response format untuk dashboard frontend
 */
router.get('/', async (req, res) => {
  try {
    const query = `
      SELECT 
        p.id AS puskesmas_id,
        p.nama_puskesmas,
        p.kecamatan,
        COUNT(DISTINCT pg.pasien_id) AS jumlah_pasien,
        
        -- Rata-rata komponen DMF-T
        ROUND(COALESCE(AVG(pg.nilai_d), 0), 2) AS decayed,
        ROUND(COALESCE(AVG(pg.nilai_m), 0), 2) AS missing,
        ROUND(COALESCE(AVG(pg.nilai_f), 0), 2) AS filled,
        
        -- Total DMF-T Index
        ROUND(COALESCE(AVG(pg.dmft_total), 0), 2) AS dmft_index,
        
        -- Kategori Otomatis (RENDAH/SEDANG/TINGGI)
        CASE 
          WHEN COALESCE(AVG(pg.dmft_total), 0) < 2.6 THEN 'Rendah'
          WHEN COALESCE(AVG(pg.dmft_total), 0) BETWEEN 2.6 AND 4.4 THEN 'Sedang'
          WHEN COALESCE(AVG(pg.dmft_total), 0) > 4.4 THEN 'Tinggi'
          ELSE 'Belum Ada Data'
        END AS kategori
        
      FROM puskesmas p
      LEFT JOIN pemeriksaan_gigi pg 
        ON p.id = pg.puskesmas_id 
        AND pg.status_verifikasi IN ('verified', 'approved')
        AND pg.tanggal_pemeriksaan >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
      GROUP BY p.id, p.nama_puskesmas, p.kecamatan
      ORDER BY dmft_index DESC
    `;

    const [rows] = await db.query(query);

    // Transform to object format (sesuai frontend lama)
    const result = {};
    rows.forEach(row => {
      result[row.nama_puskesmas] = {
        dmft_index: parseFloat(row.dmft_index),
        kategori: row.kategori,
        jumlah_pasien: parseInt(row.jumlah_pasien),
        decayed: parseFloat(row.decayed),
        missing: parseFloat(row.missing),
        filled: parseFloat(row.filled)
      };
    });

    res.json(result);
  } catch (error) {
    console.error('Error fetching DMF-T data:', error);
    res.status(500).json({ 
      error: 'Gagal mengambil data DMF-T',
      message: error.message 
    });
  }
});

/**
 * GET /api/dmft/detail/:puskesmas_id
 * Detail DMF-T untuk satu Puskesmas
 */
router.get('/detail/:puskesmas_id', async (req, res) => {
  try {
    const { puskesmas_id } = req.params;

    const query = `
      SELECT 
        p.nama_puskesmas,
        COUNT(DISTINCT pg.pasien_id) AS total_pasien,
        AVG(pg.nilai_d) AS avg_karies,
        AVG(pg.nilai_m) AS avg_hilang,
        AVG(pg.nilai_f) AS avg_tambal,
        AVG(pg.dmft_total) AS dmft_index,
        CASE 
          WHEN AVG(pg.dmft_total) < 2.6 THEN 'RENDAH'
          WHEN AVG(pg.dmft_total) BETWEEN 2.6 AND 4.4 THEN 'SEDANG'
          ELSE 'TINGGI'
        END AS kategori
      FROM puskesmas p
      LEFT JOIN pemeriksaan_gigi pg ON p.id = pg.puskesmas_id
      WHERE p.id = ? AND pg.status_verifikasi = 'approved'
      GROUP BY p.id, p.nama_puskesmas
    `;

    const [rows] = await db.query(query, [puskesmas_id]);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Data tidak ditemukan' });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error('Error fetching detail DMF-T:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/dmft/trend/:puskesmas_id
 * Trend DMF-T per bulan (6 bulan terakhir)
 */
router.get('/trend/:puskesmas_id', async (req, res) => {
  try {
    const { puskesmas_id } = req.params;

    const query = `
      SELECT 
        DATE_FORMAT(tanggal_pemeriksaan, '%Y-%m') AS bulan,
        COUNT(DISTINCT pasien_id) AS jumlah_pasien,
        AVG(dmft_total) AS dmft_index
      FROM pemeriksaan_gigi
      WHERE puskesmas_id = ?
        AND status_verifikasi = 'approved'
        AND tanggal_pemeriksaan >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
      GROUP BY DATE_FORMAT(tanggal_pemeriksaan, '%Y-%m')
      ORDER BY bulan ASC
    `;

    const [rows] = await db.query(query, [puskesmas_id]);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching trend DMF-T:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
```

---

## 📝 FILE 4: routes/pemeriksaan.routes.js

```javascript
const express = require('express');
const router = express.Router();
const db = require('../config/database');

/**
 * POST /api/pemeriksaan
 * Input data pemeriksaan gigi baru
 * DMF-T dihitung otomatis di database (GENERATED COLUMN)
 */
router.post('/', async (req, res) => {
  try {
    const {
      pasien_id,
      puskesmas_id,
      tanggal_pemeriksaan,
      nilai_d,
      nilai_m,
      nilai_f,
      diagnosis,
      tindakan,
      petugas_nama,
      lokasi_pemeriksaan
    } = req.body;

    // Validasi input
    if (!pasien_id || !puskesmas_id || !tanggal_pemeriksaan) {
      return res.status(400).json({ 
        error: 'Data tidak lengkap',
        required: ['pasien_id', 'puskesmas_id', 'tanggal_pemeriksaan']
      });
    }

    const query = `
      INSERT INTO pemeriksaan_gigi (
        pasien_id, puskesmas_id, tanggal_pemeriksaan,
        nilai_d, nilai_m, nilai_f,
        diagnosis, tindakan, petugas_nama, lokasi_pemeriksaan,
        status_verifikasi
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'draft')
    `;

    const [result] = await db.query(query, [
      pasien_id,
      puskesmas_id,
      tanggal_pemeriksaan,
      nilai_d || 0,
      nilai_m || 0,
      nilai_f || 0,
      diagnosis,
      tindakan,
      petugas_nama,
      lokasi_pemeriksaan
    ]);

    // Get inserted data (dengan dmft_total yang sudah auto-calculated)
    const [inserted] = await db.query(
      'SELECT * FROM pemeriksaan_gigi WHERE id = ?',
      [result.insertId]
    );

    res.status(201).json({
      message: 'Data pemeriksaan berhasil disimpan',
      data: inserted[0]
    });
  } catch (error) {
    console.error('Error creating pemeriksaan:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/pemeriksaan
 * Get all pemeriksaan (dengan filter optional)
 */
router.get('/', async (req, res) => {
  try {
    const { puskesmas_id, status, limit = 100 } = req.query;

    let query = `
      SELECT 
        pg.*,
        pa.nama_lengkap AS nama_pasien,
        pa.nik,
        pk.nama_puskesmas
      FROM pemeriksaan_gigi pg
      JOIN pasien_anak pa ON pg.pasien_id = pa.id
      JOIN puskesmas pk ON pg.puskesmas_id = pk.id
      WHERE 1=1
    `;

    const params = [];

    if (puskesmas_id) {
      query += ' AND pg.puskesmas_id = ?';
      params.push(puskesmas_id);
    }

    if (status) {
      query += ' AND pg.status_verifikasi = ?';
      params.push(status);
    }

    query += ' ORDER BY pg.tanggal_pemeriksaan DESC LIMIT ?';
    params.push(parseInt(limit));

    const [rows] = await db.query(query, params);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching pemeriksaan:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * PUT /api/pemeriksaan/:id
 * Update data pemeriksaan
 */
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      nilai_d,
      nilai_m,
      nilai_f,
      diagnosis,
      tindakan,
      status_verifikasi
    } = req.body;

    const query = `
      UPDATE pemeriksaan_gigi 
      SET nilai_d = ?, nilai_m = ?, nilai_f = ?,
          diagnosis = ?, tindakan = ?,
          status_verifikasi = ?
      WHERE id = ?
    `;

    await db.query(query, [
      nilai_d, nilai_m, nilai_f,
      diagnosis, tindakan, status_verifikasi,
      id
    ]);

    const [updated] = await db.query(
      'SELECT * FROM pemeriksaan_gigi WHERE id = ?',
      [id]
    );

    res.json({
      message: 'Data berhasil diupdate',
      data: updated[0]
    });
  } catch (error) {
    console.error('Error updating pemeriksaan:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * DELETE /api/pemeriksaan/:id
 * Hapus data pemeriksaan
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    await db.query('DELETE FROM pemeriksaan_gigi WHERE id = ?', [id]);

    res.json({ message: 'Data pemeriksaan berhasil dihapus' });
  } catch (error) {
    console.error('Error deleting pemeriksaan:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
```

---

## 🎯 FILE 5: routes/program.routes.js

```javascript
const express = require('express');
const router = express.Router();
const db = require('../config/database');

/**
 * GET /api/program-ckg
 * Get program intervensi aktif
 */
router.get('/', async (req, res) => {
  try {
    const { status = 'berjalan', limit = 10 } = req.query;

    const query = `
      SELECT 
        pi.*,
        p.nama_puskesmas,
        p.kecamatan
      FROM program_intervensi pi
      JOIN puskesmas p ON pi.puskesmas_id = p.id
      WHERE pi.status = ?
      ORDER BY pi.tanggal_mulai DESC
      LIMIT ?
    `;

    const [rows] = await db.query(query, [status, parseInt(limit)]);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching program:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/program-ckg
 * Create program baru
 */
router.post('/', async (req, res) => {
  try {
    const {
      puskesmas_id,
      nama_program,
      wilayah_target,
      tanggal_mulai,
      target_peserta,
      target_dmft,
      deskripsi
    } = req.body;

    const query = `
      INSERT INTO program_intervensi (
        puskesmas_id, nama_program, wilayah_target,
        tanggal_mulai, target_peserta, target_dmft,
        deskripsi, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, 'berjalan')
    `;

    const [result] = await db.query(query, [
      puskesmas_id, nama_program, wilayah_target,
      tanggal_mulai, target_peserta, target_dmft, deskripsi
    ]);

    res.status(201).json({
      message: 'Program berhasil dibuat',
      id: result.insertId
    });
  } catch (error) {
    console.error('Error creating program:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
```

---

## 👥 FILE 6: routes/aktivitas.routes.js

```javascript
const express = require('express');
const router = express.Router();
const db = require('../config/database');

/**
 * GET /api/aktivitas-tim
 * Get aktivitas tim hari ini (real-time)
 */
router.get('/', async (req, res) => {
  try {
    const query = `
      SELECT 
        at.*,
        p.nama_puskesmas,
        TIME_FORMAT(at.waktu_mulai, '%H:%i') AS waktu
      FROM aktivitas_tim at
      JOIN puskesmas p ON at.puskesmas_id = p.id
      WHERE DATE(at.waktu_mulai) = CURDATE()
      ORDER BY at.waktu_mulai DESC
      LIMIT 10
    `;

    const [rows] = await db.query(query);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching aktivitas:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/aktivitas-tim
 * Catat aktivitas tim baru
 */
router.post('/', async (req, res) => {
  try {
    const {
      puskesmas_id,
      nama_tim,
      kegiatan,
      lokasi,
      jumlah_pasien_diperiksa
    } = req.body;

    const query = `
      INSERT INTO aktivitas_tim (
        puskesmas_id, nama_tim, kegiatan, lokasi,
        jumlah_pasien_diperiksa, waktu_mulai, status
      ) VALUES (?, ?, ?, ?, ?, NOW(), 'berlangsung')
    `;

    const [result] = await db.query(query, [
      puskesmas_id, nama_tim, kegiatan, lokasi,
      jumlah_pasien_diperiksa
    ]);

    res.status(201).json({
      message: 'Aktivitas berhasil dicatat',
      id: result.insertId
    });
  } catch (error) {
    console.error('Error creating aktivitas:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
```

---

## 🧪 TESTING API ENDPOINTS

### Test dengan cURL atau Postman:

```bash
# 1. Health Check
curl http://localhost:5000/api/health

# 2. Get DMF-T Dashboard Data
curl http://localhost:5000/api/dmft

# 3. Get Program Intervensi
curl http://localhost:5000/api/program-ckg

# 4. Get Aktivitas Tim
curl http://localhost:5000/api/aktivitas-tim

# 5. Create Pemeriksaan Baru
curl -X POST http://localhost:5000/api/pemeriksaan \
  -H "Content-Type: application/json" \
  -d '{
    "pasien_id": 1,
    "puskesmas_id": 1,
    "tanggal_pemeriksaan": "2026-07-02",
    "nilai_d": 4,
    "nilai_m": 1,
    "nilai_f": 2,
    "petugas_nama": "drg. Siti Nurhaliza",
    "lokasi_pemeriksaan": "SD Negeri 1"
  }'
```

---

## ✅ FITUR PENTING

1. ✅ **Auto-calculation DMF-T** di database level (GENERATED COLUMN)
2. ✅ **Auto-kategori** (RENDAH/SEDANG/TINGGI) via SQL CASE
3. ✅ **Real-time data** dari pemeriksaan approved
4. ✅ **Filter 6 bulan terakhir** untuk data relevan
5. ✅ **RESTful API** standard
6. ✅ **Error handling** lengkap
7. ✅ **Query optimization** dengan JOIN dan INDEX

**Next**: Refactor Frontend UI/UX!

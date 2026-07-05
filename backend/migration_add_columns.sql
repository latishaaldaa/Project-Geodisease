-- =====================================================
-- MIGRATION SCRIPT: Fix User Table Structure
-- =====================================================
-- Tanggal: 5 Juli 2026
-- Error yang diperbaiki: Unknown column 'user.name' in 'field list'
-- 
-- INSTRUKSI:
-- 1. Login ke phpMyAdmin atau MySQL client
-- 2. Pilih database yang digunakan aplikasi
-- 3. Klik tab "SQL"
-- 4. Copy-paste script ini dan klik "Go" atau "Execute"
-- =====================================================

-- STEP 1: Cek struktur tabel saat ini
-- (Jalankan ini dulu untuk melihat kolom apa saja yang ada)
DESCRIBE user;

-- =====================================================
-- PILIH SALAH SATU OPSI DI BAWAH INI:
-- =====================================================

-- -----------------------------------------------------
-- OPSI A: Jika tabel user SUDAH PUNYA kolom 'nama_instansi'
-- (Kolom nama_instansi akan diubah namanya menjadi 'name')
-- -----------------------------------------------------

ALTER TABLE user CHANGE COLUMN nama_instansi name VARCHAR(200) NOT NULL;
ALTER TABLE user ADD COLUMN google_id VARCHAR(200) NULL AFTER role;
ALTER TABLE user ADD COLUMN picture VARCHAR(500) NULL AFTER google_id;
ALTER TABLE user ADD COLUMN created_at DATETIME DEFAULT CURRENT_TIMESTAMP AFTER picture;

-- -----------------------------------------------------
-- OPSI B: Jika tabel user TIDAK PUNYA kolom 'nama_instansi'
-- (Kolom name akan ditambahkan sebagai kolom baru)
-- Uncomment (hapus --) baris-baris di bawah jika pakai opsi ini
-- -----------------------------------------------------

-- ALTER TABLE user ADD COLUMN name VARCHAR(200) NOT NULL DEFAULT 'User' AFTER id;
-- ALTER TABLE user ADD COLUMN google_id VARCHAR(200) NULL AFTER role;
-- ALTER TABLE user ADD COLUMN picture VARCHAR(500) NULL AFTER google_id;
-- ALTER TABLE user ADD COLUMN created_at DATETIME DEFAULT CURRENT_TIMESTAMP AFTER picture;

-- =====================================================
-- STEP 2: Verifikasi hasil migration
-- =====================================================

DESCRIBE user;

-- Struktur yang BENAR setelah migration:
-- +-------------+--------------+------+-----+-------------------+
-- | Field       | Type         | Null | Key | Default           |
-- +-------------+--------------+------+-----+-------------------+
-- | id          | int          | NO   | PRI | NULL              |
-- | name        | varchar(200) | NO   |     | NULL              |
-- | email       | varchar(200) | NO   | UNI | NULL              |
-- | password    | varchar(500) | YES  |     | NULL              |
-- | role        | varchar(50)  | YES  |     | NULL              |
-- | google_id   | varchar(200) | YES  |     | NULL              |
-- | picture     | varchar(500) | YES  |     | NULL              |
-- | created_at  | datetime     | YES  |     | CURRENT_TIMESTAMP |
-- +-------------+--------------+------+-----+-------------------+

-- =====================================================
-- STEP 3: Test dengan select data
-- =====================================================

SELECT id, name, email, role, google_id, picture, created_at FROM user LIMIT 5;

-- =====================================================
-- OPTIONAL: Jika perlu membuat tabel user dari awal
-- =====================================================
-- Hanya jalankan ini jika tabel user BELUM ADA sama sekali
-- HATI-HATI: Ini akan MENGHAPUS tabel user yang sudah ada!

-- DROP TABLE IF EXISTS user;
-- 
-- CREATE TABLE user (
--     id INT AUTO_INCREMENT PRIMARY KEY,
--     name VARCHAR(200) NOT NULL,
--     email VARCHAR(200) NOT NULL UNIQUE,
--     password VARCHAR(500),
--     role VARCHAR(50) DEFAULT 'user',
--     google_id VARCHAR(200),
--     picture VARCHAR(500),
--     created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
--     INDEX idx_email (email),
--     INDEX idx_role (role)
-- ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- SELESAI!
-- =====================================================
-- Setelah migration berhasil:
-- 1. Pastikan tidak ada error
-- 2. Jalankan DESCRIBE user; untuk verifikasi
-- 3. Lanjutkan dengan deployment Docker (lihat UNTUK_ORANG_YANG_DEPLOY.md)
-- =====================================================

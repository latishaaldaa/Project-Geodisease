-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jul 03, 2026 at 12:06 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.0.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `geodisease_db`
--

-- --------------------------------------------------------

--
-- Table structure for table `pasien`
--

CREATE TABLE `pasien` (
  `id` int(11) NOT NULL,
  `nama` varchar(100) NOT NULL,
  `umur` int(11) DEFAULT NULL,
  `gol_darah` varchar(5) DEFAULT NULL,
  `tinggi` int(11) DEFAULT NULL,
  `berat` int(11) DEFAULT NULL,
  `nomor_hp` varchar(20) DEFAULT NULL,
  `alamat` text DEFAULT NULL,
  `wilayah_id` varchar(50) DEFAULT NULL,
  `penyakit_id` varchar(50) DEFAULT NULL,
  `status` varchar(20) DEFAULT NULL,
  `tanggal_input` varchar(20) DEFAULT NULL,
  `latitude` float DEFAULT NULL,
  `longitude` float DEFAULT NULL,
  `sistole` int(11) DEFAULT NULL,
  `diastole` int(11) DEFAULT NULL,
  `suhu_tubuh` float DEFAULT NULL,
  `denyut_nadi` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `penyakit`
--

CREATE TABLE `penyakit` (
  `id` int(11) NOT NULL,
  `nama` varchar(100) NOT NULL,
  `kategori` varchar(50) DEFAULT NULL,
  `kode_icd` varchar(20) DEFAULT NULL,
  `deskripsi` text DEFAULT NULL,
  `gambar_url` text DEFAULT NULL,
  `link_artikel` text DEFAULT NULL,
  `tindakan_medis` text DEFAULT NULL,
  `tingkat_urgensi` varchar(20) DEFAULT 'Normal',
  `last_updated_by` varchar(100) DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  `dasar_hukum` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `penyakit`
--

INSERT INTO `penyakit` (`id`, `nama`, `kategori`, `kode_icd`, `deskripsi`, `gambar_url`, `link_artikel`, `tindakan_medis`, `tingkat_urgensi`, `last_updated_by`, `updated_at`, `dasar_hukum`) VALUES
(4, 'DBD', 'Tidak Menular', 'A02', 'Demam berdarah dengue (DBD) adalah salah satu penyebab kematian anak yang cukup tinggi di sebagian negara Asia, termasuk Indonesia. Penyakit ini dibawa oleh virus Dengue melalui', 'https://images.alodokter.com/dk0z4ums3/image/upload/v1535947476/attached_image/saat-anak-terkena-demam-berdarah-dengue.jpg', 'https://www.alodokter.com/saat-anak-terkena-demam-berdarah-dengue', 'Fogging Massal Radius 500M ', 'Normal', NULL, '2026-06-30 23:09:52', NULL),
(8, 'Diabetes', 'Tidak Menular ', 'A01', 'Diabetes adalah penyakit kronis yang ditandai dengan tingginya kadar gula di dalam darah. Glukosa atau gula adalah sumber energi utama bagi tubuh. Namun, pada penderita diabetes,', 'https://images.alodokter.com/dk0z4ums3/image/upload/v1596469188/attached_image/diabetes.jpg', 'https://www.alodokter.com/diabetes', 'Tindakan yang dapat mengontrol glukosa darah antara lain pengaturan makan (diet), latihan fisik (olahraga), perawatan kaki, penggunaan obat.', 'Normal', 'System', '2026-05-18 02:11:44', NULL),
(11, 'Tipes', 'Umum', 'A07', 'Gejala tipes ringan hingga berat dapat terjadi dalam beberapa hari. Jika tidak ditangani dengan cepat dan tepat, penyakit yang disebabkan oleh infeksi bakteri Salmonella Typhi ini', 'https://images.alodokter.com/dk0z4ums3/image/upload/v1647051588/attached_image/mengenal-gejala-tipes-ringan-hingga-parah.jpg', 'https://www.alodokter.com/mengenal-gejala-tipes-ringan-hingga-parah', 'Penatalaksanaan definitif demam tifoid adalah antibiotik spesifik untuk Salmonella typhi sesuai dengan profil sensitivitas tiap area endemik. Kasus ringan dapat dirawat jalan di rumah dengan pemberian antibiotik oral dan antipiretik. Pasien dengan tanda komplikasi dan gejala klinis signifikan seperti muntah dengan tanda dehidrasi, diare berat, disentri dan tanda kegawatan abdomen harus dirawat inap.', 'Normal', NULL, '2026-05-18 05:00:52', NULL),
(12, 'Influenza', 'Penyakit Menular', 'A05', 'Flu atau influenza adalah infeksi virus yang menyerang hidung, tenggorokan, dan paru-paru. Penderita flu dapat mengalami demam, sakit kepala, pilek atau hidung tersumbat, serta batuk.Â  Banyak', 'https://images.alodokter.com/dk0z4ums3/image/upload/v1625544954/attached_image/flu.jpg', 'https://www.alodokter.com/flu', 'Menganjurkan istirahat dan menghindari kontak dengan orang lain.', 'Normal', NULL, '2026-05-18 04:58:19', NULL),
(22, 'Demam', 'Penyakit Menular', 'PENDING', 'Ditambahkan otomatis dari input data pasien', NULL, NULL, NULL, 'Normal', NULL, '2026-06-30 23:55:15', NULL),
(23, 'Hipertensi', 'Penyakit Tidak Menular', 'PENDING', 'Ditambahkan otomatis dari input data pasien', NULL, NULL, NULL, 'Normal', NULL, '2026-06-30 23:55:15', NULL),
(24, 'Flu', 'Penyakit Menular', 'PENDING', 'Ditambahkan otomatis dari input data pasien', NULL, NULL, NULL, 'Normal', NULL, '2026-06-30 23:55:15', NULL),
(25, 'Stroke', 'Penyakit Tidak Menular', 'PENDING', 'Ditambahkan otomatis dari input data pasien', NULL, NULL, NULL, 'Normal', NULL, '2026-06-30 23:55:16', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `rumah_sakit`
--

CREATE TABLE `rumah_sakit` (
  `id` int(11) NOT NULL,
  `nama` varchar(100) NOT NULL,
  `total_bed` int(11) NOT NULL,
  `bed_terpakai` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `user`
--

CREATE TABLE `user` (
  `id` int(11) NOT NULL,
  `email` varchar(120) NOT NULL,
  `password` varchar(200) NOT NULL,
  `role` varchar(20) NOT NULL,
  `nama_instansi` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `user`
--

INSERT INTO `user` (`id`, `email`, `password`, `role`, `nama_instansi`) VALUES
(1, 'nikitawilly@gmail.com', 'nikitawilly', 'user', NULL),
(2, 'admin@gmail.com', 'admin', 'admin', NULL),
(3, 'ratihwilona@gmail.com', 'ratihwilona', 'user', NULL),
(4, 'timkesehatan@gmail.com', 'timkesehatan', 'tim kesehatan', 'Tim Kesehatan');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `pasien`
--
ALTER TABLE `pasien`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `penyakit`
--
ALTER TABLE `penyakit`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `nama` (`nama`);

--
-- Indexes for table `rumah_sakit`
--
ALTER TABLE `rumah_sakit`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `nama` (`nama`);

--
-- Indexes for table `user`
--
ALTER TABLE `user`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `pasien`
--
ALTER TABLE `pasien`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=134;

--
-- AUTO_INCREMENT for table `penyakit`
--
ALTER TABLE `penyakit`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=26;

--
-- AUTO_INCREMENT for table `rumah_sakit`
--
ALTER TABLE `rumah_sakit`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `user`
--
ALTER TABLE `user`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;

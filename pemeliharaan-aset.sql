-- phpMyAdmin SQL Dump
-- version 5.2.2
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: Dec 14, 2025 at 01:35 PM
-- Server version: 8.4.3
-- PHP Version: 8.3.26

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `pemeliharaan-aset`
--

-- --------------------------------------------------------

--
-- Table structure for table `aset`
--

CREATE TABLE `aset` (
  `id` int NOT NULL,
  `AsetId` varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `AccurateId` varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `NamaAset` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `Spesifikasi` text COLLATE utf8mb4_general_ci,
  `Grup` enum('BANGUNAN','DISTRIBUSI JARINGAN','HEADEND','KENDARAAN','KOMPUTER','PERALATAN & INVENTARIS KANTOR','TANAH') COLLATE utf8mb4_general_ci NOT NULL,
  `beban_id` int DEFAULT NULL,
  `departemen_id` int DEFAULT NULL,
  `AkunPerkiraan` enum('1701-01 (Tanah)','1701-02 (Bangunan)','1701-03 (Kendaraan)','1701-04 (Distribusi Jaringan / Headend)','1701-05 (Peralatan & Inventaris Kantor)','1701-06 (Renovasi & Instalasi Listrik)','1701-07 (Perlengkapan & Inventaris IT)') COLLATE utf8mb4_general_ci DEFAULT NULL,
  `NilaiAset` int DEFAULT NULL,
  `TglPembelian` date DEFAULT NULL,
  `MasaManfaat` int DEFAULT NULL,
  `StatusAset` enum('aktif','rusak','diperbaiki','dipinjam','dijual') COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'aktif',
  `Pengguna` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `Lokasi` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `Keterangan` text COLLATE utf8mb4_general_ci,
  `approval_status` enum('diajukan','disetujui','ditolak') COLLATE utf8mb4_general_ci DEFAULT 'diajukan',
  `approval_date` datetime DEFAULT NULL,
  `Gambar` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `approval_by_user_id` int DEFAULT NULL,
  `approval_by_username` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `approval_by_role` varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `beban`
--

CREATE TABLE `beban` (
  `id` int NOT NULL,
  `kode` varchar(50) COLLATE utf8mb4_general_ci NOT NULL,
  `aktif` tinyint(1) DEFAULT '1',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `beban`
--

INSERT INTO `beban` (`id`, `kode`, `aktif`, `created_at`, `updated_at`) VALUES
(1, 'MLM', 1, '2025-12-06 09:48:25', '2025-12-06 09:48:25'),
(2, 'BJR-NET', 1, '2025-12-06 09:48:25', '2025-12-06 09:48:25'),
(3, 'BNT-NET', 1, '2025-12-06 09:48:25', '2025-12-06 09:48:25'),
(4, 'BTM-NET', 1, '2025-12-06 09:48:25', '2025-12-06 09:48:25'),
(5, 'GTO-NET', 1, '2025-12-06 09:48:25', '2025-12-06 09:48:25'),
(6, 'KDR-NET', 1, '2025-12-06 09:48:25', '2025-12-06 09:48:25'),
(7, 'LMP-NET', 1, '2025-12-06 09:48:25', '2025-12-06 09:48:25'),
(8, 'MLG-NET', 1, '2025-12-06 09:48:25', '2025-12-06 09:48:25'),
(9, 'PDG-NET', 1, '2025-12-06 09:48:25', '2025-12-06 09:48:25'),
(10, 'PKB-NET', 1, '2025-12-06 09:48:25', '2025-12-06 09:48:25'),
(11, 'PKP-NET', 1, '2025-12-06 09:48:25', '2025-12-06 09:48:25'),
(12, 'PLB-NET', 1, '2025-12-06 09:48:25', '2025-12-06 09:48:25'),
(13, 'SBY-NET', 1, '2025-12-06 09:48:25', '2025-12-06 09:48:25'),
(14, 'SMD-NET', 1, '2025-12-06 09:48:25', '2025-12-06 09:48:25'),
(15, 'SRG-NET', 1, '2025-12-06 09:48:25', '2025-12-06 09:48:25'),
(16, 'MLMKOB', 1, '2025-12-06 09:48:25', '2025-12-06 09:48:25'),
(17, 'MLMMET', 1, '2025-12-06 09:48:25', '2025-12-06 09:48:25'),
(18, 'MLMSDKB', 1, '2025-12-06 09:48:25', '2025-12-06 09:48:25'),
(19, 'MLMSL', 1, '2025-12-06 09:48:25', '2025-12-06 09:48:25'),
(20, 'BJR-MEDIA', 1, '2025-12-06 09:48:25', '2025-12-06 09:48:25'),
(21, 'BNT-MEDIA', 1, '2025-12-06 09:48:25', '2025-12-06 09:48:25'),
(22, 'BTM-MEDIA', 1, '2025-12-06 09:48:25', '2025-12-06 09:48:25'),
(23, 'GTO-MEDIA', 1, '2025-12-06 09:48:25', '2025-12-06 09:48:25'),
(24, 'KDR-MEDIA', 1, '2025-12-06 09:48:25', '2025-12-06 09:48:25'),
(25, 'LMP-MEDIA', 1, '2025-12-06 09:48:25', '2025-12-06 09:48:25'),
(26, 'MLG-MEDIA', 1, '2025-12-06 09:48:25', '2025-12-06 09:48:25'),
(27, 'PDG-MEDIA', 1, '2025-12-06 09:48:25', '2025-12-06 09:48:25'),
(28, 'PKB-MEDIA', 1, '2025-12-06 09:48:25', '2025-12-06 09:48:25'),
(29, 'PKP-MEDIA', 1, '2025-12-06 09:48:25', '2025-12-06 09:48:25'),
(30, 'PLB-MEDIA', 1, '2025-12-06 09:48:25', '2025-12-06 09:48:25'),
(31, 'SBY-MEDIA', 1, '2025-12-06 09:48:25', '2025-12-06 09:48:25'),
(32, 'SMD-MEDIA', 1, '2025-12-06 09:48:25', '2025-12-06 09:48:25'),
(33, 'SRG-MEDIA', 1, '2025-12-06 09:48:25', '2025-12-06 09:48:25');

-- --------------------------------------------------------

--
-- Table structure for table `departemen`
--

CREATE TABLE `departemen` (
  `id` int NOT NULL,
  `kode` varchar(50) COLLATE utf8mb4_general_ci NOT NULL,
  `nama` varchar(200) COLLATE utf8mb4_general_ci NOT NULL,
  `aktif` tinyint(1) DEFAULT '1',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `departemen`
--

INSERT INTO `departemen` (`id`, `kode`, `nama`, `aktif`, `created_at`, `updated_at`) VALUES
(1, 'FAT', 'FAT', 1, '2025-12-06 09:51:16', '2025-12-06 09:51:16'),
(2, 'HRDGA', 'HRD dan GA', 1, '2025-12-06 09:51:16', '2025-12-06 09:51:16'),
(3, 'TEK', 'Teknik', 1, '2025-12-06 09:51:16', '2025-12-06 09:51:16'),
(4, 'SALES', 'Sales dan Marketing', 1, '2025-12-06 09:51:16', '2025-12-06 09:51:16'),
(5, 'LEGAL', 'Legal', 1, '2025-12-06 09:51:16', '2025-12-06 09:51:16'),
(6, 'LOG', 'Logistik', 1, '2025-12-06 09:51:16', '2025-12-06 09:51:16');

-- --------------------------------------------------------

--
-- Table structure for table `dijual`
--

CREATE TABLE `dijual` (
  `id` int NOT NULL,
  `aset_id` int NOT NULL,
  `TglDijual` date NOT NULL,
  `HargaJual` int DEFAULT '0',
  `Pembeli` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `catatan` text COLLATE utf8mb4_unicode_ci,
  `approval_status` enum('diajukan','disetujui','ditolak') COLLATE utf8mb4_unicode_ci DEFAULT 'diajukan',
  `approval_date` datetime DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `approval_by_user_id` int DEFAULT NULL,
  `approval_by_username` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `approval_by_role` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `dipinjam`
--

CREATE TABLE `dipinjam` (
  `id` int NOT NULL,
  `aset_id` int NOT NULL,
  `Peminjam` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `TglPinjam` date NOT NULL,
  `TglKembali` date DEFAULT NULL,
  `catatan` text COLLATE utf8mb4_unicode_ci,
  `approval_status` enum('diajukan','disetujui','ditolak') COLLATE utf8mb4_unicode_ci DEFAULT 'diajukan',
  `approval_date` datetime DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `approval_by_user_id` int DEFAULT NULL,
  `approval_by_username` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `approval_by_role` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `mutasi`
--

CREATE TABLE `mutasi` (
  `id` int NOT NULL,
  `aset_id` int NOT NULL,
  `TglMutasi` date NOT NULL,
  `departemen_asal_id` int DEFAULT NULL,
  `departemen_tujuan_id` int DEFAULT NULL,
  `ruangan_asal` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `ruangan_tujuan` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `alasan` text COLLATE utf8mb4_general_ci,
  `catatan` text COLLATE utf8mb4_general_ci,
  `approval_status` enum('diajukan','disetujui','ditolak') COLLATE utf8mb4_general_ci DEFAULT 'diajukan',
  `approval_date` datetime DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `approval_by_user_id` int DEFAULT NULL,
  `approval_by_username` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `approval_by_role` varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `notification`
--

CREATE TABLE `notification` (
  `id` int NOT NULL,
  `user_id` int DEFAULT NULL,
  `beban` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `message` text COLLATE utf8mb4_general_ci,
  `type` enum('info','warning','success','error','approval') COLLATE utf8mb4_general_ci DEFAULT 'info',
  `AsetId` varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `pesan` text COLLATE utf8mb4_general_ci,
  `dibaca` tinyint(1) DEFAULT '0',
  `waktu_dibuat` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `waktu_dibaca` timestamp NULL DEFAULT NULL,
  `judul` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `link` varchar(500) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `record_id` int DEFAULT NULL,
  `tabel_ref` varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `approver_user_id` int DEFAULT NULL,
  `approver_username` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `approver_role` varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `perbaikan`
--

CREATE TABLE `perbaikan` (
  `id` int NOT NULL,
  `aset_id` int NOT NULL,
  `tanggal_perbaikan` date NOT NULL,
  `deskripsi` text COLLATE utf8mb4_unicode_ci,
  `biaya` int DEFAULT '0',
  `teknisi` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `PurchaseOrder` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `approval_status` enum('diajukan','disetujui','ditolak') COLLATE utf8mb4_unicode_ci DEFAULT 'diajukan',
  `approval_date` datetime DEFAULT NULL,
  `approval_by_user_id` int DEFAULT NULL,
  `approval_by_username` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `approval_by_role` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `riwayat`
--

CREATE TABLE `riwayat` (
  `id` int NOT NULL,
  `jenis_aksi` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` int DEFAULT NULL,
  `role` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `aset_id` int DEFAULT NULL,
  `perubahan` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin,
  `tabel_ref` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `record_id` int DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ;

-- --------------------------------------------------------

--
-- Table structure for table `rusak`
--

CREATE TABLE `rusak` (
  `id` int NOT NULL,
  `aset_id` int NOT NULL,
  `TglRusak` date NOT NULL,
  `Kerusakan` text COLLATE utf8mb4_unicode_ci,
  `catatan` text COLLATE utf8mb4_unicode_ci,
  `approval_status` enum('diajukan','disetujui','ditolak') COLLATE utf8mb4_unicode_ci DEFAULT 'diajukan',
  `approval_date` datetime DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `approval_by_user_id` int DEFAULT NULL,
  `approval_by_username` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `approval_by_role` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `user`
--

CREATE TABLE `user` (
  `id` int NOT NULL,
  `username` varchar(50) COLLATE utf8mb4_general_ci NOT NULL,
  `nama` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `password` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `role` enum('admin','user') COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'user',
  `beban` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL
) ;

--
-- Dumping data for table `user`
--

INSERT INTO `user` (`id`, `username`, `nama`, `password`, `role`, `beban`) VALUES
(38, 'admin', 'admin', 'admin123', 'admin', '[\"MLM\"]'),
(54, 'user1', 'user1', 'User#1234', 'user', '[\"MLG-MEDIA\",\"MLG-NET\"]');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `aset`
--
ALTER TABLE `aset`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `AsetId` (`AsetId`),
  ADD KEY `idx_beban_id` (`beban_id`),
  ADD KEY `idx_departemen_id` (`departemen_id`);

--
-- Indexes for table `beban`
--
ALTER TABLE `beban`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `kode` (`kode`),
  ADD KEY `idx_kode` (`kode`),
  ADD KEY `idx_aktif` (`aktif`);

--
-- Indexes for table `departemen`
--
ALTER TABLE `departemen`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `kode` (`kode`),
  ADD KEY `idx_kode` (`kode`),
  ADD KEY `idx_aktif` (`aktif`);

--
-- Indexes for table `dijual`
--
ALTER TABLE `dijual`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_aset_id` (`aset_id`);

--
-- Indexes for table `dipinjam`
--
ALTER TABLE `dipinjam`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_aset_id` (`aset_id`);

--
-- Indexes for table `mutasi`
--
ALTER TABLE `mutasi`
  ADD PRIMARY KEY (`id`),
  ADD KEY `aset_id` (`aset_id`),
  ADD KEY `departemen_asal_id` (`departemen_asal_id`),
  ADD KEY `departemen_tujuan_id` (`departemen_tujuan_id`);

--
-- Indexes for table `notification`
--
ALTER TABLE `notification`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_user` (`user_id`),
  ADD KEY `idx_beban` (`beban`),
  ADD KEY `idx_AsetId` (`AsetId`);

--
-- Indexes for table `perbaikan`
--
ALTER TABLE `perbaikan`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_aset_id` (`aset_id`);

--
-- Indexes for table `riwayat`
--
ALTER TABLE `riwayat`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_aset_id` (`aset_id`),
  ADD KEY `idx_user_id` (`user_id`),
  ADD KEY `idx_tabel_ref` (`tabel_ref`),
  ADD KEY `idx_created_at` (`created_at`);

--
-- Indexes for table `rusak`
--
ALTER TABLE `rusak`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_aset_id` (`aset_id`);

--
-- Indexes for table `user`
--
ALTER TABLE `user`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `aset`
--
ALTER TABLE `aset`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=83;

--
-- AUTO_INCREMENT for table `beban`
--
ALTER TABLE `beban`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=34;

--
-- AUTO_INCREMENT for table `departemen`
--
ALTER TABLE `departemen`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `dijual`
--
ALTER TABLE `dijual`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=20;

--
-- AUTO_INCREMENT for table `dipinjam`
--
ALTER TABLE `dipinjam`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT for table `mutasi`
--
ALTER TABLE `mutasi`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=57;

--
-- AUTO_INCREMENT for table `notification`
--
ALTER TABLE `notification`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `perbaikan`
--
ALTER TABLE `perbaikan`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=53;

--
-- AUTO_INCREMENT for table `riwayat`
--
ALTER TABLE `riwayat`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `rusak`
--
ALTER TABLE `rusak`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=44;

--
-- AUTO_INCREMENT for table `user`
--
ALTER TABLE `user`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `aset`
--
ALTER TABLE `aset`
  ADD CONSTRAINT `fk_aset_beban` FOREIGN KEY (`beban_id`) REFERENCES `beban` (`id`),
  ADD CONSTRAINT `fk_aset_departemen` FOREIGN KEY (`departemen_id`) REFERENCES `departemen` (`id`);

--
-- Constraints for table `dijual`
--
ALTER TABLE `dijual`
  ADD CONSTRAINT `fk_dijual_aset` FOREIGN KEY (`aset_id`) REFERENCES `aset` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `dipinjam`
--
ALTER TABLE `dipinjam`
  ADD CONSTRAINT `fk_dipinjam_aset` FOREIGN KEY (`aset_id`) REFERENCES `aset` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `mutasi`
--
ALTER TABLE `mutasi`
  ADD CONSTRAINT `mutasi_ibfk_1` FOREIGN KEY (`aset_id`) REFERENCES `aset` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `mutasi_ibfk_2` FOREIGN KEY (`departemen_asal_id`) REFERENCES `departemen` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `mutasi_ibfk_3` FOREIGN KEY (`departemen_tujuan_id`) REFERENCES `departemen` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `perbaikan`
--
ALTER TABLE `perbaikan`
  ADD CONSTRAINT `fk_perbaikan_aset` FOREIGN KEY (`aset_id`) REFERENCES `aset` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `riwayat`
--
ALTER TABLE `riwayat`
  ADD CONSTRAINT `fk_riwayat_aset` FOREIGN KEY (`aset_id`) REFERENCES `aset` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_riwayat_user` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `rusak`
--
ALTER TABLE `rusak`
  ADD CONSTRAINT `fk_rusak_aset` FOREIGN KEY (`aset_id`) REFERENCES `aset` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;

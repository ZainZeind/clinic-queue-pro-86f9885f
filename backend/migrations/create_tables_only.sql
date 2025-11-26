-- ================================================
-- SCHEMA DATABASE KLINIK SEHAT
-- Struktur Database Baru dengan Bahasa Indonesia
-- (Simplified - Tables Only)
-- ================================================

-- Disable foreign key checks
SET FOREIGN_KEY_CHECKS = 0;

-- Drop existing tables if they exist
DROP TABLE IF EXISTS konsultasi_online;
DROP TABLE IF EXISTS riwayat_kunjungan;
DROP TABLE IF EXISTS rekam_medis;
DROP TABLE IF EXISTS notifikasi;
DROP TABLE IF EXISTS pendaftaran_online;
DROP TABLE IF EXISTS nomor_antrian;
DROP TABLE IF EXISTS dokter;
DROP TABLE IF EXISTS pasien;
DROP TABLE IF EXISTS admin;
DROP TABLE IF EXISTS dashboard_klinik;

-- Drop old tables if they exist
DROP TABLE IF EXISTS consultation_messages;
DROP TABLE IF EXISTS consultations;
DROP TABLE IF EXISTS medical_records;
DROP TABLE IF EXISTS queue;
DROP TABLE IF EXISTS appointments;
DROP TABLE IF EXISTS doctor_schedules;
DROP TABLE IF EXISTS notifications;
DROP TABLE IF EXISTS profiles;
DROP TABLE IF EXISTS users;

-- Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- ================================================
-- 1. TABEL ADMIN
-- ================================================
CREATE TABLE admin (
  id_admin INT PRIMARY KEY AUTO_INCREMENT,
  nama_admin VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ================================================
-- 2. TABEL PASIEN
-- ================================================
CREATE TABLE pasien (
  NIK_pasien VARCHAR(16) PRIMARY KEY,
  nama_pasien VARCHAR(100) NOT NULL,
  tanggal_lahir DATE NOT NULL,
  alamat TEXT NOT NULL,
  no_hp VARCHAR(20) NOT NULL,
  email VARCHAR(100),
  jenis_kelamin ENUM('Laki-laki', 'Perempuan') NOT NULL,
  golongan_darah ENUM('A', 'B', 'AB', 'O', 'A+', 'B+', 'AB+', 'O+', 'A-', 'B-', 'AB-', 'O-'),
  password VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_nama (nama_pasien),
  INDEX idx_hp (no_hp)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ================================================
-- 3. TABEL DOKTER
-- ================================================
CREATE TABLE dokter (
  id_dokter INT PRIMARY KEY AUTO_INCREMENT,
  nama_dokter VARCHAR(100) NOT NULL,
  spesialisasi VARCHAR(100) NOT NULL,
  no_sip VARCHAR(50) UNIQUE NOT NULL,
  no_hp VARCHAR(20) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  jadwal_praktik TEXT,
  status_aktif ENUM('Aktif', 'Tidak Aktif') DEFAULT 'Aktif',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_nama (nama_dokter),
  INDEX idx_spesialisasi (spesialisasi)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ================================================
-- 4. TABEL PENDAFTARAN ONLINE
-- ================================================
CREATE TABLE pendaftaran_online (
  id_pendaftaran INT PRIMARY KEY AUTO_INCREMENT,
  NIK_pasien VARCHAR(16) NOT NULL,
  nama_pasien VARCHAR(100) NOT NULL,
  id_dokter INT,
  tanggal_pendaftaran DATE NOT NULL,
  waktu_daftar TIME NOT NULL,
  keluhan_pasien TEXT NOT NULL,
  jenis_layanan ENUM('Konsultasi Umum', 'Pemeriksaan Khusus', 'Kontrol Rutin', 'Lainnya') DEFAULT 'Konsultasi Umum',
  status_pendaftaran ENUM('Pending', 'Dikonfirmasi', 'Dibatalkan', 'Selesai') DEFAULT 'Pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (NIK_pasien) REFERENCES pasien(NIK_pasien) ON DELETE CASCADE,
  FOREIGN KEY (id_dokter) REFERENCES dokter(id_dokter) ON DELETE SET NULL,
  INDEX idx_tanggal (tanggal_pendaftaran),
  INDEX idx_status (status_pendaftaran)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ================================================
-- 5. TABEL NOMOR ANTRIAN
-- ================================================
CREATE TABLE nomor_antrian (
  id_antrian INT PRIMARY KEY AUTO_INCREMENT,
  nomor_antrian INT NOT NULL,
  id_pendaftaran INT,
  NIK_pasien VARCHAR(16) NOT NULL,
  nama_pasien VARCHAR(100) NOT NULL,
  id_dokter INT,
  tanggal_antrian DATE NOT NULL,
  waktu_mulai TIME,
  waktu_selesai TIME,
  status_antrian ENUM('Menunggu', 'Dipanggil', 'Sedang Dilayani', 'Selesai', 'Batal') DEFAULT 'Menunggu',
  prioritas ENUM('Normal', 'Urgent') DEFAULT 'Normal',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (NIK_pasien) REFERENCES pasien(NIK_pasien) ON DELETE CASCADE,
  FOREIGN KEY (id_dokter) REFERENCES dokter(id_dokter) ON DELETE SET NULL,
  FOREIGN KEY (id_pendaftaran) REFERENCES pendaftaran_online(id_pendaftaran) ON DELETE SET NULL,
  INDEX idx_tanggal (tanggal_antrian),
  INDEX idx_status (status_antrian),
  INDEX idx_nomor (nomor_antrian)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ================================================
-- 6. TABEL REKAM MEDIS
-- ================================================
CREATE TABLE rekam_medis (
  id_rekam_medis INT PRIMARY KEY AUTO_INCREMENT,
  NIK_pasien VARCHAR(16) NOT NULL,
  nama_pasien VARCHAR(100) NOT NULL,
  id_dokter INT NOT NULL,
  tanggal_periksa DATETIME NOT NULL,
  keluhan TEXT NOT NULL,
  diagnosa_pasien TEXT NOT NULL,
  hasil_pemeriksaan TEXT NOT NULL,
  tindakan TEXT,
  resep_obat TEXT,
  catatan_dokter TEXT,
  biaya_pemeriksaan DECIMAL(10,2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (NIK_pasien) REFERENCES pasien(NIK_pasien) ON DELETE CASCADE,
  FOREIGN KEY (id_dokter) REFERENCES dokter(id_dokter) ON DELETE RESTRICT,
  INDEX idx_nik (NIK_pasien),
  INDEX idx_tanggal (tanggal_periksa)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ================================================
-- 7. TABEL RIWAYAT KUNJUNGAN
-- ================================================
CREATE TABLE riwayat_kunjungan (
  id_kunjungan INT PRIMARY KEY AUTO_INCREMENT,
  NIK_pasien VARCHAR(16) NOT NULL,
  nama_pasien VARCHAR(100) NOT NULL,
  id_dokter INT,
  tanggal_kunjungan DATETIME NOT NULL,
  jenis_kunjungan ENUM('Konsultasi', 'Pemeriksaan', 'Kontrol', 'Tindakan') NOT NULL,
  status_kunjungan ENUM('Selesai', 'Batal') DEFAULT 'Selesai',
  catatan TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (NIK_pasien) REFERENCES pasien(NIK_pasien) ON DELETE CASCADE,
  FOREIGN KEY (id_dokter) REFERENCES dokter(id_dokter) ON DELETE SET NULL,
  INDEX idx_nik (NIK_pasien),
  INDEX idx_tanggal (tanggal_kunjungan)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ================================================
-- 8. TABEL KONSULTASI ONLINE
-- ================================================
CREATE TABLE konsultasi_online (
  id_konsultasi INT PRIMARY KEY AUTO_INCREMENT,
  NIK_pasien VARCHAR(16) NOT NULL,
  nama_pasien VARCHAR(100) NOT NULL,
  id_dokter INT,
  teks_pesan TEXT NOT NULL,
  status_pesan ENUM('Terkirim', 'Terbaca', 'Dibalas') DEFAULT 'Terkirim',
  pengirim ENUM('Pasien', 'Dokter') NOT NULL,
  waktu_kirim TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  waktu_dibaca TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (NIK_pasien) REFERENCES pasien(NIK_pasien) ON DELETE CASCADE,
  FOREIGN KEY (id_dokter) REFERENCES dokter(id_dokter) ON DELETE SET NULL,
  INDEX idx_nik (NIK_pasien),
  INDEX idx_waktu (waktu_kirim),
  INDEX idx_status (status_pesan)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ================================================
-- 9. TABEL NOTIFIKASI
-- ================================================
CREATE TABLE notifikasi (
  id_notifikasi INT PRIMARY KEY AUTO_INCREMENT,
  id_antrian INT,
  NIK_pasien VARCHAR(16),
  judul_notifikasi VARCHAR(255) NOT NULL,
  isi_notifikasi TEXT NOT NULL,
  jenis_notifikasi ENUM('Antrian', 'Pendaftaran', 'Hasil', 'Pengingat', 'Umum') NOT NULL,
  status_antrian VARCHAR(50),
  status_baca ENUM('Belum Dibaca', 'Sudah Dibaca') DEFAULT 'Belum Dibaca',
  waktu_kirim TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  metode_kirim ENUM('Email', 'SMS', 'Push', 'In-App') DEFAULT 'In-App',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (id_antrian) REFERENCES nomor_antrian(id_antrian) ON DELETE SET NULL,
  FOREIGN KEY (NIK_pasien) REFERENCES pasien(NIK_pasien) ON DELETE CASCADE,
  INDEX idx_nik (NIK_pasien),
  INDEX idx_waktu (waktu_kirim),
  INDEX idx_status (status_baca)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ================================================
-- 10. TABEL DASHBOARD KLINIK
-- ================================================
CREATE TABLE dashboard_klinik (
  id_dashboard INT PRIMARY KEY AUTO_INCREMENT,
  tanggal_laporan DATE NOT NULL UNIQUE,
  jumlah_pasien_datang INT DEFAULT 0,
  jumlah_pasien_antri INT DEFAULT 0,
  jumlah_pasien_selesai INT DEFAULT 0,
  jumlah_pasien_batal INT DEFAULT 0,
  jumlah_pendaftaran_online INT DEFAULT 0,
  rata_rata_waktu_tunggu TIME,
  catatan TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_tanggal (tanggal_laporan)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ================================================
-- INSERT SAMPLE DATA
-- ================================================

-- Sample Admin
INSERT INTO admin (nama_admin, email, password) VALUES
('Admin Klinik', 'admin@kliniksehat.com', '$2a$10$GEiJn/W3kClHQV1sYkLTqeldBU.VUUDXNgtDHvZp02ZEXKe7ENgwe'),
('Admin Sistem', 'admin2@kliniksehat.com', '$2a$10$xrXX/8zRnrkpk1IA8r5lA.8Yq79wn9YK9ZALUW8YwyiSVptRTobYi');

-- Sample Dokter
INSERT INTO dokter (nama_dokter, spesialisasi, no_sip, no_hp, email, password, jadwal_praktik, status_aktif) VALUES
('dr. Ahmad Hidayat, Sp.PD', 'Penyakit Dalam', 'SIP-001-2024', '081234567890', 'dokter@kliniksehat.com', '$2a$10$2EWoOUH.o11R8IuiS2HJFuVEAe5O1X494Eu/dCXqepwYTgq6Y.gyC', 
'{"senin":"08:00-14:00","rabu":"08:00-14:00","jumat":"08:00-14:00"}', 'Aktif'),
('dr. Siti Nurhaliza, Sp.A', 'Anak', 'SIP-002-2024', '081234567891', 'siti@kliniksehat.com', '$2a$10$sViM8yXfLjjHNFMYqKPJEucjixrDZLYmW4bfsEXzsd1sXwM0PFLKe',
'{"selasa":"08:00-14:00","kamis":"08:00-14:00","sabtu":"08:00-12:00"}', 'Aktif'),
('dr. Budi Santoso, Sp.OG', 'Kandungan', 'SIP-003-2024', '081234567892', 'budi@kliniksehat.com', '$2a$10$70GM4aDJR3o7AdBALy4r.egYGZeGySTy06UW7P4gfXFXqxtAGvNLa',
'{"senin":"14:00-20:00","rabu":"14:00-20:00","jumat":"14:00-20:00"}', 'Aktif');

-- Sample Pasien
INSERT INTO pasien (NIK_pasien, nama_pasien, tanggal_lahir, alamat, no_hp, email, jenis_kelamin, golongan_darah, password) VALUES
('3374010101900001', 'Andi Wijaya', '1990-01-01', 'Jl. Merdeka No. 123, Semarang', '082123456789', 'pasien@kliniksehat.com', 'Laki-laki', 'A+', '$2a$10$GEiJn/W3kClHQV1sYkLTqeldBU.VUUDXNgtDHvZp02ZEXKe7ENgwe'),
('3374020202910002', 'Dewi Lestari', '1991-02-02', 'Jl. Sudirman No. 456, Semarang', '082123456790', 'dewi@email.com', 'Perempuan', 'B+', '$2a$10$xrXX/8zRnrkpk1IA8r5lA.8Yq79wn9YK9ZALUW8YwyiSVptRTobYi'),
('3374030303920003', 'Citra Pratiwi', '1992-03-03', 'Jl. Diponegoro No. 789, Semarang', '082123456791', 'citra@email.com', 'Perempuan', 'O+', '$2a$10$2EWoOUH.o11R8IuiS2HJFuVEAe5O1X494Eu/dCXqepwYTgq6Y.gyC');

-- Sample Dashboard untuk hari ini
INSERT INTO dashboard_klinik (tanggal_laporan, jumlah_pasien_datang, jumlah_pasien_antri, jumlah_pasien_selesai, jumlah_pasien_batal, jumlah_pendaftaran_online) VALUES
(CURDATE(), 0, 0, 0, 0, 0);

-- Additional indexes for better performance
CREATE INDEX idx_pendaftaran_tanggal_status ON pendaftaran_online(tanggal_pendaftaran, status_pendaftaran);
CREATE INDEX idx_antrian_tanggal_status ON nomor_antrian(tanggal_antrian, status_antrian);
CREATE INDEX idx_rekam_medis_nik_tanggal ON rekam_medis(NIK_pasien, tanggal_periksa);

-- Buat database
CREATE DATABASE IF NOT EXISTS kos_management;
USE kos_management;

-- Tabel users
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nama VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('admin', 'penyewa') DEFAULT 'penyewa'
);

-- Tabel kos
CREATE TABLE kos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nama_kos VARCHAR(100) NOT NULL,
  alamat TEXT NOT NULL,
  jumlah_kamar INT NOT NULL,
  fasilitas TEXT
);

-- Tabel kamar
CREATE TABLE kamar (
  id INT AUTO_INCREMENT PRIMARY KEY,
  id_kos INT NOT NULL,
  nomor_kamar VARCHAR(10) NOT NULL,
  harga DECIMAL(10,2) NOT NULL,
  status ENUM('tersedia', 'terisi', 'perbaikan') DEFAULT 'tersedia',
  FOREIGN KEY (id_kos) REFERENCES kos(id) ON DELETE CASCADE
);

-- Tabel penyewa
CREATE TABLE penyewa (
  id INT AUTO_INCREMENT PRIMARY KEY,
  id_user INT NOT NULL,
  id_kamar INT NOT NULL,
  tanggal_masuk DATE NOT NULL,
  tanggal_keluar DATE,
  FOREIGN KEY (id_user) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (id_kamar) REFERENCES kamar(id) ON DELETE CASCADE
);

-- Tabel pembayaran
CREATE TABLE pembayaran (
  id INT AUTO_INCREMENT PRIMARY KEY,
  id_penyewa INT NOT NULL,
  jumlah_bayar DECIMAL(10,2) NOT NULL,
  tanggal_bayar DATE NOT NULL,
  status ENUM('lunas', 'belum lunas') DEFAULT 'belum lunas',
  FOREIGN KEY (id_penyewa) REFERENCES penyewa(id) ON DELETE CASCADE
);

-- Seed data users (5 data)
INSERT INTO users (nama, email, password, role) VALUES
('Admin Kos', 'admin@kos.com', 'admin123', 'admin'),
('Budi Santoso', 'budi@email.com', 'budi123', 'penyewa'),
('Siti Aminah', 'siti@email.com', 'siti123', 'penyewa'),
('Andi Wijaya', 'andi@email.com', 'andi123', 'penyewa'),
('Dewi Lestari', 'dewi@email.com', 'dewi123', 'penyewa');

-- Seed data kos (5 data)
INSERT INTO kos (nama_kos, alamat, jumlah_kamar, fasilitas) VALUES
('Kos Melati', 'Jl. Melati No. 10, Jakarta', 10, 'WiFi, AC, Kamar Mandi Dalam'),
('Kos Mawar', 'Jl. Mawar Indah 5, Bandung', 8, 'WiFi, TV, Dapur Bersama'),
('Kos Anggrek', 'Jl. Anggrek Raya 22, Surabaya', 12, 'AC, Parkir Luas, CCTV'),
('Kos Dahlia', 'Jl. Dahlia 7, Yogyakarta', 6, 'Kamar Mandi Luar, WiFi'),
('Kos Kenanga', 'Jl. Kenanga 3, Semarang', 15, 'AC, WiFi, Laundry');

-- Seed data kamar (5 data)
INSERT INTO kamar (id_kos, nomor_kamar, harga, status) VALUES
(1, 'A01', 1500000, 'tersedia'),
(1, 'A02', 1500000, 'terisi'),
(2, 'B01', 1200000, 'tersedia'),
(3, 'C01', 2000000, 'tersedia'),
(4, 'D01', 1000000, 'perbaikan');

-- Seed data penyewa (5 data)
INSERT INTO penyewa (id_user, id_kamar, tanggal_masuk, tanggal_keluar) VALUES
(2, 2, '2025-01-01', NULL),
(3, 1, '2025-02-01', '2025-03-01'),
(4, 3, '2025-03-15', NULL),
(5, 4, '2025-04-01', NULL),
(3, 5, '2025-01-10', '2025-02-10');

-- Seed data pembayaran (5 data)
INSERT INTO pembayaran (id_penyewa, jumlah_bayar, tanggal_bayar, status) VALUES
(1, 1500000, '2025-01-01', 'lunas'),
(2, 1500000, '2025-02-01', 'lunas'),
(3, 1200000, '2025-03-15', 'lunas'),
(4, 2000000, '2025-04-01', 'belum lunas'),
(5, 1000000, '2025-01-10', 'lunas');

SELECT * FROM kos_management.users;
-- ============================================================
--  NITIPIN DATABASE SCHEMA
--  Jalankan file ini di MySQL sebelum menjalankan seed.js
-- ============================================================

CREATE DATABASE IF NOT EXISTS nitipin_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE nitipin_db;

-- ─── Users ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id          VARCHAR(36)  PRIMARY KEY,
  name        VARCHAR(255) NOT NULL,
  email       VARCHAR(255) UNIQUE NOT NULL,
  phone       VARCHAR(20)  DEFAULT NULL,
  password    VARCHAR(255) NOT NULL,
  role        ENUM('customer', 'pengelola') DEFAULT 'customer',
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ─── Bookings ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS bookings (
  id                 VARCHAR(36) PRIMARY KEY,
  customer_id        VARCHAR(36) NOT NULL,
  nomor_polisi       VARCHAR(20) NOT NULL,
  merek              VARCHAR(100) DEFAULT NULL,
  warna              VARCHAR(50)  DEFAULT NULL,
  tanggal_masuk      DATE NOT NULL,
  tanggal_keluar     DATE NOT NULL,
  status             ENUM(
                       'menunggu_konfirmasi',
                       'dikonfirmasi',
                       'pembayaran_berhasil',
                       'sedang_dititipkan',
                       'selesai',
                       'dibatalkan'
                     ) DEFAULT 'menunggu_konfirmasi',
  total_biaya        DECIMAL(12,2) DEFAULT 0,
  metode_pembayaran  VARCHAR(50)   DEFAULT NULL,
  lokasi             VARCHAR(100)  DEFAULT NULL,
  catatan            TEXT          DEFAULT NULL,
  foto_uri           VARCHAR(500)  DEFAULT NULL,
  customer_name      VARCHAR(255)  DEFAULT NULL,
  customer_phone     VARCHAR(20)   DEFAULT NULL,
  created_at         TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (customer_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ─── Monitorings ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS monitorings (
  id          VARCHAR(36) PRIMARY KEY,
  booking_id  VARCHAR(36) NOT NULL,
  kondisi     ENUM('baik', 'perlu_perhatian', 'bermasalah') DEFAULT 'baik',
  bensin      ENUM('penuh', 'tiga_per_empat', 'setengah', 'seperempat', 'hampir_habis') DEFAULT 'setengah',
  lokasi      VARCHAR(100) DEFAULT NULL,
  catatan     TEXT         DEFAULT NULL,
  foto_uri    VARCHAR(500) DEFAULT NULL,
  updated_by  VARCHAR(36)  DEFAULT NULL,
  updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (booking_id) REFERENCES bookings(id)  ON DELETE CASCADE
);

-- ─── Layanan Penitipan ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS layanan (
  id          VARCHAR(36)   PRIMARY KEY,
  nama        VARCHAR(255)  NOT NULL,
  tarif       DECIMAL(12,2) NOT NULL,
  tarif_unit  VARCHAR(50)   DEFAULT 'hari',
  deskripsi   TEXT          DEFAULT NULL,
  fitur       JSON          DEFAULT NULL,
  is_aktif    TINYINT(1)    DEFAULT 1,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ─── Slot Parkir ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS slot_parkir (
  id          VARCHAR(36) PRIMARY KEY,
  nama_slot   VARCHAR(50) NOT NULL,
  kapasitas   INT         DEFAULT 1,
  status      ENUM('tersedia', 'terisi', 'maintenance') DEFAULT 'tersedia',
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

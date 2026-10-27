require('dotenv').config();
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const pool = require('../config/db');

async function seed() {
  console.log('🌱 Memulai proses seeding database NITIPIN...');

  try {
    // 1. Users
    console.log('Inserting users...');
    const hashedPassCustomer = await bcrypt.hash('123456', 10);
    const hashedPassAdmin = await bcrypt.hash('admin123', 10);

    const users = [
      { id: 'usr-001', name: 'Budi Santoso', email: 'budi@gmail.com', phone: '081234567890', password: hashedPassCustomer, role: 'customer' },
      { id: 'usr-002', name: 'Siti Rahma', email: 'siti@gmail.com', phone: '082345678901', password: hashedPassCustomer, role: 'customer' },
      { id: 'usr-003', name: 'Andi Pratama', email: 'andi@gmail.com', phone: '083456789012', password: hashedPassCustomer, role: 'customer' },
      { id: 'usr-004', name: 'Pak Agus (Pengelola)', email: 'pengelola@nitipin.id', phone: '081198765432', password: hashedPassAdmin, role: 'pengelola' },
    ];

    for (const u of users) {
      await pool.query(
        `INSERT INTO users (id, name, email, phone, password, role)
         VALUES (?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE name = VALUES(name), phone = VALUES(phone), password = VALUES(password)`,
        [u.id, u.name, u.email, u.phone, u.password, u.role]
      );
    }

    // 2. Layanan
    console.log('Inserting layanan...');
    const layananData = [
      {
        id: 'lay-001',
        nama: 'Reguler (Harian)',
        tarif: 30000,
        tarif_unit: 'hari',
        deskripsi: 'Penitipan standar di tempat teduh dan aman dengan penjagaan 24 jam.',
        fitur: JSON.stringify(['Parkir beratap', 'CCTV 24/7', 'Pemeriksaan fisik harian', 'Laporan via aplikasi']),
        is_aktif: 1
      },
      {
        id: 'lay-002',
        nama: 'Mingguan Nyaman',
        tarif: 175000,
        tarif_unit: 'minggu',
        deskripsi: 'Paket hemat penitipan selama 7 hari dengan bonus pembersihan debu ringan.',
        fitur: JSON.stringify(['Parkir beratap eksklusif', 'CCTV 24/7', 'Pemanasan mesin 2x seminggu', 'Cover motor gratis', 'Cuci ringan']),
        is_aktif: 1
      },
      {
        id: 'lay-003',
        nama: 'Bulanan Premium',
        tarif: 600000,
        tarif_unit: 'bulan',
        deskripsi: 'Paket jangka panjang dengan perawatan aki berkala dan perlindungan maksimal.',
        fitur: JSON.stringify(['Slot indoor VIP', 'CCTV 24/7', 'Pemanasan mesin rutin', 'Pengecekan tegangan aki', 'Cuci steam 2x']),
        is_aktif: 1
      }
    ];

    for (const l of layananData) {
      await pool.query(
        `INSERT INTO layanan (id, nama, tarif, tarif_unit, deskripsi, fitur, is_aktif)
         VALUES (?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE nama = VALUES(nama), tarif = VALUES(tarif), deskripsi = VALUES(deskripsi), fitur = VALUES(fitur)`,
        [l.id, l.nama, l.tarif, l.tarif_unit, l.deskripsi, l.fitur, l.is_aktif]
      );
    }

    // 3. Slot Parkir
    console.log('Inserting slots...');
    const slots = [
      { id: 'slot-001', nama_slot: 'Slot A-01', kapasitas: 1, status: 'terisi' },
      { id: 'slot-002', nama_slot: 'Slot A-02', kapasitas: 1, status: 'tersedia' },
      { id: 'slot-003', nama_slot: 'Slot A-03', kapasitas: 1, status: 'tersedia' },
      { id: 'slot-004', nama_slot: 'Slot B-01', kapasitas: 1, status: 'tersedia' },
      { id: 'slot-005', nama_slot: 'Slot B-02', kapasitas: 1, status: 'tersedia' },
    ];

    for (const s of slots) {
      await pool.query(
        `INSERT INTO slot_parkir (id, nama_slot, kapasitas, status)
         VALUES (?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE status = VALUES(status)`,
        [s.id, s.nama_slot, s.kapasitas, s.status]
      );
    }

    // 4. Bookings
    console.log('Inserting initial bookings...');
    const bookings = [
      {
        id: 'bok-001',
        customer_id: 'usr-001',
        nomor_polisi: 'B 5069 BLP',
        merek: 'Honda Vario 160',
        warna: 'Hitam Doff',
        tanggal_masuk: '2026-10-01',
        tanggal_keluar: '2026-10-08',
        status: 'sedang_dititipkan',
        total_biaya: 210000,
        metode_pembayaran: 'qris',
        lokasi: 'Slot A-01',
        catatan: 'Tolong kunci stang ke kiri',
        foto_uri: null,
        customer_name: 'Budi Santoso',
        customer_phone: '081234567890'
      }
    ];

    for (const b of bookings) {
      await pool.query(
        `INSERT INTO bookings
         (id, customer_id, nomor_polisi, merek, warna, tanggal_masuk, tanggal_keluar, status, total_biaya, metode_pembayaran, lokasi, catatan, foto_uri, customer_name, customer_phone)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE status = VALUES(status), lokasi = VALUES(lokasi)`,
        [b.id, b.customer_id, b.nomor_polisi, b.merek, b.warna, b.tanggal_masuk, b.tanggal_keluar, b.status, b.total_biaya, b.metode_pembayaran, b.lokasi, b.catatan, b.foto_uri, b.customer_name, b.customer_phone]
      );
    }

    // 5. Monitorings
    console.log('Inserting initial monitorings...');
    const monitorings = [
      {
        id: 'mon-001',
        booking_id: 'bok-001',
        kondisi: 'baik',
        bensin: 'setengah',
        lokasi: 'Slot A-01',
        catatan: 'Motor bersih, ban aman, terparkir rapi beratap.',
        foto_uri: null,
        updated_by: 'usr-004'
      }
    ];

    for (const m of monitorings) {
      await pool.query(
        `INSERT INTO monitorings (id, booking_id, kondisi, bensin, lokasi, catatan, foto_uri, updated_by)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE kondisi = VALUES(kondisi), bensin = VALUES(bensin), catatan = VALUES(catatan)`,
        [m.id, m.booking_id, m.kondisi, m.bensin, m.lokasi, m.catatan, m.foto_uri, m.updated_by]
      );
    }

    console.log('✅ Seeding database NITIPIN selesai!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Gagal melakukan seed:', error);
    process.exit(1);
  }
}

seed();

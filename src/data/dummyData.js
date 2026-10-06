// ============================================================
// DUMMY DATA TERPUSAT — NITIPIN
// ============================================================

// ── USERS ────────────────────────────────────────────────────
export const dummyUsers = [
  {
    id: 'u1',
    name: 'Budi Santoso',
    email: 'budi@gmail.com',
    password: '123456',
    phone: '081234567890',
    role: 'customer',
  },
  {
    id: 'u2',
    name: 'Siti Rahayu',
    email: 'siti@gmail.com',
    password: '123456',
    phone: '082345678901',
    role: 'customer',
  },
  {
    id: 'u3',
    name: 'Andi Prasetyo',
    email: 'andi@gmail.com',
    password: '123456',
    phone: '083456789012',
    role: 'customer',
  },
  {
    id: 'p1',
    name: 'Pak Roni',
    email: 'pengelola@nitipin.id',
    password: 'admin123',
    phone: '085678901234',
    role: 'pengelola',
  },
];

// ── DUMMY PLACEHOLDER FOTO ────────────────────────────────────
// URI gambar motor placeholder (online, bebas digunakan)
export const MOTOR_PLACEHOLDER_IMAGES = [
  'https://i.pinimg.com/736x/2c/7f/b3/2c7fb30e6a6a3c9e7a93f4b29a6dfb35.jpg',
  'https://i.pinimg.com/736x/0d/55/1c/0d551c5e58c3bcc7148a71b1143e3af4.jpg',
  'https://i.pinimg.com/736x/4f/08/75/4f087545d3e0fbcc99c7a0ad80dd1e7c.jpg',
];

// ── BOOKINGS ─────────────────────────────────────────────────
export const initialBookings = [
  {
    id: 'b1',
    customerId: 'u1',
    customerName: 'Budi Santoso',
    customerPhone: '081234567890',
    nomorPolisi: 'B 5069 BLP',
    merek: 'Honda Vario 160',
    warna: 'Hitam',
    tanggalMasuk: '2026-09-29',
    tanggalKeluar: '2026-10-02',
    status: 'sedang_dititipkan',
    lokasi: 'Area Penyimpanan A-12',
    totalBiaya: 90000,
    metodePembayaran: 'qris',
    createdAt: '2026-09-28',
    catatan: '',
    fotoIndex: 0,
  },
  {
    id: 'b2',
    customerId: 'u2',
    customerName: 'Siti Rahayu',
    customerPhone: '082345678901',
    nomorPolisi: 'D 4321 XYZ',
    merek: 'Yamaha NMAX 155',
    warna: 'Putih',
    tanggalMasuk: '2026-09-27',
    tanggalKeluar: '2026-10-01',
    status: 'dikonfirmasi',
    lokasi: 'Area Penyimpanan B-07',
    totalBiaya: 120000,
    metodePembayaran: null,
    createdAt: '2026-09-26',
    catatan: '',
    fotoIndex: 1,
  },
  {
    id: 'b3',
    customerId: 'u3',
    customerName: 'Andi Prasetyo',
    customerPhone: '083456789012',
    nomorPolisi: 'B 9876 NOP',
    merek: 'Honda Beat 110',
    warna: 'Merah',
    tanggalMasuk: '2026-09-29',
    tanggalKeluar: '2026-10-05',
    status: 'menunggu_konfirmasi',
    lokasi: null,
    totalBiaya: 180000,
    metodePembayaran: null,
    createdAt: '2026-09-29',
    catatan: '',
    fotoIndex: 2,
  },
  {
    id: 'b4',
    customerId: 'u1',
    customerName: 'Budi Santoso',
    customerPhone: '081234567890',
    nomorPolisi: 'B 1234 ABC',
    merek: 'Yamaha Mio M3',
    warna: 'Biru',
    tanggalMasuk: '2026-09-15',
    tanggalKeluar: '2026-09-20',
    status: 'selesai',
    lokasi: 'Area Penyimpanan C-03',
    totalBiaya: 150000,
    metodePembayaran: 'transfer',
    createdAt: '2026-09-14',
    catatan: '',
    fotoIndex: 1,
  },
  {
    id: 'b5',
    customerId: 'u1',
    customerName: 'Budi Santoso',
    customerPhone: '081234567890',
    nomorPolisi: 'B 7777 ZZZ',
    merek: 'Suzuki GSX-R 150',
    warna: 'Merah Hitam',
    tanggalMasuk: '2026-09-10',
    tanggalKeluar: '2026-09-12',
    status: 'dibatalkan',
    lokasi: null,
    totalBiaya: 60000,
    metodePembayaran: null,
    createdAt: '2026-09-09',
    catatan: '',
    fotoIndex: 2,
  },
];

// ── MONITORING DATA ───────────────────────────────────────────
export const initialMonitoring = [
  {
    id: 'm1',
    bookingId: 'b1',
    tanggalMonitoring: '2026-09-29',
    lokasi: 'Area Penyimpanan A-12',
    kondisiKeseluruhan: 'Baik',
    bensin: '3/4',
    kondisiBody: 'Tidak ada kerusakan',
    kondisiBan: 'Baik',
    catatan: 'Motor dalam kondisi baik selama proses penitipan.',
    fotoIndex: 0,
  },
];

// ── CONSTANTS ────────────────────────────────────────────────
export const HARGA_PER_HARI = 30000; // Rp 30.000/hari

export const LOKASI_OPTIONS = [
  'Area Penyimpanan A-01',
  'Area Penyimpanan A-12',
  'Area Penyimpanan B-07',
  'Area Penyimpanan B-15',
  'Area Penyimpanan C-03',
  'Area Penyimpanan C-08',
  'Area Penyimpanan D-04',
];

export const KONDISI_OPTIONS = ['Sangat Baik', 'Baik', 'Cukup', 'Perlu Perhatian'];
export const BENSIN_OPTIONS = ['Penuh', '3/4', '1/2', '1/4', 'Hampir Habis'];

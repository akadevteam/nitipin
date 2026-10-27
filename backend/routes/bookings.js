const router = require('express').Router();
const { v4: uuidv4 } = require('uuid');
const pool = require('../config/db');
const auth = require('../middleware/auth');

// Helper: map DB row (snake_case) → camelCase for mobile app
function mapBooking(b) {
  return {
    id: b.id,
    customerId: b.customer_id,
    nomorPolisi: b.nomor_polisi,
    merek: b.merek,
    warna: b.warna,
    tanggalMasuk: b.tanggal_masuk instanceof Date
      ? b.tanggal_masuk.toISOString().split('T')[0]
      : String(b.tanggal_masuk),
    tanggalKeluar: b.tanggal_keluar instanceof Date
      ? b.tanggal_keluar.toISOString().split('T')[0]
      : String(b.tanggal_keluar),
    status: b.status,
    totalBiaya: parseFloat(b.total_biaya || 0),
    metodePembayaran: b.metode_pembayaran || null,
    lokasi: b.lokasi || null,
    catatan: b.catatan || null,
    fotoUri: b.foto_uri || null,
    customerName: b.customer_name,
    customerPhone: b.customer_phone || null,
    createdAt: b.created_at,
  };
}

// ─── GET /api/bookings ─────────────────────────────────────────────────────
// Pengelola → semua booking | Customer → booking miliknya
router.get('/', auth, async (req, res) => {
  try {
    let rows;
    if (req.user.role === 'pengelola') {
      [rows] = await pool.query(
        `SELECT b.*, u.phone AS customer_phone
         FROM bookings b
         LEFT JOIN users u ON b.customer_id = u.id
         ORDER BY b.created_at DESC`
      );
    } else {
      [rows] = await pool.query(
        `SELECT b.*, u.phone AS customer_phone
         FROM bookings b
         LEFT JOIN users u ON b.customer_id = u.id
         WHERE b.customer_id = ?
         ORDER BY b.created_at DESC`,
        [req.user.id]
      );
    }
    res.json(rows.map(mapBooking));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── GET /api/bookings/:id ─────────────────────────────────────────────────
router.get('/:id', auth, async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT b.*, u.phone AS customer_phone
       FROM bookings b
       LEFT JOIN users u ON b.customer_id = u.id
       WHERE b.id = ?`,
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ message: 'Booking tidak ditemukan' });
    res.json(mapBooking(rows[0]));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── POST /api/bookings ────────────────────────────────────────────────────
router.post('/', auth, async (req, res) => {
  if (req.user.role !== 'customer')
    return res.status(403).json({ message: 'Hanya customer yang bisa membuat booking' });

  const { nomorPolisi, merek, warna, tanggalMasuk, tanggalKeluar, catatan, fotoUri } = req.body;
  if (!nomorPolisi || !tanggalMasuk || !tanggalKeluar)
    return res.status(400).json({ message: 'Nomor polisi, tanggal masuk, dan tanggal keluar wajib diisi' });

  try {
    const [users] = await pool.query('SELECT name, phone FROM users WHERE id = ?', [req.user.id]);
    const user = users[0];

    // Hitung biaya
    const msPerDay = 1000 * 60 * 60 * 24;
    const duration = Math.max(1, Math.ceil(
      (new Date(tanggalKeluar) - new Date(tanggalMasuk)) / msPerDay
    ));
    const totalBiaya = duration * 30000;

    const id = uuidv4();
    await pool.query(
      `INSERT INTO bookings
       (id, customer_id, nomor_polisi, merek, warna, tanggal_masuk, tanggal_keluar,
        status, total_biaya, catatan, foto_uri, customer_name, customer_phone)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'menunggu_konfirmasi', ?, ?, ?, ?, ?)`,
      [id, req.user.id, nomorPolisi.toUpperCase().trim(), merek, warna,
       tanggalMasuk, tanggalKeluar, totalBiaya, catatan || null, fotoUri || null,
       user.name, user.phone || null]
    );

    const [newRows] = await pool.query(
      `SELECT b.*, u.phone AS customer_phone FROM bookings b
       LEFT JOIN users u ON b.customer_id = u.id WHERE b.id = ?`, [id]
    );
    res.status(201).json(mapBooking(newRows[0]));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── PATCH /api/bookings/:id ───────────────────────────────────────────────
router.patch('/:id', auth, async (req, res) => {
  const { id } = req.params;

  // Map camelCase → snake_case
  const fieldMap = {
    status:           'status',
    metodePembayaran: 'metode_pembayaran',
    lokasi:           'lokasi',
    catatan:          'catatan',
    fotoUri:          'foto_uri',
    tanggalKeluar:    'tanggal_keluar',
    totalBiaya:       'total_biaya',
  };

  const setClauses = [];
  const values = [];
  for (const [key, col] of Object.entries(fieldMap)) {
    if (req.body[key] !== undefined) {
      setClauses.push(`${col} = ?`);
      values.push(req.body[key]);
    }
  }

  if (!setClauses.length)
    return res.status(400).json({ message: 'Tidak ada field yang diupdate' });

  values.push(id);

  try {
    await pool.query(`UPDATE bookings SET ${setClauses.join(', ')} WHERE id = ?`, values);
    const [rows] = await pool.query(
      `SELECT b.*, u.phone AS customer_phone FROM bookings b
       LEFT JOIN users u ON b.customer_id = u.id WHERE b.id = ?`, [id]
    );
    if (!rows.length) return res.status(404).json({ message: 'Booking tidak ditemukan' });
    res.json(mapBooking(rows[0]));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;

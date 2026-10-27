const router = require('express').Router();
const { v4: uuidv4 } = require('uuid');
const pool = require('../config/db');
const auth = require('../middleware/auth');

function mapMonitoring(m) {
  return {
    id: m.id,
    bookingId: m.booking_id,
    kondisi: m.kondisi,
    bensin: m.bensin,
    lokasi: m.lokasi || null,
    catatan: m.catatan || null,
    fotoUri: m.foto_uri || null,
    updatedBy: m.updated_by || null,
    updatedAt: m.updated_at,
  };
}

// ─── GET /api/monitorings/:bookingId ──────────────────────────────────────
router.get('/:bookingId', auth, async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM monitorings WHERE booking_id = ? ORDER BY updated_at DESC LIMIT 1',
      [req.params.bookingId]
    );
    if (!rows.length)
      return res.status(404).json({ message: 'Belum ada data monitoring untuk booking ini' });
    res.json(mapMonitoring(rows[0]));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── POST /api/monitorings ─────────────────────────────────────────────────
// Tambah atau update monitoring (hanya pengelola)
router.post('/', auth, async (req, res) => {
  if (req.user.role !== 'pengelola')
    return res.status(403).json({ message: 'Hanya pengelola yang bisa mengelola data monitoring' });

  const { bookingId, kondisi, bensin, lokasi, catatan, fotoUri } = req.body;
  if (!bookingId)
    return res.status(400).json({ message: 'bookingId wajib diisi' });

  try {
    // Cek apakah sudah ada
    const [existing] = await pool.query(
      'SELECT id FROM monitorings WHERE booking_id = ?', [bookingId]
    );

    if (existing.length > 0) {
      // Update
      await pool.query(
        `UPDATE monitorings
         SET kondisi = ?, bensin = ?, lokasi = ?, catatan = ?, foto_uri = ?, updated_by = ?
         WHERE booking_id = ?`,
        [kondisi || 'baik', bensin || 'setengah', lokasi || null,
         catatan || null, fotoUri || null, req.user.id, bookingId]
      );
    } else {
      // Insert baru
      await pool.query(
        `INSERT INTO monitorings (id, booking_id, kondisi, bensin, lokasi, catatan, foto_uri, updated_by)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [uuidv4(), bookingId, kondisi || 'baik', bensin || 'setengah',
         lokasi || null, catatan || null, fotoUri || null, req.user.id]
      );
    }

    const [rows] = await pool.query(
      'SELECT * FROM monitorings WHERE booking_id = ? ORDER BY updated_at DESC LIMIT 1',
      [bookingId]
    );
    res.json(mapMonitoring(rows[0]));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;

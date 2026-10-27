const router = require('express').Router();
const pool = require('../config/db');
const auth = require('../middleware/auth');

function requirePengelola(req, res, next) {
  if (req.user.role !== 'pengelola') {
    return res.status(403).json({ success: false, message: 'Hanya pengelola yang berhak mengelola slot parkir' });
  }
  next();
}

// ─── GET /api/slots (Daftar Slot Parkir) ───────────────────────────────────
router.get('/', auth, async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM slot_parkir ORDER BY nama_slot ASC'
    );
    const mapped = rows.map(s => ({
      id: s.id,
      nama_slot: s.nama_slot,
      kapasitas: s.kapasitas,
      status: s.status,
      kendaraan: [],
    }));
    res.json({
      success: true,
      message: 'Daftar slot parkir berhasil diambil',
      data: mapped,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── POST /api/slots (Tambah Slot Baru) ────────────────────────────────────
router.post('/', auth, requirePengelola, async (req, res) => {
  const { nama_slot, kapasitas, status } = req.body;
  if (!nama_slot) {
    return res.status(400).json({ success: false, message: 'Nama slot wajib diisi' });
  }

  try {
    const id = `slot-${Date.now().toString().slice(-4)}`;
    await pool.query(
      'INSERT INTO slot_parkir (id, nama_slot, kapasitas, status) VALUES (?, ?, ?, ?)',
      [id, nama_slot.trim(), kapasitas || 1, status || 'tersedia']
    );
    res.status(201).json({
      success: true,
      message: 'Slot parkir berhasil ditambahkan',
      data: { id, nama_slot, kapasitas: kapasitas || 1, status: status || 'tersedia' },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── PATCH /api/slots/:id (Update Status Slot) ─────────────────────────────
router.patch('/:id', auth, requirePengelola, async (req, res) => {
  const { status, nama_slot } = req.body;
  try {
    await pool.query(
      `UPDATE slot_parkir
       SET status = COALESCE(?, status),
           nama_slot = COALESCE(?, nama_slot)
       WHERE id = ?`,
      [status, nama_slot, req.params.id]
    );
    res.json({
      success: true,
      message: 'Status slot parkir berhasil diupdate',
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── DELETE /api/slots/:id (Hapus Slot) ────────────────────────────────────
router.delete('/:id', auth, requirePengelola, async (req, res) => {
  try {
    const [result] = await pool.query('DELETE FROM slot_parkir WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Slot parkir tidak ditemukan' });
    }
    res.json({
      success: true,
      message: 'Slot parkir berhasil dihapus',
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;

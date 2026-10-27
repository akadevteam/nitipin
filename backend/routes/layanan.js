const router = require('express').Router();
const { v4: uuidv4 } = require('uuid');
const pool = require('../config/db');
const auth = require('../middleware/auth');

// Helper role pengelola only
function requirePengelola(req, res, next) {
  if (req.user.role !== 'pengelola') {
    return res.status(403).json({ success: false, message: 'Akses ditolak: Hanya pengelola yang berhak mengelola layanan' });
  }
  next();
}

// ─── GET /api/layanan (Get Semua Layanan) ──────────────────────────────────
router.get('/', auth, async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM layanan ORDER BY tarif ASC'
    );
    const mapped = rows.map(l => ({
      id: l.id,
      nama: l.nama,
      tarif: parseFloat(l.tarif),
      tarif_unit: l.tarif_unit,
      deskripsi: l.deskripsi || '',
      fitur: typeof l.fitur === 'string' ? JSON.parse(l.fitur) : (l.fitur || []),
      is_aktif: Boolean(l.is_aktif),
    }));
    res.json({
      success: true,
      message: 'Daftar layanan berhasil diambil',
      data: mapped,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── GET /api/layanan/:id (Get Detail Layanan) ──────────────────────────────
router.get('/:id', auth, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM layanan WHERE id = ?', [req.params.id]);
    if (!rows.length) {
      return res.status(404).json({ success: false, message: 'Layanan tidak ditemukan' });
    }
    const l = rows[0];
    res.json({
      success: true,
      data: {
        id: l.id,
        nama: l.nama,
        tarif: parseFloat(l.tarif),
        tarif_unit: l.tarif_unit,
        deskripsi: l.deskripsi || '',
        fitur: typeof l.fitur === 'string' ? JSON.parse(l.fitur) : (l.fitur || []),
        is_aktif: Boolean(l.is_aktif),
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── POST /api/layanan (Tambah Layanan Baru - Pengelola) ─────────────────────
router.post('/', auth, requirePengelola, async (req, res) => {
  const { nama, tarif, tarif_unit, deskripsi, fitur } = req.body;
  if (!nama || !tarif) {
    return res.status(400).json({ success: false, message: 'Nama dan tarif layanan wajib diisi' });
  }

  try {
    const id = `lay-${Date.now().toString().slice(-4)}`;
    const fiturJson = JSON.stringify(Array.isArray(fitur) ? fitur : []);

    await pool.query(
      `INSERT INTO layanan (id, nama, tarif, tarif_unit, deskripsi, fitur, is_aktif)
       VALUES (?, ?, ?, ?, ?, ?, 1)`,
      [id, nama.trim(), parseFloat(tarif), tarif_unit || 'hari', deskripsi || '', fiturJson]
    );

    res.status(201).json({
      success: true,
      message: 'Layanan baru berhasil ditambahkan',
      data: { id, nama, tarif, tarif_unit: tarif_unit || 'hari', deskripsi, fitur },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── PUT /api/layanan/:id (Update Layanan - Pengelola) ───────────────────────
router.put('/:id', auth, requirePengelola, async (req, res) => {
  const { nama, tarif, tarif_unit, deskripsi, fitur, is_aktif } = req.body;
  try {
    const [exist] = await pool.query('SELECT id FROM layanan WHERE id = ?', [req.params.id]);
    if (!exist.length) {
      return res.status(404).json({ success: false, message: 'Layanan tidak ditemukan' });
    }

    const fiturJson = fitur ? JSON.stringify(Array.isArray(fitur) ? fitur : []) : undefined;

    await pool.query(
      `UPDATE layanan
       SET nama = COALESCE(?, nama),
           tarif = COALESCE(?, tarif),
           tarif_unit = COALESCE(?, tarif_unit),
           deskripsi = COALESCE(?, deskripsi),
           fitur = COALESCE(?, fitur),
           is_aktif = COALESCE(?, is_aktif)
       WHERE id = ?`,
      [nama, tarif, tarif_unit, deskripsi, fiturJson, is_aktif, req.params.id]
    );

    res.json({
      success: true,
      message: 'Layanan berhasil diperbarui',
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── DELETE /api/layanan/:id (Hapus Layanan - Pengelola) ────────────────────
router.delete('/:id', auth, requirePengelola, async (req, res) => {
  try {
    const [result] = await pool.query('DELETE FROM layanan WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Layanan tidak ditemukan' });
    }
    res.json({
      success: true,
      message: 'Layanan berhasil dihapus',
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;

const router  = require('express').Router();
const bcrypt  = require('bcryptjs');
const jwt     = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const pool    = require('../config/db');
const authMiddleware = require('../middleware/auth');

const SECRET = process.env.JWT_SECRET || 'nitipin_super_secret_key_2024';
const EXPIRES = process.env.JWT_EXPIRES_IN || '7d';

function makeToken(user) {
  return jwt.sign({ id: user.id, email: user.email, role: user.role }, SECRET, { expiresIn: EXPIRES });
}

// ─── POST /api/auth/login ──────────────────────────────────────────────────
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ success: false, message: 'Email dan password wajib diisi' });

  try {
    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email.trim().toLowerCase()]);
    if (rows.length === 0)
      return res.status(401).json({ success: false, message: 'Email atau password salah' });

    const user = rows[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(401).json({ success: false, message: 'Email atau password salah' });

    const token = makeToken(user);
    res.json({
      success: true,
      message: 'Login berhasil',
      token,
      user: { id: user.id, name: user.name, email: user.email, phone: user.phone, role: user.role },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
});

// ─── POST /api/auth/register ───────────────────────────────────────────────
router.post('/register', async (req, res) => {
  const { name, email, phone, password } = req.body;
  if (!name || !email || !password)
    return res.status(400).json({ success: false, message: 'Nama, email, dan password wajib diisi' });
  if (password.length < 6)
    return res.status(400).json({ success: false, message: 'Password minimal 6 karakter' });

  try {
    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email.trim().toLowerCase()]);
    if (existing.length > 0)
      return res.status(409).json({ success: false, message: 'Email sudah terdaftar. Silakan login.' });

    const id = uuidv4();
    const hashed = await bcrypt.hash(password, 10);

    await pool.query(
      'INSERT INTO users (id, name, email, phone, password, role) VALUES (?, ?, ?, ?, ?, ?)',
      [id, name.trim(), email.trim().toLowerCase(), phone || null, hashed, 'customer']
    );

    const token = makeToken({ id, email: email.trim().toLowerCase(), role: 'customer' });
    res.status(201).json({
      success: true,
      message: 'Registrasi berhasil',
      token,
      user: { id, name: name.trim(), email: email.trim().toLowerCase(), phone: phone || null, role: 'customer' },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
});

// ─── POST /api/auth/logout ─────────────────────────────────────────────────
// Pada stateless JWT, logout di server memberitahu client untuk menghapus token
router.post('/logout', authMiddleware, async (req, res) => {
  try {
    res.json({
      success: true,
      message: 'Logout berhasil. Sesi telah diakhiri.',
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── GET /api/auth/me ──────────────────────────────────────────────────────
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, name, email, phone, role FROM users WHERE id = ?', [req.user.id]
    );
    if (rows.length === 0) return res.status(404).json({ success: false, message: 'User tidak ditemukan' });
    res.json({
      success: true,
      user: rows[0],
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;

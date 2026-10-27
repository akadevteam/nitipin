require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();

// ─── Middleware ────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// ─── Routes ───────────────────────────────────────────────────────────────
app.use('/api/auth',        require('./routes/auth'));
app.use('/api/bookings',    require('./routes/bookings'));
app.use('/api/monitorings', require('./routes/monitorings'));
app.use('/api/layanan',     require('./routes/layanan'));
app.use('/api/slots',       require('./routes/slots'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'NITIPIN Backend is running 🛵',
    timestamp: new Date().toISOString(),
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: `Route ${req.method} ${req.path} tidak ditemukan` });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('[ERROR]', err);
  res.status(500).json({ message: 'Internal server error', error: err.message });
});

// ─── Start Server ─────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\n🚀 NITIPIN Backend berjalan di port ${PORT}`);
  console.log(`   Health check: http://localhost:${PORT}/api/health\n`);
});

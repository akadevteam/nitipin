const router = require('express').Router();
const { v4: uuidv4 } = require('uuid');
const pool = require('../config/db');

// In-memory fallback if MySQL table doesn't exist yet
const inMemoryTokens = new Map();
const inMemoryHistory = [];

// Initialize table if not exists
async function ensureTables() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS device_tokens (
        id           VARCHAR(36) PRIMARY KEY,
        user_id      VARCHAR(36) DEFAULT NULL,
        push_token   VARCHAR(255) NOT NULL UNIQUE,
        device_name  VARCHAR(100) DEFAULT NULL,
        platform     VARCHAR(20)  DEFAULT 'android',
        created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS notification_history (
        id           VARCHAR(36) PRIMARY KEY,
        user_id      VARCHAR(36) DEFAULT NULL,
        title        VARCHAR(255) NOT NULL,
        body         TEXT NOT NULL,
        data_payload JSON DEFAULT NULL,
        push_token   VARCHAR(255) DEFAULT NULL,
        status       VARCHAR(50) DEFAULT 'sent',
        created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
  } catch (err) {
    console.warn('[NOTIF TABLE INIT WARNING]', err.message);
  }
}
ensureTables();

// ─── POST /api/notifications/register-token ────────────────────────────────
// Task 01: Mendaftarkan push token perangkat ke server
router.post('/register-token', async (req, res) => {
  const { token, pushToken, userId, deviceName, platform } = req.body;
  const targetToken = token || pushToken;

  if (!targetToken) {
    return res.status(400).json({
      success: false,
      message: 'push_token wajib disertakan'
    });
  }

  const tokenRecord = {
    id: uuidv4(),
    user_id: userId || null,
    push_token: targetToken,
    device_name: deviceName || 'Unknown Device',
    platform: platform || 'android',
    updated_at: new Date()
  };

  try {
    await pool.query(
      `INSERT INTO device_tokens (id, user_id, push_token, device_name, platform)
       VALUES (?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         user_id = VALUES(user_id),
         device_name = VALUES(device_name),
         platform = VALUES(platform),
         updated_at = CURRENT_TIMESTAMP`,
      [tokenRecord.id, tokenRecord.user_id, tokenRecord.push_token, tokenRecord.device_name, tokenRecord.platform]
    );

    console.log(`[PUSH TOKEN REGISTERED] ${targetToken} (${tokenRecord.device_name})`);

    return res.status(200).json({
      success: true,
      message: 'Push token perangkat berhasil disimpan di database server MySQL',
      data: tokenRecord
    });
  } catch (err) {
    console.error('[REGISTER TOKEN DB ERROR]', err.message);
    // Fallback in-memory
    inMemoryTokens.set(targetToken, tokenRecord);
    return res.status(200).json({
      success: true,
      message: 'Push token tersimpan (fallback memory): ' + err.message,
      data: tokenRecord
    });
  }
});

// ─── GET /api/notifications/tokens ─────────────────────────────────────────
// Mendapatkan daftar perangkat terdaftar
router.get('/tokens', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT * FROM device_tokens ORDER BY updated_at DESC`
    );
    return res.json({ success: true, count: rows.length, data: rows });
  } catch (err) {
    return res.json({
      success: true,
      count: inMemoryTokens.size,
      data: Array.from(inMemoryTokens.values()),
      source: 'memory'
    });
  }
});

// ─── POST /api/notifications/send ──────────────────────────────────────────
// Task 02: Mengirim Push Notification melalui Expo Push Service API
router.post('/send', async (req, res) => {
  const { to, title, body, data, priority, sound } = req.body;

  if (!to || !title || !body) {
    return res.status(400).json({
      success: false,
      message: 'Field to (push token), title, dan body wajib diisi!'
    });
  }

  // Siapkan format pesan standar Expo Push Service
  const message = {
    to,
    sound: sound || 'default',
    title,
    body,
    data: data || {},
    priority: priority || 'high',
    channelId: 'nitipin-channel', // Sesuai Android Notification Channel
  };

  try {
    console.log(`[PUSH SENDING] To: ${to} | Title: "${title}"`);

    // Panggil Expo Push Server
    const response = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Accept-encoding': 'gzip, deflate',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(message),
    });

    const result = await response.json();
    console.log('[EXPO PUSH RESPONSE]', JSON.stringify(result));

    // Simpan ke riwayat notifikasi
    const notifId = uuidv4();
    try {
      await pool.query(
        `INSERT INTO notification_history (id, user_id, title, body, data_payload, push_token, status)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [notifId, null, title, body, JSON.stringify(data || {}), to, 'sent']
      );
    } catch (dbErr) {
      inMemoryHistory.unshift({ id: notifId, title, body, data, to, createdAt: new Date() });
    }

    return res.status(200).json({
      success: true,
      message: 'Notifikasi berhasil dikirim melalui Expo Push Service Provider',
      expoResponse: result,
      sentMessage: message
    });
  } catch (err) {
    console.error('[PUSH SEND ERROR]', err.message);
    return res.status(500).json({
      success: false,
      message: 'Gagal mengirim push notifikasi: ' + err.message
    });
  }
});

// ─── GET /api/notifications/history ────────────────────────────────────────
router.get('/history', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT * FROM notification_history ORDER BY created_at DESC LIMIT 20`
    );
    return res.json({ success: true, data: rows });
  } catch (err) {
    return res.json({ success: true, data: inMemoryHistory.slice(0, 20) });
  }
});

module.exports = router;

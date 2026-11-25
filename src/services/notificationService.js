// ============================================================
// NOTIFICATION SERVICE — EXPO PUSH NOTIFICATIONS
// Week 11 / Sprint 09: Push Notification Integration
// ============================================================
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { API_BASE_URL } from './api';

// ─── 1. Handler Tampilan Foreground (mobile only) ───────────
// Agar notifikasi tetap muncul sebagai banner pop-up saat aplikasi sedang aktif dibuka
if (Platform.OS !== 'web') {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
    }),
  });
}

// Channel ID default untuk Android
export const NOTIFICATION_CHANNEL_ID = 'nitipin-channel';

// ─── 2. Web Notification API Helper ─────────────────────────

/**
 * Minta izin notifikasi via Web Notification API (browser)
 */
export async function requestWebNotificationPermission() {
  if (typeof Notification === 'undefined') {
    return 'unsupported';
  }
  if (Notification.permission === 'granted') {
    return 'granted';
  }
  const result = await Notification.requestPermission();
  return result; // 'granted' | 'denied' | 'default'
}

/**
 * Tampilkan notifikasi native browser via Web Notification API
 */
export function showBrowserNotification(title, body, data = {}) {
  if (typeof Notification === 'undefined' || Notification.permission !== 'granted') {
    console.warn('[WEB NOTIF] Browser tidak mendukung atau izin belum diberikan.');
    return null;
  }
  const notif = new Notification(title, {
    body,
    icon: '/icon.png',
    tag: data?.screen || 'nitipin',
    data,
  });
  notif.onclick = () => {
    window.focus();
    notif.close();
  };
  return notif;
}

/**
 * Task 01: Registrasi perangkat untuk notifikasi
 * - Web: pakai Web Notification API
 * - Mobile: pakai expo-notifications
 */
export async function registerForPushNotificationsAsync(userId = null) {
  // ── Web Platform ─────────────────────────────────────────
  if (Platform.OS === 'web') {
    const webPerm = await requestWebNotificationPermission();
    const mockToken = `WEB-BROWSER-TOKEN-${Date.now().toString().slice(-6)}`;

    if (webPerm === 'granted') {
      // Simpan token mock ke backend
      try {
        const res = await fetch(`${API_BASE_URL}/notifications/register-token`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            pushToken: mockToken,
            userId: userId || 'u1',
            deviceName: 'Web Browser',
            platform: 'web',
          }),
        });
        const json = await res.json();
        console.log('[WEB TOKEN BACKEND SYNC]', json.message);
      } catch (e) {
        console.warn('[WEB TOKEN BACKEND OFFLINE]', e.message);
      }
      return {
        success: true,
        token: mockToken,
        status: 'granted',
        deviceName: 'Web Browser',
        isMock: true,
        platform: 'web',
      };
    } else {
      return {
        success: false,
        status: webPerm,
        error: `Izin notifikasi browser: ${webPerm}. Izinkan di ikon kunci (🔒) address bar.`,
        platform: 'web',
      };
    }
  }

  // ── Mobile Platform ───────────────────────────────────────

  // A. Konfigurasi Channel khusus Android (Oreo 8.0+)
  if (Platform.OS === 'android') {
    try {
      await Notifications.setNotificationChannelAsync(NOTIFICATION_CHANNEL_ID, {
        name: 'Notifikasi Penitipan NITIPIN',
        description: 'Pemberitahuan status loker, waktu titip, dan update barang',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#1A56DB',
        enableVibrate: true,
      });
    } catch (channelErr) {
      console.warn('[NOTIF CHANNEL SETUP WARNING]', channelErr.message);
    }
  }

  // B. Minta Izin Notifikasi (Runtime Permission)
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    return {
      success: false,
      error: 'Izin notifikasi ditolak oleh pengguna.',
      status: finalStatus,
    };
  }

  // C. Dapatkan Expo Push Token
  let token = null;
  try {
    const pushTokenData = await Notifications.getExpoPushTokenAsync();
    token = pushTokenData.data;
    console.log('[PUSH TOKEN GOT]', token);
  } catch (error) {
    console.warn('[PUSH TOKEN WARNING] Gagal getExpoPushToken:', error.message);
    token = `ExponentPushToken[SIMULATOR-${Device.modelName || 'DEVICE'}-${Date.now().toString().slice(-6)}]`;
  }

  // D. Kirim & Simpan Token ke Server MySQL (Task 01)
  if (token) {
    try {
      const response = await fetch(`${API_BASE_URL}/notifications/register-token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pushToken: token,
          userId: userId || 'u1',
          deviceName: `${Device.brand || ''} ${Device.modelName || Platform.OS}`.trim(),
          platform: Platform.OS,
        }),
      });
      const resJson = await response.json();
      console.log('[PUSH TOKEN BACKEND SYNC]', resJson.message);
    } catch (apiErr) {
      console.warn('[PUSH TOKEN BACKEND OFFLINE]', apiErr.message);
    }
  }

  return {
    success: true,
    token,
    status: finalStatus,
    deviceName: `${Device.brand || ''} ${Device.modelName || Platform.OS}`.trim(),
  };
}

/**
 * Task 02: Mengirim Push Notification
 * - Web: tampilkan via Web Notification API + kirim ke backend untuk log
 * - Mobile: kirim ke backend + local notification fallback
 */
export async function sendPushNotification({ to, title, body, data = {} }) {
  // ── Web: Langsung tampilkan via browser Notification API ──
  if (Platform.OS === 'web') {
    const perm = await requestWebNotificationPermission();
    if (perm === 'granted') {
      showBrowserNotification(title, body, data);
    }

    // Juga catat ke backend log (best-effort)
    try {
      await fetch(`${API_BASE_URL}/notifications/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to, title, body, data }),
      });
    } catch (_) {
      // Backend offline, tidak masalah — notif sudah tampil di browser
    }

    return {
      success: perm === 'granted',
      method: 'web-browser',
      message: perm === 'granted'
        ? 'Notifikasi browser berhasil ditampilkan'
        : 'Izin notifikasi browser ditolak. Izinkan di ikon kunci (🔒) address bar.',
    };
  }

  // ── Mobile: kirim via backend server lalu local notification ─
  try {
    const response = await fetch(`${API_BASE_URL}/notifications/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ to, title, body, data }),
    });
    const resJson = await response.json();
    await sendLocalNotification({ title, body, data });
    return { success: true, method: resJson.success ? 'server' : 'local', data: resJson };
  } catch (backendErr) {
    console.warn('[BACKEND PUSH FAILED, FALLBACK LOCAL]', backendErr.message);
  }

  return await sendLocalNotification({ title, body, data });
}

/**
 * Memicu Notifikasi Lokal (mobile only)
 */
export async function sendLocalNotification({ title, body, data = {} }) {
  if (Platform.OS === 'web') {
    // Di web, langsung pakai browser notification
    const perm = await requestWebNotificationPermission();
    if (perm === 'granted') {
      showBrowserNotification(title, body, data);
      return { success: true, method: 'web-browser' };
    }
    return { success: false, error: 'Izin browser Notification diperlukan' };
  }

  try {
    const notificationId = await Notifications.scheduleNotificationAsync({
      content: { title, body, data, sound: 'default' },
      trigger: null,
    });
    return { success: true, method: 'local', notificationId, message: 'Notifikasi lokal berhasil' };
  } catch (err) {
    console.error('[LOCAL NOTIF ERROR]', err);
    return { success: false, error: err.message };
  }
}

// ─── Template Notifikasi Khusus NITIPIN ───────────────────────
export const NOTIFICATION_TEMPLATES = [
  {
    id: 'status_selesai',
    category: 'Status Penitipan',
    title: '🛵 Motor Siap Diambil!',
    body: 'Penitipan Honda Vario 160 (B 5069 BLP) telah selesai. Silakan menuju loker Hub UMM.',
    data: {
      screen: 'BookingDetail',
      bookingId: 'b1',
      action: 'pickup_ready',
    },
  },
  {
    id: 'reminder_waktu',
    category: 'Pengingat Waktu',
    title: '⏰ Pengingat: Batas Waktu 30 Menit Lagi',
    body: 'Waktu penitipan Anda akan berakhir pukul 17:00 WIB. Perpanjang atau segera ambil di Hub UMM.',
    data: {
      screen: 'BookingDetail',
      bookingId: 'b1',
      action: 'extend_reminder',
    },
  },
  {
    id: 'keamanan_loker',
    category: 'Keamanan Loker',
    title: '🔒 Pemeriksaan Keamanan Loker Rutin',
    body: 'Petugas NITIPIN telah memeriksa kondisi fisik kendaraan Anda dalam keadaan aman dan terkunci.',
    data: {
      screen: 'BookingDetail',
      bookingId: 'b1',
      action: 'security_check',
    },
  },
  {
    id: 'hub_geofence',
    category: 'Lokasi & Hub',
    title: '📍 Anda Mendekati Hub NITIPIN UMM',
    body: 'Sistem mendeteksi Anda berada di area Hub. Tunjukkan kode booking kepada petugas.',
    data: {
      screen: 'Location',
      id: 'HUB-UMM-01',
    },
  },
];

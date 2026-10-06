// ============================================================
// HELPER UTILITIES
// ============================================================

/**
 * Format angka ke format Rupiah
 * @param {number} amount
 * @returns {string} "Rp 90.000"
 */
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount);
};

/**
 * Format tanggal ke format Indonesia
 * @param {string} dateStr — "YYYY-MM-DD"
 * @returns {string} "29 September 2026"
 */
export const formatDate = (dateStr) => {
  if (!dateStr) return '-';
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
};

/**
 * Format tanggal singkat
 * @param {string} dateStr
 * @returns {string} "29 Sep 2026"
 */
export const formatDateShort = (dateStr) => {
  if (!dateStr) return '-';
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

/**
 * Hitung durasi penitipan dalam hari
 * @param {string} start
 * @param {string} end
 * @returns {number}
 */
export const calculateDuration = (start, end) => {
  const s = new Date(start + 'T00:00:00');
  const e = new Date(end + 'T00:00:00');
  const diff = Math.ceil((e - s) / (1000 * 60 * 60 * 24));
  return diff > 0 ? diff : 1;
};

/**
 * Hitung biaya berdasarkan durasi
 * @param {number} days
 * @param {number} pricePerDay
 * @returns {number}
 */
export const calculateCost = (days, pricePerDay = 30000) => {
  return days * pricePerDay;
};

/**
 * Cek apakah booking masih bisa dibatalkan
 * @param {string} status
 * @returns {boolean}
 */
export const canCancelBooking = (status) => {
  return ['menunggu_konfirmasi', 'dikonfirmasi'].includes(status);
};

/**
 * Cek apakah booking sudah bisa dibayar
 * @param {string} status
 * @returns {boolean}
 */
export const canPayBooking = (status) => {
  return status === 'dikonfirmasi';
};

/**
 * Dapatkan nama metode pembayaran
 * @param {string} method
 * @returns {string}
 */
export const getPaymentMethodLabel = (method) => {
  const labels = {
    tunai: 'Tunai',
    qris: 'QRIS',
    transfer: 'Transfer Bank',
  };
  return labels[method] || method || '-';
};

/**
 * Generate teks TTS untuk monitoring motor
 * @param {object} booking
 * @param {object} monitoring
 * @returns {string}
 */
export const generateMonitoringTTS = (booking, monitoring) => {
  let text = `Motor ${booking.nomorPolisi}`;
  if (monitoring?.lokasi) {
    text += ` berada di ${monitoring.lokasi}.`;
  }
  text += ` Kondisinya ${monitoring?.kondisiKeseluruhan || 'tidak diketahui'}.`;
  if (monitoring?.bensin) {
    text += ` Bensin ${monitoring.bensin}.`;
  }
  if (monitoring?.kondisiBody) {
    text += ` Body: ${monitoring.kondisiBody}.`;
  }
  if (monitoring?.kondisiBan) {
    text += ` Ban: ${monitoring.kondisiBan}.`;
  }
  if (monitoring?.catatan) {
    text += ` Catatan: ${monitoring.catatan}`;
  }
  return text;
};

/**
 * Generate teks TTS untuk pembayaran berhasil
 * @param {object} booking
 * @returns {string}
 */
export const generatePaymentSuccessTTS = (booking) => {
  return `Pembayaran berhasil. Motor ${booking.nomorPolisi} telah terdaftar untuk penitipan.`;
};

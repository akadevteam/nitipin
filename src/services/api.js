// ============================================================
// API CLIENT — RELIABLE API WITH FULL ERROR HANDLING
// Week 6: Error Handling & Reliable API
// ============================================================
import { Platform } from 'react-native';

// IP Wi-Fi laptop Anda saat ini: 192.168.0.10
export const API_BASE_URL = 'http://192.168.0.10:5000/api';

// ─── Konfigurasi ────────────────────────────────────────────
const DEFAULT_TIMEOUT_MS = 10000; // 10 detik
const MAX_RETRY_ATTEMPTS = 3;
const RETRY_DELAY_MS = 1000;      // delay awal 1 detik (exponential backoff)

// ─── Custom Error Classes ────────────────────────────────────

/**
 * Error jaringan: tidak bisa konek ke server sama sekali
 */
export class NetworkError extends Error {
  constructor(message = 'Tidak ada koneksi internet atau server tidak dapat dijangkau') {
    super(message);
    this.name = 'NetworkError';
    this.isNetworkError = true;
  }
}

/**
 * Error timeout: server terlalu lama merespons
 */
export class TimeoutError extends Error {
  constructor(message = 'Permintaan timeout — server tidak merespons') {
    super(message);
    this.name = 'TimeoutError';
    this.isTimeoutError = true;
  }
}

/**
 * Error HTTP: server merespons tapi dengan status error (4xx / 5xx)
 */
export class HttpError extends Error {
  constructor(statusCode, message, data = null) {
    super(message);
    this.name = 'HttpError';
    this.statusCode = statusCode;
    this.data = data;
    this.isHttpError = true;
  }
}

/**
 * Error validasi: data yang dikirim tidak valid (422)
 */
export class ValidationError extends Error {
  constructor(message, fields = {}) {
    super(message);
    this.name = 'ValidationError';
    this.fields = fields;
    this.isValidationError = true;
  }
}

// ─── Utility: Timeout Promise ────────────────────────────────

/**
 * Bungkus fetch dengan timeout menggunakan AbortController
 */
function fetchWithTimeout(url, options, timeoutMs = DEFAULT_TIMEOUT_MS) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  return fetch(url, { ...options, signal: controller.signal })
    .catch((err) => {
      if (err.name === 'AbortError') {
        throw new TimeoutError(`Request ke ${url} timeout setelah ${timeoutMs / 1000}s`);
      }
      // Network error (no internet, server down, dll)
      throw new NetworkError(err.message || 'Gagal terhubung ke server');
    })
    .finally(() => clearTimeout(timeoutId));
}

// ─── Utility: Delay ─────────────────────────────────────────

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// ─── Utility: Cek apakah error layak di-retry ───────────────

function isRetryable(error) {
  // Retry jika timeout atau network error
  if (error instanceof TimeoutError || error instanceof NetworkError) return true;
  // Retry jika server error (500, 502, 503, 504)
  if (error instanceof HttpError && error.statusCode >= 500) return true;
  return false;
}

// ─── Utility: Klasifikasi & parse error dari response ───────

async function parseResponseError(response) {
  let data = {};
  try {
    data = await response.json();
  } catch (_) {
    // body bukan JSON, biarkan kosong
  }

  const message = data?.message || data?.error || `Request gagal (HTTP ${response.status})`;

  // 401 Unauthorized
  if (response.status === 401) {
    return new HttpError(401, 'Sesi telah berakhir, silakan login kembali', data);
  }
  // 403 Forbidden
  if (response.status === 403) {
    return new HttpError(403, 'Anda tidak memiliki akses ke fitur ini', data);
  }
  // 404 Not Found
  if (response.status === 404) {
    return new HttpError(404, 'Data tidak ditemukan', data);
  }
  // 422 Validation
  if (response.status === 422) {
    return new ValidationError(message, data?.errors || {});
  }
  // 429 Rate Limit
  if (response.status === 429) {
    return new HttpError(429, 'Terlalu banyak permintaan, coba lagi sebentar', data);
  }
  // 5xx Server Error
  if (response.status >= 500) {
    return new HttpError(response.status, 'Server sedang bermasalah, coba lagi nanti', data);
  }

  return new HttpError(response.status, message, data);
}

// ─── API Client Class ────────────────────────────────────────

class ApiClient {
  constructor() {
    this.token = null;
  }

  setToken(token) {
    this.token = token;
  }

  clearToken() {
    this.token = null;
  }

  getHeaders() {
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    return headers;
  }

  /**
   * Core request dengan retry + timeout + error classification
   * @param {string} endpoint  — path relatif, e.g. '/auth/login'
   * @param {object} options   — fetch options (method, body, headers, dll)
   * @param {object} config    — konfigurasi tambahan
   * @param {number} config.timeout    — override timeout (ms)
   * @param {number} config.retries    — override max retry
   * @param {boolean} config.noRetry   — paksa nonaktifkan retry
   */
  async request(endpoint, options = {}, config = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const headers = { ...this.getHeaders(), ...(options.headers || {}) };
    const timeout = config.timeout ?? DEFAULT_TIMEOUT_MS;
    const maxRetries = config.noRetry ? 0 : (config.retries ?? MAX_RETRY_ATTEMPTS);

    let lastError = null;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      // Exponential backoff: tunggu sebelum retry (tidak untuk attempt pertama)
      if (attempt > 0) {
        const backoff = RETRY_DELAY_MS * Math.pow(2, attempt - 1);
        console.log(`[API] Retry ${attempt}/${maxRetries} untuk ${endpoint} dalam ${backoff}ms...`);
        await delay(backoff);
      }

      try {
        const response = await fetchWithTimeout(
          url,
          { ...options, headers },
          timeout
        );

        // Response sukses
        if (response.ok) {
          try {
            const data = await response.json();
            return data;
          } catch (_) {
            // Response OK tapi body kosong (misalnya 204 No Content)
            return { success: true };
          }
        }

        // Response dengan status error — parse & lempar
        const httpError = await parseResponseError(response);

        // Jika 401, langsung lempar (jangan retry)
        if (httpError.statusCode === 401) throw httpError;

        // Jika tidak bisa di-retry, langsung lempar
        if (!isRetryable(httpError)) throw httpError;

        lastError = httpError;

      } catch (err) {
        // Jika sudah merupakan error yang kita definisikan
        if (err instanceof HttpError && !isRetryable(err)) throw err;
        if (err instanceof ValidationError) throw err;

        lastError = err;

        // Jika bukan error yang bisa di-retry, langsung lempar
        if (!isRetryable(err)) throw err;
      }

      // Jika ini attempt terakhir, lempar error
      if (attempt === maxRetries) {
        console.error(
          `[API] Semua ${maxRetries + 1} percobaan gagal untuk ${options.method || 'GET'} ${endpoint}:`,
          lastError?.message
        );
        throw lastError;
      }
    }
  }

  // ─── Auth Endpoints ──────────────────────────────────────

  login(email, password) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }, { noRetry: true }); // Login tidak boleh di-retry otomatis
  }

  register(userData) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    }, { noRetry: true });
  }

  getMe() {
    return this.request('/auth/me');
  }

  // ─── Bookings Endpoints ──────────────────────────────────

  getBookings() {
    return this.request('/bookings');
  }

  getBookingById(id) {
    return this.request(`/bookings/${id}`);
  }

  createBooking(bookingData) {
    return this.request('/bookings', {
      method: 'POST',
      body: JSON.stringify(bookingData),
    }, { noRetry: true }); // POST idempoten — jangan retry otomatis
  }

  updateBooking(id, patchData) {
    return this.request(`/bookings/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(patchData),
    });
  }

  // ─── Monitorings Endpoints ───────────────────────────────

  getMonitoring(bookingId) {
    return this.request(`/monitorings/${bookingId}`);
  }

  saveMonitoring(data) {
    return this.request('/monitorings', {
      method: 'POST',
      body: JSON.stringify(data),
    }, { noRetry: true });
  }

  // ─── Layanan & Slots Endpoints ───────────────────────────

  getLayanan() {
    return this.request('/layanan');
  }

  getSlots() {
    return this.request('/slots');
  }
}

export const api = new ApiClient();

// ─── Utility: Friendly Error Message ────────────────────────

/**
 * Konversi error apapun menjadi pesan yang ramah untuk user
 * @param {Error} error
 * @returns {string}
 */
export function getFriendlyErrorMessage(error) {
  if (!error) return 'Terjadi kesalahan yang tidak diketahui';

  if (error instanceof NetworkError) {
    return '📡 Tidak ada koneksi internet. Periksa jaringan Anda.';
  }
  if (error instanceof TimeoutError) {
    return '⏱ Server tidak merespons. Coba lagi dalam beberapa saat.';
  }
  if (error instanceof ValidationError) {
    return error.message || '⚠️ Data yang dimasukkan tidak valid.';
  }
  if (error instanceof HttpError) {
    return error.message;
  }
  // Error generik
  return error.message || 'Terjadi kesalahan. Silakan coba lagi.';
}

/**
 * Cek apakah error adalah masalah jaringan/koneksi
 * @param {Error} error
 * @returns {boolean}
 */
export function isConnectionError(error) {
  return error instanceof NetworkError || error instanceof TimeoutError;
}

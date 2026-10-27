// ============================================================
// API SERVICE — CLIENT-SERVER REST API INTEGRATION
// Week 6: Error Handling & Reliable API (Enhanced)
// ============================================================
import rawApiData from '../data/penitipan_api.json';
import { mapLayananFromApi } from '../models/LayananModel';
import { mapSlotFromApi } from '../models/SlotModel';
import { api, NetworkError, TimeoutError, HttpError } from './api';

// ─── Konstanta ───────────────────────────────────────────────
const BACKEND_TIMEOUT_MS = 8000; // 8 detik untuk coba backend nyata

/**
 * fetchPenitipanData
 *
 * Strategi: Primary → Fallback
 * 1. Coba backend nyata (Node.js + MySQL) dengan timeout
 * 2. Jika gagal (offline/timeout), fallback ke data JSON lokal
 * 3. Jika JSON lokal juga gagal, kembalikan error dengan pesan jelas
 */
export const fetchPenitipanData = async () => {
  // ── 1. Coba Backend Nyata ────────────────────────────────
  try {
    const [layananRes, slotsRes] = await Promise.all([
      api.getLayanan(),
      api.getSlots(),
    ]);

    // Normalisasi format response: { success, data: [...] } atau array langsung
    const rawLayanan = Array.isArray(layananRes)
      ? layananRes
      : (layananRes?.data && Array.isArray(layananRes.data) ? layananRes.data : null);

    const rawSlots = Array.isArray(slotsRes)
      ? slotsRes
      : (slotsRes?.data && Array.isArray(slotsRes.data) ? slotsRes.data : null);

    if (!rawLayanan || !rawSlots) {
      throw new Error('Format response backend tidak dikenali');
    }

    const layananArray = rawLayanan.map((l) =>
      mapLayananFromApi({
        id_layanan: l.id || l.id_layanan,
        nama_paket: l.nama || l.nama_paket,
        tarif_per_hari: l.tarif || l.tarif_per_hari,
        deskripsi: l.deskripsi,
        fasilitas: l.fitur || l.fasilitas,
        tersedia: l.is_aktif !== undefined ? Boolean(l.is_aktif) : true,
      })
    );

    const slotsArray = rawSlots.map((s) =>
      mapSlotFromApi({
        kode_slot: s.nama_slot || s.kode_slot,
        zona: 'Area Penitipan',
        tipe_motor: 'Semua Jenis',
        status_terisi: s.status === 'terisi' || Boolean(s.status_terisi),
        kendaraan_terparkir: null,
      })
    );

    return {
      success: true,
      statusCode: 200,
      source: 'server',
      message: 'Data berhasil diambil dari Server Nyata',
      data: { layanan: layananArray, slots: slotsArray },
    };

  } catch (serverError) {
    // Tentukan pesan error untuk log
    const isOffline = serverError instanceof NetworkError || serverError instanceof TimeoutError;
    const isAuthError = serverError instanceof HttpError && serverError.statusCode === 401;

    if (isAuthError) {
      // Jangan fallback jika error autentikasi — ini bukan masalah koneksi
      return {
        success: false,
        statusCode: 401,
        source: 'server',
        message: 'Sesi tidak valid. Silakan login kembali.',
        data: { layanan: [], slots: [] },
      };
    }

    if (!isOffline) {
      // Log error server yang bukan masalah koneksi
      console.warn('[apiService] Server error, fallback ke lokal:', serverError.message);
    } else {
      console.log('[apiService] Offline/timeout, menggunakan data lokal.');
    }
  }

  // ── 2. Fallback: Data JSON Lokal ─────────────────────────
  try {
    // Simulasi sedikit delay agar UI tidak langsung lompat
    await new Promise((resolve) => setTimeout(resolve, 200));

    const jsonResult = rawApiData;

    if (!jsonResult?.data) {
      throw new Error('Struktur data lokal tidak valid');
    }

    const layananList = (jsonResult.data.layanan_penitipan || []).map(mapLayananFromApi);
    const slotList = (jsonResult.data.slot_parkir || []).map(mapSlotFromApi);

    return {
      success: true,
      statusCode: 200,
      source: 'local',
      message: 'Data diambil dari cache lokal (offline mode)',
      data: { layanan: layananList, slots: slotList },
    };

  } catch (localError) {
    // ── 3. Keduanya gagal ────────────────────────────────
    console.error('[apiService] Fallback lokal juga gagal:', localError);

    return {
      success: false,
      statusCode: 500,
      source: 'none',
      message: localError.message || 'Gagal memuat data. Periksa koneksi internet Anda.',
      data: { layanan: [], slots: [] },
    };
  }
};

/**
 * fetchBookingDetail
 * Ambil detail booking dengan error handling lengkap
 * @param {string|number} bookingId
 */
export const fetchBookingDetail = async (bookingId) => {
  try {
    const response = await api.getBookingById(bookingId);
    return {
      success: true,
      data: response?.data ?? response,
    };
  } catch (error) {
    const message = error instanceof HttpError && error.statusCode === 404
      ? 'Booking tidak ditemukan'
      : 'Gagal memuat detail booking';

    return { success: false, message, data: null };
  }
};

/**
 * fetchMonitoring
 * Ambil data monitoring dengan error handling
 * @param {string|number} bookingId
 */
export const fetchMonitoring = async (bookingId) => {
  try {
    const response = await api.getMonitoring(bookingId);
    return {
      success: true,
      data: response?.data ?? response,
    };
  } catch (error) {
    // 404 berarti belum ada data monitoring — bukan error serius
    if (error instanceof HttpError && error.statusCode === 404) {
      return { success: true, data: null };
    }
    return {
      success: false,
      message: 'Gagal memuat data monitoring',
      data: null,
    };
  }
};

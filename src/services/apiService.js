// ============================================================
// API SERVICE — CLIENT-SERVER REST API INTEGRATION
// ============================================================
import rawApiData from '../data/penitipan_api.json';
import { mapLayananFromApi } from '../models/LayananModel';
import { mapSlotFromApi } from '../models/SlotModel';
import { api } from './api';

/**
 * Service untuk mengambil data layanan dan slot penitipan dari REST API
 * Mencoba memanggil Backend Nyata terlebih dahulu, jika offline/gagal menggunakan data lokal.
 */
export const fetchPenitipanData = async () => {
  try {
    // 1. Coba request ke Backend Nyata (Node.js + MySQL)
    let layananArray = null;
    let slotsArray = null;

    try {
      const [layananRes, slotsRes] = await Promise.all([
        api.getLayanan(),
        api.getSlots(),
      ]);

      // Handle response backend format { success: true, data: [...] } atau array langsung [...]
      const rawLayanan = Array.isArray(layananRes)
        ? layananRes
        : (layananRes && Array.isArray(layananRes.data) ? layananRes.data : null);

      const rawSlots = Array.isArray(slotsRes)
        ? slotsRes
        : (slotsRes && Array.isArray(slotsRes.data) ? slotsRes.data : null);

      if (rawLayanan && rawSlots) {
        layananArray = rawLayanan.map((l) =>
          mapLayananFromApi({
            id_layanan: l.id || l.id_layanan,
            nama_paket: l.nama || l.nama_paket,
            tarif_per_hari: l.tarif || l.tarif_per_hari,
            deskripsi: l.deskripsi,
            fasilitas: l.fitur || l.fasilitas,
            tersedia: l.is_aktif !== undefined ? Boolean(l.is_aktif) : true,
          })
        );

        slotsArray = rawSlots.map((s) =>
          mapSlotFromApi({
            kode_slot: s.nama_slot || s.kode_slot,
            zona: 'Area Penitipan',
            tipe_motor: 'Semua Jenis',
            status_terisi: s.status === 'terisi' || Boolean(s.status_terisi),
            kendaraan_terparkir: null,
          })
        );
      }
    } catch (netErr) {
      // Backend offline atau belum login
    }

    // Jika data dari backend berhasil didapat
    if (layananArray && slotsArray) {
      return {
        success: true,
        statusCode: 200,
        message: 'Data berhasil diambil dari Server Nyata',
        data: {
          layanan: layananArray,
          slots: slotsArray,
        },
      };
    }

    // 2. Fallback: Gunakan JSON lokal
    await new Promise((resolve) => setTimeout(resolve, 300));
    const jsonResult = rawApiData;

    const layananList = (jsonResult.data.layanan_penitipan || []).map(mapLayananFromApi);
    const slotList = (jsonResult.data.slot_parkir || []).map(mapSlotFromApi);

    return {
      success: true,
      statusCode: 200,
      message: 'Data diambil dari cache lokal',
      data: {
        layanan: layananList,
        slots: slotList,
      },
    };
  } catch (error) {
    console.error('[API Service Error]:', error);
    return {
      success: false,
      statusCode: 500,
      message: error.message || 'Gagal terhubung ke REST API',
      data: {
        layanan: [],
        slots: [],
      },
    };
  }
};

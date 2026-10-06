// ============================================================
// API SERVICE — CLIENT-SERVER REST API INTEGRATION
// ============================================================
import rawApiData from '../data/penitipan_api.json';
import { mapLayananFromApi } from '../models/LayananModel';
import { mapSlotFromApi } from '../models/SlotModel';

/**
 * Service untuk mengambil data layanan dan slot penitipan dari REST API
 * Mengimplementasikan arsitektur Client-Server:
 * 1. Request -> Fetch / HTTP GET
 * 2. Response -> Cek HTTP Status Code (200 OK)
 * 3. JSON Parsing -> Memparsing response JSON
 * 4. Data Mapping -> Mengubah raw data menjadi DTO/Model
 */
export const fetchPenitipanData = async () => {
  try {
    // Simulasi Network Latency layaknya request ke Server REST API nyata (600ms)
    await new Promise((resolve) => setTimeout(resolve, 600));

    // Simulasi Response Object RESTful API
    const response = {
      ok: true,
      status: 200,
      statusText: 'OK',
      json: async () => rawApiData,
    };

    if (!response.ok) {
      throw new Error(`HTTP Error! Status: ${response.status} ${response.statusText}`);
    }

    // 1. JSON Parsing
    const jsonResult = await response.json();

    if (jsonResult.status !== 'success' || !jsonResult.data) {
      throw new Error(jsonResult.message || 'Format response API tidak valid');
    }

    // 2. Data Modeling & Mapping (DTO)
    const layananList = (jsonResult.data.layanan_penitipan || []).map(mapLayananFromApi);
    const slotList = (jsonResult.data.slot_parkir || []).map(mapSlotFromApi);

    return {
      success: true,
      statusCode: jsonResult.statusCode,
      message: jsonResult.message,
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

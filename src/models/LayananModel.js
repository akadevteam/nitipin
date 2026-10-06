// ============================================================
// DATA MODELING & DTO — LAYANAN PENITIPAN
// ============================================================

/**
 * Data Transfer Object (DTO) untuk Layanan Penitipan
 * Bertujuan memisahkan struktur mentah dari API dengan struktur yang dikonsumsi oleh UI
 */
export class LayananDTO {
  constructor({ id, namaPaket, tarifPerHari, deskripsi, fasilitas, isTersedia }) {
    this.id = id;
    this.namaPaket = namaPaket;
    this.tarifPerHari = tarifPerHari;
    this.deskripsi = deskripsi;
    this.fasilitas = fasilitas || [];
    this.isTersedia = isTersedia;
  }

  // Helper method untuk memformat mata uang langsung di model
  get formattedTarif() {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(this.tarifPerHari) + '/hari';
  }
}

/**
 * Data Mapper: Mengubah raw JSON API (snake_case) menjadi LayananDTO (camelCase)
 * @param {Object} rawData - Data mentah dari response JSON
 * @returns {LayananDTO}
 */
export const mapLayananFromApi = (rawData) => {
  if (!rawData) return null;

  return new LayananDTO({
    id: rawData.id_layanan || 'SRV-00',
    namaPaket: rawData.nama_paket || 'Paket Tanpa Nama',
    tarifPerHari: Number(rawData.tarif_per_hari) || 0,
    deskripsi: rawData.deskripsi || '-',
    fasilitas: Array.isArray(rawData.fasilitas) ? rawData.fasilitas : [],
    isTersedia: Boolean(rawData.tersedia),
  });
};

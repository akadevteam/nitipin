// ============================================================
// DATA MODELING & DTO — SLOT PARKIR MOTOR
// ============================================================

/**
 * DTO untuk detail kendaraan yang sedang menempati slot
 */
export class KendaraanTerparkirDTO {
  constructor({ nomorPolisi, pemilik, merekMotor, waktuCheckin }) {
    this.nomorPolisi = nomorPolisi || '-';
    this.pemilik = pemilik || 'Anonim';
    this.merekMotor = merekMotor || '-';
    this.waktuCheckin = waktuCheckin ? new Date(waktuCheckin) : null;
  }

  get formattedCheckinTime() {
    if (!this.waktuCheckin) return '-';
    return this.waktuCheckin.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }
}

/**
 * Data Transfer Object (DTO) untuk Slot Parkir
 */
export class SlotDTO {
  constructor({ kodeSlot, zona, tipeMotor, isTerisi, kendaraanTerparkir }) {
    this.kodeSlot = kodeSlot;
    this.zona = zona;
    this.tipeMotor = tipeMotor;
    this.isTerisi = isTerisi;
    this.kendaraanTerparkir = kendaraanTerparkir; // Instance of KendaraanTerparkirDTO or null
  }

  get statusLabel() {
    return this.isTerisi ? 'Terisi' : 'Tersedia';
  }

  get isAvailable() {
    return !this.isTerisi;
  }
}

/**
 * Data Mapper: Mengubah raw JSON API (snake_case) menjadi SlotDTO (camelCase)
 * @param {Object} rawData - Data mentah dari response JSON
 * @returns {SlotDTO}
 */
export const mapSlotFromApi = (rawData) => {
  if (!rawData) return null;

  const kendaraan = rawData.kendaraan_terparkir
    ? new KendaraanTerparkirDTO({
        nomorPolisi: rawData.kendaraan_terparkir.nomor_polisi,
        pemilik: rawData.kendaraan_terparkir.pemilik,
        merekMotor: rawData.kendaraan_terparkir.merek_motor,
        waktuCheckin: rawData.kendaraan_terparkir.waktu_checkin,
      })
    : null;

  return new SlotDTO({
    kodeSlot: rawData.kode_slot || 'SLOT-?',
    zona: rawData.zona || 'Umum',
    tipeMotor: rawData.tipe_motor || 'Semua Jenis',
    isTerisi: Boolean(rawData.status_terisi),
    kendaraanTerparkir: kendaraan,
  });
};

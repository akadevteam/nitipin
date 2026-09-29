const BULAN = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
export const PRICE_PER_DAY = 15000;

export const formatDate = (iso) => {
  if (!iso) return '-';
  const [y, m, d] = iso.split('-').map(Number);
  if (!y || !m || !d) return iso;
  return `${d} ${BULAN[m - 1]} ${y}`;
};
export const todayISO = () => '2026-09-29';
export const isValidDate = (s) => /^\d{4}-\d{2}-\d{2}$/.test(s) && !isNaN(new Date(s).getTime());
export const calcDays = (a, b) => Math.max(1, Math.round((new Date(b) - new Date(a)) / 86400000));
export const calcTotal = (a, b) => calcDays(a, b) * PRICE_PER_DAY;
export const rupiah = (n) => 'Rp ' + n.toLocaleString('id-ID');

export const ACTIVE_STATUS = ['Menunggu Konfirmasi', 'Booking Dikonfirmasi', 'Pembayaran Berhasil', 'Sedang Dititipkan'];
export const canCancel = (b) => b.status === 'Menunggu Konfirmasi' || (b.status === 'Booking Dikonfirmasi' && !b.paid);

const fuelSpeech = { '¼': 'satu per empat', '½': 'setengah', '¾': 'tiga per empat' };
export const reportSpeech = (b) => {
  const r = b.report;
  if (!r) return `Motor ${b.plate} belum memiliki laporan kondisi.`;
  return `Motor ${b.plate} berada di ${b.location}. Kondisinya ${r.overall.toLowerCase()}. Bensin ${fuelSpeech[r.fuel] || r.fuel.toLowerCase()}. Body ${r.body.toLowerCase()}. Ban ${r.tire.toLowerCase()}.`;
};
export const paymentSpeech = (b) => `Pembayaran berhasil. Motor ${b.plate} telah terdaftar untuk penitipan.`;

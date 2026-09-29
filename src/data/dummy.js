export const users = [
  { id: 'c1', role: 'customer', name: 'Budi', login: 'budi', password: '1234', phone: '0812-3456-7890' },
  { id: 'm1', role: 'pengelola', name: 'Pak Hendra', login: 'pengelola', password: '1234', phone: '0813-1111-2222' },
];

export const initialBookings = [
  { id: 'b1', customerId: 'c1', owner: 'Budi', plate: 'B 5069 BLP', brand: 'Honda Vario 160', color: 'Hitam',
    entry: '2026-09-29', exit: '2026-10-02', photo: null, status: 'Sedang Dititipkan', location: 'Area Penyimpanan A-12',
    paid: true, payMethod: 'QRIS', total: 45000,
    report: { date: '2026-09-29', photo: null, overall: 'Baik', fuel: '¾', body: 'Tidak ada kerusakan', tire: 'Baik', note: 'Motor dalam kondisi baik selama proses penitipan.' } },
  { id: 'b2', customerId: 'c2', owner: 'Sari Wulandari', plate: 'D 4412 KZA', brand: 'Yamaha NMAX', color: 'Putih',
    entry: '2026-09-30', exit: '2026-10-04', photo: null, status: 'Menunggu Konfirmasi', location: '', paid: false, payMethod: null, total: 60000, report: null },
  { id: 'b3', customerId: 'c3', owner: 'Andi Pratama', plate: 'L 2210 XR', brand: 'Honda Beat', color: 'Merah',
    entry: '2026-09-28', exit: '2026-10-01', photo: null, status: 'Pembayaran Berhasil', location: 'Area Penyimpanan A-03', paid: true, payMethod: 'Tunai', total: 45000, report: null },
  { id: 'b4', customerId: 'c4', owner: 'Rina Anggraini', plate: 'AG 8890 FT', brand: 'Suzuki Satria F150', color: 'Biru',
    entry: '2026-10-01', exit: '2026-10-03', photo: null, status: 'Booking Dikonfirmasi', location: 'Area Penyimpanan A-07', paid: false, payMethod: null, total: 30000, report: null },
  { id: 'b5', customerId: 'c1', owner: 'Budi', plate: 'B 5069 BLP', brand: 'Honda Vario 160', color: 'Hitam',
    entry: '2026-09-10', exit: '2026-09-12', photo: null, status: 'Selesai', location: 'Area Penyimpanan B-04', paid: true, payMethod: 'Transfer Bank', total: 30000,
    report: { date: '2026-09-11', photo: null, overall: 'Baik', fuel: '½', body: 'Tidak ada kerusakan', tire: 'Baik', note: 'Tidak ada catatan tambahan.' } },
];

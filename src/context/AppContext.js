import React, { createContext, useContext, useState } from 'react';
import { users, initialBookings } from '../data/dummy';
import { calcTotal } from '../utils/helpers';

const Ctx = createContext(null);
export const useApp = () => useContext(Ctx);

export function AppProvider({ children }) {
  const [user, setUser] = useState(null);
  const [bookings, setBookings] = useState(initialBookings);

  const update = (id, patch) => setBookings((list) => list.map((b) => (b.id === id ? { ...b, ...patch } : b)));

  const login = (id, password) => {
    const u = users.find((x) => (x.login === id.trim().toLowerCase() || x.phone === id.trim()) && x.password === password);
    if (u) setUser(u);
    return u;
  };
  const logout = () => setUser(null);

  const addBooking = (data) => {
    const b = { id: 'b' + Date.now(), customerId: user.id, status: 'Menunggu Konfirmasi', location: '',
      paid: false, payMethod: null, report: null, total: calcTotal(data.entry, data.exit), ...data };
    setBookings((l) => [b, ...l]);
    return b.id;
  };
  const cancelBooking = (id) => update(id, { status: 'Dibatalkan' });
  const confirmBooking = (id, location) => update(id, { status: 'Booking Dikonfirmasi', location });
  const rejectBooking = (id) => update(id, { status: 'Ditolak' });
  const pay = (id, method) => update(id, { paid: true, payMethod: method, status: 'Pembayaran Berhasil' });
  const finishBooking = (id) => update(id, { status: 'Selesai' });
  const saveReport = (id, report, location) => update(id, { report, location, status: 'Sedang Dititipkan' });

  return (
    <Ctx.Provider value={{ user, bookings, login, logout, addBooking, cancelBooking, confirmBooking, rejectBooking, pay, finishBooking, saveReport }}>
      {children}
    </Ctx.Provider>
  );
}

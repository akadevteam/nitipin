// ============================================================
// APP CONTEXT — Global State Management
// ============================================================
import React, { createContext, useContext, useState } from 'react';
import {
  dummyUsers,
  initialBookings,
  initialMonitoring,
  HARGA_PER_HARI,
} from '../data/dummyData';

const AppContext = createContext(null);

export const AppProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [registeredUsers, setRegisteredUsers] = useState(dummyUsers);
  const [bookings, setBookings] = useState(initialBookings);
  const [monitoringData, setMonitoringData] = useState(initialMonitoring);

  // ── AUTH ────────────────────────────────────────────────────
  const login = (email, password) => {
    const trimmedEmail = email.trim().toLowerCase();
    const user = registeredUsers.find(
      (u) => u.email.toLowerCase() === trimmedEmail && u.password === password
    );
    if (user) {
      setCurrentUser(user);
      return { success: true, user };
    }
    return { success: false, message: 'Email atau password salah.' };
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const register = (userData) => {
    const exists = registeredUsers.find(
      (u) => u.email.toLowerCase() === userData.email.toLowerCase()
    );
    if (exists) {
      return { success: false, message: 'Email sudah terdaftar.' };
    }
    const newUser = {
      id: `u${Date.now()}`,
      name: userData.name,
      email: userData.email,
      password: userData.password,
      phone: userData.phone || '',
      role: 'customer',
    };
    setRegisteredUsers((prev) => [...prev, newUser]);
    setCurrentUser(newUser);
    return { success: true, user: newUser };
  };

  // ── BOOKINGS ────────────────────────────────────────────────
  const addBooking = (bookingData) => {
    const days = calculateDuration(bookingData.tanggalMasuk, bookingData.tanggalKeluar);
    const totalBiaya = days * HARGA_PER_HARI;
    const newBooking = {
      id: `b${Date.now()}`,
      customerId: currentUser.id,
      customerName: currentUser.name,
      customerPhone: currentUser.phone || '-',
      status: 'menunggu_konfirmasi',
      lokasi: null,
      totalBiaya,
      metodePembayaran: null,
      createdAt: new Date().toISOString().split('T')[0],
      fotoIndex: Math.floor(Math.random() * 3),
      catatan: '',
      ...bookingData,
    };
    setBookings((prev) => [newBooking, ...prev]);
    return newBooking;
  };

  const updateBooking = (bookingId, updates) => {
    setBookings((prev) =>
      prev.map((b) => (b.id === bookingId ? { ...b, ...updates } : b))
    );
  };

  const getBookingById = (bookingId) =>
    bookings.find((b) => b.id === bookingId);

  const getBookingsByCustomer = (customerId) =>
    bookings.filter((b) => b.customerId === customerId);

  const getActiveBookingByCustomer = (customerId) =>
    bookings.find(
      (b) =>
        b.customerId === customerId &&
        ['sedang_dititipkan', 'pembayaran_berhasil', 'dikonfirmasi', 'menunggu_konfirmasi', 'menunggu_pembayaran'].includes(b.status)
    );

  // ── MONITORING ──────────────────────────────────────────────
  const addOrUpdateMonitoring = (entry) => {
    const exists = monitoringData.find((m) => m.bookingId === entry.bookingId);
    if (exists) {
      setMonitoringData((prev) =>
        prev.map((m) =>
          m.bookingId === entry.bookingId ? { ...m, ...entry } : m
        )
      );
    } else {
      setMonitoringData((prev) => [
        ...prev,
        { id: `m${Date.now()}`, ...entry },
      ]);
    }
  };

  const getMonitoringByBookingId = (bookingId) =>
    monitoringData.find((m) => m.bookingId === bookingId);

  // ── HELPERS ─────────────────────────────────────────────────
  const calculateDuration = (start, end) => {
    const s = new Date(start);
    const e = new Date(end);
    const diff = Math.ceil((e - s) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 1;
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        bookings,
        monitoringData,
        login,
        logout,
        register,
        addBooking,
        updateBooking,
        getBookingById,
        getBookingsByCustomer,
        getActiveBookingByCustomer,
        addOrUpdateMonitoring,
        getMonitoringByBookingId,
        calculateDuration,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};

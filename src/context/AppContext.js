// ============================================================
// APP CONTEXT — Hybrid (Real API Backend + Local Fallback)
// ============================================================
import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  dummyUsers,
  initialBookings,
  initialMonitoring,
  HARGA_PER_HARI,
} from '../data/dummyData';
import { api } from '../services/api';

const AppContext = createContext(null);

export const AppProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [registeredUsers, setRegisteredUsers] = useState(dummyUsers);
  const [bookings, setBookings] = useState(initialBookings);
  const [monitoringData, setMonitoringData] = useState(initialMonitoring);
  const [isBackendConnected, setIsBackendConnected] = useState(false);

  // Sync data dari backend saat user login
  const refreshBackendData = async () => {
    try {
      const serverBookings = await api.getBookings();
      if (Array.isArray(serverBookings)) {
        setBookings(serverBookings);
        setIsBackendConnected(true);

        // Ambil data monitoring untuk setiap booking dari backend
        for (const b of serverBookings) {
          try {
            const m = await api.getMonitoring(b.id);
            if (m && m.id) {
              setMonitoringData((prev) => {
                const exists = prev.find((item) => item.bookingId === b.id);
                if (exists) {
                  return prev.map((item) => (item.bookingId === b.id ? { ...item, ...m } : item));
                }
                return [...prev, m];
              });
            }
          } catch (err) {
            // Belum ada data monitoring untuk booking ini
          }
        }
      }
    } catch (e) {
      // Backend mungkin belum running atau offline
      setIsBackendConnected(false);
    }
  };

  useEffect(() => {
    if (currentUser) {
      refreshBackendData();
    }
  }, [currentUser]);

  // ── AUTH ────────────────────────────────────────────────────
  const login = async (email, password) => {
    const trimmedEmail = email.trim().toLowerCase();

    // 1. Coba login ke Backend Nyata (REST API)
    try {
      const res = await api.login(trimmedEmail, password);
      if (res && res.token && res.user) {
        api.setToken(res.token);
        setCurrentUser(res.user);
        setIsBackendConnected(true);
        refreshBackendData();
        return { success: true, user: res.user };
      }
    } catch (err) {
      console.log('Login backend gagal/offline, fallback ke memori:', err.message);
    }

    // 2. Fallback jika backend offline / dummy dev
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
    api.setToken(null);
    setCurrentUser(null);
  };

  const register = async (userData) => {
    // 1. Coba daftar ke Backend Nyata
    try {
      const res = await api.register(userData);
      if (res && res.token && res.user) {
        api.setToken(res.token);
        setCurrentUser(res.user);
        setIsBackendConnected(true);
        return { success: true, user: res.user };
      }
    } catch (err) {
      console.log('Register backend gagal/offline, fallback ke lokal:', err.message);
    }

    // 2. Fallback lokal
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
  const addBooking = async (bookingData) => {
    const days = calculateDuration(bookingData.tanggalMasuk, bookingData.tanggalKeluar);
    const totalBiaya = days * HARGA_PER_HARI;

    // 1. Coba simpan ke Backend Nyata
    try {
      const serverBooking = await api.createBooking({
        nomorPolisi: bookingData.nomorPolisi,
        merek: bookingData.merek,
        warna: bookingData.warna,
        tanggalMasuk: bookingData.tanggalMasuk,
        tanggalKeluar: bookingData.tanggalKeluar,
        catatan: bookingData.catatan,
        fotoUri: bookingData.fotoUri,
      });

      if (serverBooking && serverBooking.id) {
        setBookings((prev) => [serverBooking, ...prev]);
        return serverBooking;
      }
    } catch (e) {
      console.log('Gagal menyimpan booking ke backend, fallback ke lokal:', e.message);
    }

    // 2. Fallback lokal
    const newBooking = {
      id: `b${Date.now()}`,
      customerId: currentUser?.id || 'demo',
      customerName: currentUser?.name || 'Customer',
      customerPhone: currentUser?.phone || '-',
      status: 'menunggu_konfirmasi',
      lokasi: null,
      totalBiaya,
      metodePembayaran: null,
      createdAt: new Date().toISOString().split('T')[0],
      fotoIndex: 0,
      catatan: '',
      ...bookingData,
    };
    setBookings((prev) => [newBooking, ...prev]);
    return newBooking;
  };

  const updateBooking = async (bookingId, updates) => {
    // 1. Update state UI optimistik
    setBookings((prev) =>
      prev.map((b) => (b.id === bookingId ? { ...b, ...updates } : b))
    );

    // 2. Coba update ke backend
    try {
      await api.updateBooking(bookingId, updates);
    } catch (e) {
      console.log('Update backend gagal, data tetap di lokal:', e.message);
    }
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
  const addOrUpdateMonitoring = async (entry) => {
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

    // Coba simpan ke server backend
    try {
      await api.saveMonitoring(entry);
    } catch (e) {
      console.log('Simpan monitoring ke backend gagal/offline:', e.message);
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
        isBackendConnected,
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
        refreshBackendData,
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

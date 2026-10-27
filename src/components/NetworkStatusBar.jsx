// ============================================================
// NetworkStatusBar — Indikator Koneksi Offline/Online
// Week 6: Error Handling & Reliable API
// ============================================================
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Animated, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

/**
 * Deteksi status internet dengan mencoba fetch ke endpoint publik.
 * React Native tidak punya NetInfo built-in tanpa library tambahan,
 * jadi kita simulasikan dengan mencoba koneksi ke server kita sendiri.
 *
 * Di proyek nyata, install: npx expo install @react-native-community/netinfo
 */

/**
 * NetworkStatusBar — menampilkan banner merah saat offline
 * dan banner hijau singkat saat kembali online.
 *
 * Letakkan di root layout aplikasi agar selalu terlihat.
 *
 * Penggunaan:
 * <NetworkStatusBar apiBaseUrl="http://192.168.0.10:5000/api" />
 */
export default function NetworkStatusBar({ apiBaseUrl }) {
  const [isOnline, setIsOnline] = useState(true);
  const [showOnlineBanner, setShowOnlineBanner] = useState(false);
  const slideAnim = useRef(new Animated.Value(-60)).current;
  const onlineBannerTimer = useRef(null);
  const pollInterval = useRef(null);
  const prevOnline = useRef(true);

  // ── Cek koneksi ke server ──────────────────────────────────
  const checkConnectivity = async () => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      // Coba hit endpoint ringan (bisa ganti ke endpoint health check)
      await fetch(`${apiBaseUrl}/layanan`, {
        method: 'HEAD',
        signal: controller.signal,
        cache: 'no-cache',
      });
      clearTimeout(timeoutId);
      return true;
    } catch (_) {
      return false;
    }
  };

  // ── Poll koneksi setiap 10 detik ─────────────────────────
  useEffect(() => {
    const poll = async () => {
      const online = await checkConnectivity();

      if (online !== prevOnline.current) {
        prevOnline.current = online;
        setIsOnline(online);

        if (online) {
          // Baru kembali online — tampilkan banner hijau singkat
          setShowOnlineBanner(true);
          if (onlineBannerTimer.current) clearTimeout(onlineBannerTimer.current);
          onlineBannerTimer.current = setTimeout(() => {
            setShowOnlineBanner(false);
          }, 3000);
        }
      }
    };

    poll(); // Langsung cek pertama kali
    pollInterval.current = setInterval(poll, 10000); // Poll tiap 10 detik

    return () => {
      clearInterval(pollInterval.current);
      if (onlineBannerTimer.current) clearTimeout(onlineBannerTimer.current);
    };
  }, [apiBaseUrl]);

  // ── Animasi slide in/out ─────────────────────────────────
  useEffect(() => {
    const shouldShow = !isOnline || showOnlineBanner;
    Animated.timing(slideAnim, {
      toValue: shouldShow ? 0 : -60,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [isOnline, showOnlineBanner, slideAnim]);

  return (
    <Animated.View
      style={[
        styles.banner,
        isOnline ? styles.onlineBanner : styles.offlineBanner,
        { transform: [{ translateY: slideAnim }] },
      ]}
    >
      <Ionicons
        name={isOnline ? 'wifi-outline' : 'cloud-offline-outline'}
        size={16}
        color="#fff"
      />
      <Text style={styles.bannerText}>
        {isOnline
          ? '✅ Koneksi pulih — terhubung ke server'
          : '📡 Tidak ada koneksi internet — mode offline'}
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  banner: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    zIndex: 9999,
  },
  offlineBanner: {
    backgroundColor: '#DC2626', // merah
  },
  onlineBanner: {
    backgroundColor: '#059669', // hijau
  },
  bannerText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
});

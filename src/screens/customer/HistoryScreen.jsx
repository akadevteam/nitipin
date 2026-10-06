import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../../context/AppContext';
import BookingCard from '../../components/BookingCard';
import { colors } from '../../theme/colors';

const FILTERS = [
  { key: 'semua', label: 'Semua' },
  { key: 'aktif', label: 'Aktif' },
  { key: 'selesai', label: 'Selesai' },
  { key: 'dibatalkan', label: 'Dibatalkan' },
];

const AKTIF_STATUSES = ['menunggu_konfirmasi', 'dikonfirmasi', 'menunggu_pembayaran', 'pembayaran_berhasil', 'sedang_dititipkan'];

export default function HistoryScreen({ navigation }) {
  const { currentUser, getBookingsByCustomer } = useApp();
  const [filter, setFilter] = useState('semua');
  const allBookings = getBookingsByCustomer(currentUser.id);

  const filtered = allBookings.filter((b) => {
    if (filter === 'semua') return true;
    if (filter === 'aktif') return AKTIF_STATUSES.includes(b.status);
    if (filter === 'selesai') return b.status === 'selesai';
    if (filter === 'dibatalkan') return ['dibatalkan', 'ditolak'].includes(b.status);
    return true;
  });

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.title}>Riwayat Penitipan</Text>
        <Text style={styles.count}>{allBookings.length} booking</Text>
      </View>

      {/* Filter Tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterBar} contentContainerStyle={styles.filterContent}>
        {FILTERS.map((f) => (
          <TouchableOpacity
            key={f.key}
            style={[styles.filterTab, filter === f.key && styles.filterTabActive]}
            onPress={() => setFilter(f.key)}
          >
            <Text style={[styles.filterLabel, filter === f.key && styles.filterLabelActive]}>
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
        {filtered.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="time-outline" size={44} color={colors.neutral300} />
            <Text style={styles.emptyText}>Tidak ada riwayat</Text>
          </View>
        ) : (
          filtered.map((b) => (
            <BookingCard
              key={b.id}
              booking={b}
              onPress={() => navigation.navigate('BookingDetail', { bookingId: b.id })}
            />
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral100,
  },
  title: { fontSize: 18, fontWeight: '800', color: colors.neutral900 },
  count: { fontSize: 13, color: colors.neutral500 },
  filterBar: { backgroundColor: colors.white, maxHeight: 52 },
  filterContent: { paddingHorizontal: 12, paddingVertical: 10, gap: 8 },
  filterTab: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: colors.neutral100,
  },
  filterTabActive: { backgroundColor: colors.primary },
  filterLabel: { fontSize: 13, fontWeight: '600', color: colors.neutral500 },
  filterLabelActive: { color: colors.white },
  list: { padding: 16, paddingBottom: 60 },
  empty: { alignItems: 'center', justifyContent: 'center', paddingTop: 60 },
  emptyText: { fontSize: 14, color: colors.neutral500, marginTop: 12 },
});

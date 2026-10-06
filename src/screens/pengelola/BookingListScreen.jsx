import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../../context/AppContext';
import BookingCard from '../../components/BookingCard';
import { colors } from '../../theme/colors';

const FILTERS = [
  { key: 'semua', label: 'Semua' },
  { key: 'menunggu_konfirmasi', label: 'Menunggu' },
  { key: 'dikonfirmasi', label: 'Dikonfirmasi' },
  { key: 'sedang_dititipkan', label: 'Dititipkan' },
  { key: 'selesai', label: 'Selesai' },
];

export default function BookingListScreen({ navigation }) {
  const { bookings } = useApp();
  const [filter, setFilter] = useState('semua');
  const [search, setSearch] = useState('');

  const filtered = bookings.filter((b) => {
    // Status filter
    if (filter !== 'semua' && b.status !== filter) return false;
    // Search query filter (nopol, nama, merek)
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchNopol = b.nomorPolisi?.toLowerCase().includes(q);
      const matchName = b.customerName?.toLowerCase().includes(q);
      const matchMerek = b.merek?.toLowerCase().includes(q);
      return matchNopol || matchName || matchMerek;
    }
    return true;
  });

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Daftar Booking Masuk</Text>
        <Text style={styles.subtitle}>Kelola pengajuan penitipan dari customer</Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={18} color={colors.neutral500} />
          <TextInput
            style={styles.searchInput}
            placeholder="Cari nopol, merek, nama pemilik..."
            placeholderTextColor={colors.neutral300}
            value={search}
            onChangeText={setSearch}
          />
          {search ? (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Ionicons name="close-circle" size={18} color={colors.neutral500} />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      {/* Filter Tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterBar}
        contentContainerStyle={styles.filterContent}
      >
        {FILTERS.map((f) => (
          <TouchableOpacity
            key={f.key}
            style={[styles.filterTab, filter === f.key && styles.filterTabActive]}
            onPress={() => setFilter(f.key)}
          >
            <Text
              style={[
                styles.filterLabel,
                filter === f.key && styles.filterLabelActive,
              ]}
            >
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Bookings List */}
      <ScrollView
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      >
        {filtered.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="clipboard-outline" size={48} color={colors.neutral300} />
            <Text style={styles.emptyTitle}>Tidak ada booking ditemukan</Text>
            <Text style={styles.emptyDesc}>Coba ganti filter atau kata kunci pencarian.</Text>
          </View>
        ) : (
          filtered.map((b) => (
            <BookingCard
              key={b.id}
              booking={b}
              showCustomer
              onPress={() =>
                navigation.navigate('BookingDetail', { bookingId: b.id })
              }
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
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: colors.white,
  },
  title: { fontSize: 18, fontWeight: '800', color: colors.neutral900 },
  subtitle: { fontSize: 12, color: colors.neutral500, marginTop: 2 },
  searchContainer: {
    paddingHorizontal: 16,
    paddingBottom: 8,
    backgroundColor: colors.white,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.neutral100,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
  },
  searchInput: { flex: 1, fontSize: 14, color: colors.neutral900, padding: 0 },
  filterBar: {
    backgroundColor: colors.white,
    maxHeight: 48,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral100,
  },
  filterContent: { paddingHorizontal: 12, paddingBottom: 10, gap: 8 },
  filterTab: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: colors.neutral100,
  },
  filterTabActive: { backgroundColor: colors.primary },
  filterLabel: { fontSize: 12, fontWeight: '600', color: colors.neutral500 },
  filterLabelActive: { color: colors.white },
  list: { padding: 16, paddingBottom: 60 },
  empty: { alignItems: 'center', justifyContent: 'center', paddingTop: 60 },
  emptyTitle: { fontSize: 15, fontWeight: '700', color: colors.neutral700, marginTop: 12 },
  emptyDesc: { fontSize: 12, color: colors.neutral500, marginTop: 4 },
});

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../../context/AppContext';
import StatusBadge from '../../components/StatusBadge';
import { colors, shadows } from '../../theme/colors';
import { MOTOR_PLACEHOLDER_IMAGES } from '../../data/dummyData';
import { formatDateShort } from '../../utils/helpers';

const FILTERS = [
  { key: 'semua', label: 'Semua Motor' },
  { key: 'sedang_dititipkan', label: 'Sedang Dititip' },
  { key: 'selesai', label: 'Riwayat Selesai' },
];

export default function MotorListScreen({ navigation }) {
  const { bookings } = useApp();
  const [filter, setFilter] = useState('semua');
  const [search, setSearch] = useState('');

  const filtered = bookings.filter((b) => {
    if (filter === 'sedang_dititipkan' && b.status !== 'sedang_dititipkan') return false;
    if (filter === 'selesai' && b.status !== 'selesai') return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        b.nomorPolisi?.toLowerCase().includes(q) ||
        b.customerName?.toLowerCase().includes(q) ||
        b.merek?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Data Seluruh Motor</Text>
        <Text style={styles.subtitle}>
          Daftar kendaraan dengan penanda motor yang sedang aktif dititipkan
        </Text>
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
      <View style={styles.filterBar}>
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
      </View>

      {/* Motor Cards List */}
      <ScrollView
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      >
        {filtered.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="bicycle-outline" size={48} color={colors.neutral300} />
            <Text style={styles.emptyTitle}>Tidak ada data motor</Text>
            <Text style={styles.emptyDesc}>Silakan ubah filter atau kata kunci pencarian.</Text>
          </View>
        ) : (
          filtered.map((b) => {
            const fotoUri = MOTOR_PLACEHOLDER_IMAGES[b.fotoIndex ?? 0];
            const isDititipkan = b.status === 'sedang_dititipkan';

            return (
              <View
                key={b.id}
                style={[
                  styles.card,
                  isDititipkan && styles.cardActive,
                  shadows.sm,
                ]}
              >
                <Image source={{ uri: fotoUri }} style={styles.foto} resizeMode="cover" />

                <View style={styles.cardContent}>
                  <View style={styles.rowTop}>
                    <View style={styles.flex}>
                      <Text style={styles.nopol}>{b.nomorPolisi}</Text>
                      <Text style={styles.merek}>{b.merek} · {b.warna}</Text>
                    </View>
                    <StatusBadge status={b.status} />
                  </View>

                  <View style={styles.divider} />

                  <View style={styles.metaRow}>
                    <View style={styles.metaItem}>
                      <Ionicons name="person-outline" size={13} color={colors.neutral500} />
                      <Text style={styles.metaText}>{b.customerName}</Text>
                    </View>
                    {b.lokasi ? (
                      <View style={styles.metaItem}>
                        <Ionicons name="location-outline" size={13} color={colors.primary} />
                        <Text style={[styles.metaText, { color: colors.primary, fontWeight: '600' }]}>
                          {b.lokasi.replace('Area Penyimpanan ', '')}
                        </Text>
                      </View>
                    ) : null}
                    <View style={styles.metaItem}>
                      <Ionicons name="calendar-outline" size={13} color={colors.neutral500} />
                      <Text style={styles.metaText}>
                        {formatDateShort(b.tanggalMasuk)} - {formatDateShort(b.tanggalKeluar)}
                      </Text>
                    </View>
                  </View>

                  {/* Tombol aksi cepat untuk motor sedang dititipkan */}
                  {isDititipkan && (
                    <TouchableOpacity
                      style={styles.monitoringActionBtn}
                      onPress={() =>
                        navigation.navigate('MonitoringForm', { bookingId: b.id })
                      }
                      activeOpacity={0.8}
                    >
                      <Ionicons name="clipboard-outline" size={16} color={colors.white} />
                      <Text style={styles.monitoringActionBtnText}>
                        Buka / Perbarui Laporan Kondisi
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            );
          })
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
    flexDirection: 'row',
    backgroundColor: colors.white,
    paddingHorizontal: 16,
    paddingBottom: 10,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral100,
  },
  filterTab: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: colors.neutral100,
  },
  filterTabActive: { backgroundColor: colors.primary },
  filterLabel: { fontSize: 12, fontWeight: '600', color: colors.neutral500 },
  filterLabelActive: { color: colors.white },
  list: { padding: 16, paddingBottom: 60 },
  card: {
    backgroundColor: colors.white,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 14,
  },
  cardActive: {
    borderWidth: 1.5,
    borderColor: colors.secondary,
  },
  foto: { width: '100%', height: 140, backgroundColor: colors.neutral100 },
  cardContent: { padding: 14 },
  rowTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  flex: { flex: 1, marginRight: 8 },
  nopol: { fontSize: 16, fontWeight: '700', color: colors.neutral900 },
  merek: { fontSize: 12, color: colors.neutral500, marginTop: 1 },
  divider: { height: 1, backgroundColor: colors.neutral100, marginVertical: 10 },
  metaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontSize: 12, color: colors.neutral500 },
  monitoringActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: colors.primary,
    borderRadius: 10,
    paddingVertical: 10,
    marginTop: 12,
  },
  monitoringActionBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.white,
  },
  empty: { alignItems: 'center', justifyContent: 'center', paddingTop: 60 },
  emptyTitle: { fontSize: 15, fontWeight: '700', color: colors.neutral700, marginTop: 12 },
  emptyDesc: { fontSize: 12, color: colors.neutral500, marginTop: 4 },
});

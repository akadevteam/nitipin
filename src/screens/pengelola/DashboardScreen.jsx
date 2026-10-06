import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../../context/AppContext';
import { colors, shadows } from '../../theme/colors';
import StatusBadge from '../../components/StatusBadge';
import ApiDataDisplay from '../../components/ApiDataDisplay';
import { formatDate } from '../../utils/helpers';

export default function DashboardScreen({ navigation }) {
  const { currentUser, bookings } = useApp();
  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 800);
  };

  // Statistik Pengelola
  const menungguKonfirmasi = bookings.filter((b) => b.status === 'menunggu_konfirmasi');
  const sedangDititipkan = bookings.filter((b) => b.status === 'sedang_dititipkan');
  const pembayaranBerhasil = bookings.filter((b) => b.status === 'pembayaran_berhasil');
  const dikonfirmasi = bookings.filter((b) => b.status === 'dikonfirmasi');
  const selesai = bookings.filter((b) => b.status === 'selesai');

  return (
    <SafeAreaView style={styles.safe}>
      {/* Top Header */}
      <View style={styles.topBar}>
        <View>
          <Text style={styles.greeting}>Panel Pengelola Penitipan,</Text>
          <Text style={styles.userName}>{currentUser?.name || 'Pak Roni'} 🛠️</Text>
        </View>
        <View style={styles.badgePengelola}>
          <Text style={styles.badgePengelolaText}>ADMIN</Text>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />
        }
      >
        {/* Ringkasan Statistik */}
        <Text style={styles.sectionTitle}>Ringkasan Penitipan</Text>
        <View style={styles.statsGrid}>
          <View style={[styles.statCard, { borderLeftColor: colors.warning }]}>
            <View style={styles.statTop}>
              <Text style={styles.statNumber}>{menungguKonfirmasi.length}</Text>
              <Ionicons name="time-outline" size={20} color={colors.warning} />
            </View>
            <Text style={styles.statLabel}>Menunggu Konfirmasi</Text>
          </View>

          <View style={[styles.statCard, { borderLeftColor: colors.secondary }]}>
            <View style={styles.statTop}>
              <Text style={styles.statNumber}>{sedangDititipkan.length}</Text>
              <Ionicons name="bicycle-outline" size={20} color={colors.secondary} />
            </View>
            <Text style={styles.statLabel}>Sedang Dititipkan</Text>
          </View>

          <View style={[styles.statCard, { borderLeftColor: colors.primary }]}>
            <View style={styles.statTop}>
              <Text style={styles.statNumber}>{dikonfirmasi.length + pembayaranBerhasil.length}</Text>
              <Ionicons name="checkmark-done-circle-outline" size={20} color={colors.primary} />
            </View>
            <Text style={styles.statLabel}>Siap / Terkonfirmasi</Text>
          </View>

          <View style={[styles.statCard, { borderLeftColor: colors.neutral500 }]}>
            <View style={styles.statTop}>
              <Text style={styles.statNumber}>{selesai.length}</Text>
              <Ionicons name="archive-outline" size={20} color={colors.neutral500} />
            </View>
            <Text style={styles.statLabel}>Penitipan Selesai</Text>
          </View>
        </View>

        {/* REST API & Data Modeling Display */}
        <ApiDataDisplay />

        {/* Antrean Menunggu Konfirmasi */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Perlu Dikonfirmasi ({menungguKonfirmasi.length})</Text>
          <TouchableOpacity onPress={() => navigation.navigate('BookingTab')}>
            <Text style={styles.seeAll}>Lihat Semua</Text>
          </TouchableOpacity>
        </View>

        {menungguKonfirmasi.length === 0 ? (
          <View style={styles.emptyCard}>
            <Ionicons name="checkmark-circle-outline" size={36} color={colors.secondary} />
            <Text style={styles.emptyTitle}>Semua Beres!</Text>
            <Text style={styles.emptyDesc}>Tidak ada booking baru yang menunggu konfirmasi.</Text>
          </View>
        ) : (
          menungguKonfirmasi.map((b) => (
            <TouchableOpacity
              key={b.id}
              style={[styles.bookingItem, shadows.sm]}
              onPress={() =>
                navigation.navigate('BookingTab', {
                  screen: 'BookingDetail',
                  params: { bookingId: b.id },
                })
              }
              activeOpacity={0.85}
            >
              <View style={styles.bookingRowTop}>
                <View>
                  <Text style={styles.bookingNopol}>{b.nomorPolisi}</Text>
                  <Text style={styles.bookingSub}>{b.merek} · {b.warna}</Text>
                </View>
                <StatusBadge status={b.status} />
              </View>
              <View style={styles.divider} />
              <View style={styles.bookingRowBottom}>
                <View style={styles.rowInfo}>
                  <Ionicons name="person-outline" size={13} color={colors.neutral500} />
                  <Text style={styles.rowText}>{b.customerName}</Text>
                </View>
                <View style={styles.rowInfo}>
                  <Ionicons name="calendar-outline" size={13} color={colors.neutral500} />
                  <Text style={styles.rowText}>{formatDate(b.tanggalMasuk)}</Text>
                </View>
                <Text style={styles.actionPrompt}>Tinjau ➔</Text>
              </View>
            </TouchableOpacity>
          ))
        )}

        {/* Quick Nav Card: Motor Sedang Dititipkan */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Motor Sedang Dititipkan</Text>
          <TouchableOpacity onPress={() => navigation.navigate('MotorTab')}>
            <Text style={styles.seeAll}>Buka Data Motor</Text>
          </TouchableOpacity>
        </View>

        {sedangDititipkan.slice(0, 2).map((b) => (
          <TouchableOpacity
            key={b.id}
            style={[styles.activeMotorCard, shadows.sm]}
            onPress={() =>
              navigation.navigate('MotorTab', {
                screen: 'MonitoringForm',
                params: { bookingId: b.id },
              })
            }
            activeOpacity={0.85}
          >
            <View style={styles.motorIconBox}>
              <Ionicons name="bicycle" size={24} color={colors.secondary} />
            </View>
            <View style={styles.motorInfo}>
              <Text style={styles.motorNopol}>{b.nomorPolisi}</Text>
              <Text style={styles.motorLokasi}>{b.lokasi || 'Slot Belum Ditentukan'}</Text>
              <Text style={styles.motorOwner}>Pemilik: {b.customerName}</Text>
            </View>
            <View style={styles.updateBadge}>
              <Ionicons name="create-outline" size={14} color={colors.primary} />
              <Text style={styles.updateBadgeText}>Update Laporan</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral100,
  },
  greeting: { fontSize: 13, color: colors.neutral500 },
  userName: { fontSize: 20, fontWeight: '800', color: colors.neutral900, marginTop: 2 },
  badgePengelola: {
    backgroundColor: colors.purpleLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  badgePengelolaText: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.purple,
    letterSpacing: 1,
  },
  scroll: { flex: 1 },
  content: { padding: 16, paddingBottom: 60 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: colors.neutral900, marginBottom: 12 },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 12,
  },
  seeAll: { fontSize: 13, color: colors.primary, fontWeight: '600' },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 8,
  },
  statCard: {
    width: '48%',
    backgroundColor: colors.white,
    borderRadius: 14,
    padding: 14,
    borderLeftWidth: 4,
    ...shadows.sm,
  },
  statTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  statNumber: { fontSize: 22, fontWeight: '800', color: colors.neutral900 },
  statLabel: { fontSize: 11, color: colors.neutral500, fontWeight: '500' },
  emptyCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    ...shadows.sm,
  },
  emptyTitle: { fontSize: 15, fontWeight: '700', color: colors.neutral900, marginTop: 8 },
  emptyDesc: { fontSize: 12, color: colors.neutral500, marginTop: 2 },
  bookingItem: {
    backgroundColor: colors.white,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
  },
  bookingRowTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  bookingNopol: { fontSize: 16, fontWeight: '700', color: colors.neutral900 },
  bookingSub: { fontSize: 12, color: colors.neutral500, marginTop: 2 },
  divider: { height: 1, backgroundColor: colors.neutral100, marginVertical: 10 },
  bookingRowBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rowInfo: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  rowText: { fontSize: 12, color: colors.neutral700 },
  actionPrompt: { fontSize: 12, fontWeight: '700', color: colors.primary },
  activeMotorCard: {
    backgroundColor: colors.white,
    borderRadius: 14,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 10,
  },
  motorIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: colors.secondaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  motorInfo: { flex: 1 },
  motorNopol: { fontSize: 15, fontWeight: '700', color: colors.neutral900 },
  motorLokasi: { fontSize: 12, fontWeight: '600', color: colors.primary, marginTop: 1 },
  motorOwner: { fontSize: 11, color: colors.neutral500, marginTop: 1 },
  updateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 8,
  },
  updateBadgeText: { fontSize: 11, fontWeight: '700', color: colors.primary },
});

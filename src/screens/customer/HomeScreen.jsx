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
import VehicleCard from '../../components/VehicleCard';
import StatusBadge from '../../components/StatusBadge';
import ApiDataDisplay from '../../components/ApiDataDisplay';
import { formatDate } from '../../utils/helpers';

export default function HomeScreen({ navigation }) {
  const { currentUser, getActiveBookingByCustomer, getBookingsByCustomer } = useApp();
  const [refreshing, setRefreshing] = React.useState(false);

  const activeBooking = getActiveBookingByCustomer(currentUser.id);
  const allBookings = getBookingsByCustomer(currentUser.id);
  const recentBookings = allBookings
    .filter((b) => b.status === 'selesai' || b.status === 'dibatalkan')
    .slice(0, 3);

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 800);
  };

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? 'Selamat Pagi' : hour < 15 ? 'Selamat Siang' : hour < 18 ? 'Selamat Sore' : 'Selamat Malam';

  return (
    <SafeAreaView style={styles.safe}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <View>
          <Text style={styles.greeting}>{greeting},</Text>
          <Text style={styles.userName}>{currentUser.name} 👋</Text>
        </View>
        <View style={styles.logoMini}>
          <Ionicons name="shield-checkmark" size={20} color={colors.white} />
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
        {/* Active Penitipan */}
        {activeBooking ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Penitipan Aktif</Text>
            <VehicleCard
              booking={activeBooking}
              onPress={() =>
                navigation.navigate('BookingDetail', { bookingId: activeBooking.id })
              }
            />

            {/* Quick Actions */}
            <View style={styles.quickRow}>
              {activeBooking.status === 'sedang_dititipkan' && (
                <QuickAction
                  icon="eye-outline"
                  label="Monitoring"
                  color={colors.secondary}
                  onPress={() => navigation.getParent().navigate('MonitoringTab')}
                />
              )}
              {activeBooking.status === 'dikonfirmasi' && (
                <QuickAction
                  icon="card-outline"
                  label="Bayar Sekarang"
                  color={colors.primary}
                  onPress={() =>
                    navigation.navigate('Payment', { bookingId: activeBooking.id })
                  }
                />
              )}
              <QuickAction
                icon="document-text-outline"
                label="Lihat Detail"
                color={colors.neutral700}
                onPress={() =>
                  navigation.navigate('BookingDetail', { bookingId: activeBooking.id })
                }
              />
            </View>
          </View>
        ) : (
          /* No Active Booking — CTA */
          <View style={styles.ctaCard}>
            <View style={styles.ctaIconBox}>
              <Ionicons name="bicycle-outline" size={36} color={colors.primary} />
            </View>
            <Text style={styles.ctaTitle}>Titipkan Motor Anda</Text>
            <Text style={styles.ctaDesc}>
              Belum ada penitipan aktif. Buat booking sekarang dan kami akan menjaga motor Anda.
            </Text>
            <TouchableOpacity
              style={styles.ctaBtn}
              onPress={() => navigation.navigate('BookingForm')}
              activeOpacity={0.85}
            >
              <Ionicons name="add-circle-outline" size={18} color={colors.white} />
              <Text style={styles.ctaBtnText}>Booking Penitipan</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* New Booking Button (when active exists) */}
        {activeBooking && (
          <TouchableOpacity
            style={styles.newBookingBtn}
            onPress={() => navigation.navigate('BookingForm')}
            activeOpacity={0.85}
          >
            <Ionicons name="add-circle-outline" size={18} color={colors.primary} />
            <Text style={styles.newBookingText}>Booking Penitipan Baru</Text>
            <Ionicons name="chevron-forward" size={16} color={colors.neutral300} style={{ marginLeft: 'auto' }} />
          </TouchableOpacity>
        )}

        {/* REST API & Data Modeling Display */}
        <ApiDataDisplay />

        {/* Recent History */}
        {recentBookings.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Riwayat Terbaru</Text>
              <TouchableOpacity onPress={() => navigation.getParent().navigate('RiwayatTab')}>
                <Text style={styles.seeAll}>Lihat Semua</Text>
              </TouchableOpacity>
            </View>
            {recentBookings.map((b) => (
              <TouchableOpacity
                key={b.id}
                style={styles.historyItem}
                onPress={() => navigation.navigate('BookingDetail', { bookingId: b.id })}
                activeOpacity={0.85}
              >
                <View style={styles.historyIcon}>
                  <Ionicons name="bicycle-outline" size={18} color={colors.neutral500} />
                </View>
                <View style={styles.historyInfo}>
                  <Text style={styles.historyNopol}>{b.nomorPolisi}</Text>
                  <Text style={styles.historyMeta}>{b.merek} · {formatDate(b.tanggalMasuk)}</Text>
                </View>
                <StatusBadge status={b.status} />
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function QuickAction({ icon, label, color, onPress }) {
  return (
    <TouchableOpacity style={styles.qaBtn} onPress={onPress} activeOpacity={0.8}>
      <View style={[styles.qaIcon, { backgroundColor: color + '18' }]}>
        <Ionicons name={icon} size={18} color={color} />
      </View>
      <Text style={[styles.qaLabel, { color }]}>{label}</Text>
    </TouchableOpacity>
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
  logoMini: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: { flex: 1 },
  content: { padding: 16, paddingBottom: 60 },
  section: { marginBottom: 20 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: colors.neutral900, marginBottom: 12 },
  seeAll: { fontSize: 13, color: colors.primary, fontWeight: '600' },
  // Quick actions
  quickRow: { flexDirection: 'row', gap: 10, marginTop: 4 },
  qaBtn: { flex: 1, alignItems: 'center', gap: 6 },
  qaIcon: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  qaLabel: { fontSize: 11, fontWeight: '600', textAlign: 'center' },
  // New Booking Button
  newBookingBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.white,
    borderRadius: 14,
    padding: 16,
    marginBottom: 20,
    ...shadows.sm,
  },
  newBookingText: { fontSize: 14, fontWeight: '600', color: colors.primary },
  // CTA Card
  ctaCard: {
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: 28,
    alignItems: 'center',
    marginBottom: 20,
    ...shadows.md,
  },
  ctaIconBox: {
    width: 72,
    height: 72,
    borderRadius: 20,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  ctaTitle: { fontSize: 18, fontWeight: '700', color: colors.neutral900, marginBottom: 8 },
  ctaDesc: { fontSize: 13, color: colors.neutral500, textAlign: 'center', lineHeight: 20, marginBottom: 20 },
  ctaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  ctaBtnText: { color: colors.white, fontWeight: '700', fontSize: 14 },
  // History
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    ...shadows.sm,
  },
  historyIcon: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: colors.neutral100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  historyInfo: { flex: 1 },
  historyNopol: { fontSize: 14, fontWeight: '700', color: colors.neutral900 },
  historyMeta: { fontSize: 12, color: colors.neutral500, marginTop: 2 },
});

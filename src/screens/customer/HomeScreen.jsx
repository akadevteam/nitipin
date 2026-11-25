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

// Menu cepat yang tampil di beranda
const QUICK_MENUS = [
  {
    icon: 'add-circle-outline',
    label: 'Booking Baru',
    color: colors.primary,
    bg: colors.primaryLight,
    route: 'BookingForm',
  },
  {
    icon: 'eye-outline',
    label: 'Monitoring',
    color: colors.secondary,
    bg: colors.secondaryLight,
    route: 'MonitoringTab',
    isTab: true,
  },
  {
    icon: 'map-outline',
    label: 'Peta Lokasi',
    color: '#7E3AF2',
    bg: '#EDEBFE',
    route: 'Location',
  },
  {
    icon: 'notifications-outline',
    label: 'Notifikasi',
    color: '#E3A008',
    bg: '#FDF6B2',
    route: 'Notification',
  },
];

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

  const handleQuickMenu = (menu) => {
    if (menu.isTab) {
      const parent = navigation.getParent();
      if (parent) {
        parent.navigate(menu.route);
      } else {
        navigation.navigate(menu.route);
      }
    } else {
      navigation.navigate(menu.route);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* ── Hero Header ── */}
      <View style={styles.hero}>
        <View style={styles.heroLeft}>
          <Text style={styles.heroGreeting}>{greeting} 👋</Text>
          <Text style={styles.heroName}>{currentUser.name}</Text>
          <View style={styles.heroBadge}>
            <Ionicons name="shield-checkmark" size={11} color={colors.white} />
            <Text style={styles.heroBadgeText}>NITIPIN · Motor Aman</Text>
          </View>
        </View>
        <TouchableOpacity
          style={styles.heroNotifBtn}
          onPress={() => navigation.navigate('Notification')}
          activeOpacity={0.8}
        >
          <Ionicons name="notifications-outline" size={22} color={colors.white} />
          <View style={styles.notifDot} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />
        }
      >
        {/* ── Quick Menu 2×2 ── */}
        <View style={styles.quickMenuGrid}>
          {QUICK_MENUS.map((menu) => (
            <TouchableOpacity
              key={menu.route}
              style={styles.quickMenuCard}
              onPress={() => handleQuickMenu(menu)}
              activeOpacity={0.8}
            >
              <View style={[styles.quickMenuIcon, { backgroundColor: menu.bg }]}>
                <Ionicons name={menu.icon} size={24} color={menu.color} />
              </View>
              <Text style={[styles.quickMenuLabel, { color: menu.color }]}>{menu.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ── Penitipan Aktif ── */}
        {activeBooking ? (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleRow}>
                <View style={styles.sectionDot} />
                <Text style={styles.sectionTitle}>Penitipan Aktif</Text>
              </View>
            </View>
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
                  onPress={() => {
                    try {
                      navigation.navigate('Monitoring');
                    } catch (e) {
                      navigation.getParent()?.navigate('MonitoringTab');
                    }
                  }}
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
            <View style={styles.newBookingIconWrap}>
              <Ionicons name="add-circle-outline" size={20} color={colors.primary} />
            </View>
            <Text style={styles.newBookingText}>Booking Penitipan Baru</Text>
            <Ionicons name="chevron-forward" size={16} color={colors.neutral300} style={{ marginLeft: 'auto' }} />
          </TouchableOpacity>
        )}

        {/* ── Status Slot & Layanan ── */}
        <View style={styles.apiSection}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <View style={[styles.sectionDot, { backgroundColor: colors.secondary }]} />
              <Text style={styles.sectionTitle}>Status Slot & Layanan</Text>
            </View>
          </View>
          <ApiDataDisplay />
        </View>

        {/* ── Riwayat Terbaru ── */}
        {recentBookings.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleRow}>
                <View style={[styles.sectionDot, { backgroundColor: colors.neutral500 }]} />
                <Text style={styles.sectionTitle}>Riwayat Terbaru</Text>
              </View>
              <TouchableOpacity onPress={() => {
                const parent = navigation.getParent();
                if (parent) {
                  parent.navigate('RiwayatTab');
                } else {
                  navigation.navigate('RiwayatTab');
                }
              }}>
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
  safe: { flex: 1, backgroundColor: colors.primary },

  // ── Hero Header ──
  hero: {
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  heroLeft: { flex: 1 },
  heroGreeting: { fontSize: 13, color: 'rgba(255,255,255,0.75)', fontWeight: '500' },
  heroName: { fontSize: 22, fontWeight: '800', color: colors.white, marginTop: 2, marginBottom: 8 },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  heroBadgeText: { fontSize: 11, color: colors.white, fontWeight: '600' },
  heroNotifBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  notifDot: {
    position: 'absolute',
    top: 9,
    right: 9,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FCD34D',
    borderWidth: 1.5,
    borderColor: colors.primary,
  },

  // ── Scroll ──
  scroll: { flex: 1, backgroundColor: colors.background, borderTopLeftRadius: 24, borderTopRightRadius: 24, marginTop: -1 },
  content: { paddingTop: 20, paddingHorizontal: 16, paddingBottom: 60 },

  // ── Quick Menu Grid ──
  quickMenuGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  quickMenuCard: {
    width: '47%',
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    gap: 10,
    ...shadows.sm,
  },
  quickMenuIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickMenuLabel: {
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'center',
  },

  // ── Section ──
  section: { marginBottom: 20 },
  apiSection: { marginBottom: 20 },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  sectionDot: {
    width: 4,
    height: 18,
    borderRadius: 2,
    backgroundColor: colors.primary,
  },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: colors.neutral900 },
  seeAll: { fontSize: 13, color: colors.primary, fontWeight: '600' },

  // ── Quick Actions (active booking) ──
  quickRow: { flexDirection: 'row', gap: 10, marginTop: 4 },
  qaBtn: { flex: 1, alignItems: 'center', gap: 6 },
  qaIcon: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  qaLabel: { fontSize: 11, fontWeight: '600', textAlign: 'center' },

  // ── New Booking Button ──
  newBookingBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.white,
    borderRadius: 14,
    padding: 14,
    marginBottom: 20,
    ...shadows.sm,
  },
  newBookingIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  newBookingText: { fontSize: 14, fontWeight: '600', color: colors.primary },

  // ── CTA Card ──
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

  // ── History ──
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

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../../context/AppContext';
import { colors, shadows } from '../../theme/colors';

export default function ProfileScreen() {
  const { currentUser, logout, getBookingsByCustomer } = useApp();
  const bookings = getBookingsByCustomer(currentUser.id);
  const activeCount = bookings.filter((b) =>
    ['sedang_dititipkan', 'dikonfirmasi', 'menunggu_konfirmasi', 'pembayaran_berhasil'].includes(b.status)
  ).length;
  const doneCount = bookings.filter((b) => b.status === 'selesai').length;

  const handleLogout = () => {
    Alert.alert('Keluar', 'Apakah Anda yakin ingin keluar?', [
      { text: 'Batal', style: 'cancel' },
      { text: 'Keluar', style: 'destructive', onPress: logout },
    ]);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.topBar}>
        <Text style={styles.title}>Profil Saya</Text>
      </View>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Avatar */}
        <View style={styles.avatarSection}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {currentUser.name.charAt(0).toUpperCase()}
            </Text>
          </View>
          <Text style={styles.name}>{currentUser.name}</Text>
          <Text style={styles.email}>{currentUser.email}</Text>
          <View style={styles.roleBadge}>
            <Ionicons name="person-outline" size={12} color={colors.primary} />
            <Text style={styles.roleText}>Customer</Text>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <StatItem label="Penitipan Aktif" value={activeCount} color={colors.secondary} />
          <StatItem label="Total Selesai" value={doneCount} color={colors.primary} />
          <StatItem label="Total Booking" value={bookings.length} color={colors.neutral700} />
        </View>

        {/* Info */}
        <View style={styles.infoCard}>
          <InfoRow icon="person-outline" label="Nama" value={currentUser.name} />
          <InfoRow icon="mail-outline" label="Email" value={currentUser.email} />
          <InfoRow icon="call-outline" label="Nomor HP" value={currentUser.phone || '-'} />
        </View>

        {/* Logout */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.8}>
          <Ionicons name="log-out-outline" size={18} color={colors.danger} />
          <Text style={styles.logoutText}>Keluar</Text>
        </TouchableOpacity>

        <Text style={styles.version}>NITIPIN v1.0.0 — Prototype</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function StatItem({ label, value, color }) {
  return (
    <View style={styles.statItem}>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function InfoRow({ icon, label, value }) {
  return (
    <View style={styles.infoRow}>
      <Ionicons name={icon} size={15} color={colors.neutral500} />
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  topBar: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral100,
  },
  title: { fontSize: 18, fontWeight: '800', color: colors.neutral900 },
  content: { padding: 16, paddingBottom: 40 },
  avatarSection: { alignItems: 'center', marginBottom: 20, paddingTop: 8 },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  avatarText: { fontSize: 32, fontWeight: '800', color: colors.white },
  name: { fontSize: 20, fontWeight: '800', color: colors.neutral900 },
  email: { fontSize: 13, color: colors.neutral500, marginTop: 2 },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.primaryLight,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginTop: 8,
  },
  roleText: { fontSize: 12, fontWeight: '600', color: colors.primary },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    ...shadows.sm,
  },
  statItem: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: 24, fontWeight: '800' },
  statLabel: { fontSize: 11, color: colors.neutral500, marginTop: 2, textAlign: 'center' },
  infoCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 4,
    marginBottom: 12,
    ...shadows.sm,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral100,
  },
  infoLabel: { flex: 1, fontSize: 13, color: colors.neutral500 },
  infoValue: { fontSize: 13, fontWeight: '600', color: colors.neutral900 },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.dangerLight,
    borderRadius: 12,
    padding: 14,
    marginBottom: 20,
  },
  logoutText: { fontSize: 15, fontWeight: '700', color: colors.danger },
  version: { textAlign: 'center', fontSize: 12, color: colors.neutral300 },
});

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../../context/AppContext';
import { colors, shadows } from '../../theme/colors';

export default function ProfilePengelolaScreen() {
  const { currentUser, logout, bookings } = useApp();

  const totalBooking = bookings.length;
  const motorAktif = bookings.filter((b) => b.status === 'sedang_dititipkan').length;
  const selesaiCount = bookings.filter((b) => b.status === 'selesai').length;

  const handleLogout = () => {
    Alert.alert('Keluar Akun Pengelola', 'Apakah Anda yakin ingin keluar?', [
      { text: 'Batal', style: 'cancel' },
      { text: 'Keluar', style: 'destructive', onPress: logout },
    ]);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.topBar}>
        <Text style={styles.title}>Profil Pengelola</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Avatar Section */}
        <View style={styles.avatarSection}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : 'P'}
            </Text>
          </View>
          <Text style={styles.name}>{currentUser?.name || 'Pak Roni'}</Text>
          <Text style={styles.email}>{currentUser?.email || 'pengelola@nitipin.id'}</Text>
          <View style={styles.roleBadge}>
            <Ionicons name="shield-checkmark" size={13} color={colors.purple} />
            <Text style={styles.roleText}>Pengelola Penitipan (Admin)</Text>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <StatItem label="Motor Dititipkan" value={motorAktif} color={colors.secondary} />
          <StatItem label="Penitipan Selesai" value={selesaiCount} color={colors.primary} />
          <StatItem label="Total Booking" value={totalBooking} color={colors.neutral700} />
        </View>

        {/* Info Lokasi Penitipan */}
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Informasi Penitipan NITIPIN</Text>
          <InfoRow icon="business-outline" label="Nama Penitipan" value="NITIPIN Hub Sentral" />
          <InfoRow icon="location-outline" label="Alamat" value="Jl. Kampus Raya No. 45" />
          <InfoRow icon="time-outline" label="Jam Operasional" value="24 Jam Setiap Hari" />
          <InfoRow icon="call-outline" label="Hotline Admin" value={currentUser?.phone || '085678901234'} />
        </View>

        {/* Logout */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.8}>
          <Ionicons name="log-out-outline" size={18} color={colors.danger} />
          <Text style={styles.logoutText}>Keluar dari Panel Pengelola</Text>
        </TouchableOpacity>

        <Text style={styles.version}>NITIPIN Pengelola v1.0.0 — Mode Prototype</Text>
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
    backgroundColor: colors.purple,
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
    backgroundColor: colors.purpleLight,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginTop: 8,
  },
  roleText: { fontSize: 12, fontWeight: '700', color: colors.purple },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    ...shadows.sm,
  },
  statItem: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: 24, fontWeight: '800' },
  statLabel: { fontSize: 11, color: colors.neutral500, marginTop: 2, textAlign: 'center' },
  infoCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    ...shadows.sm,
  },
  infoTitle: { fontSize: 14, fontWeight: '700', color: colors.neutral900, marginBottom: 10 },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
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

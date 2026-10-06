import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../../context/AppContext';
import Header from '../../components/Header';
import MonitoringCard from '../../components/MonitoringCard';
import StatusBadge from '../../components/StatusBadge';
import TTSButton from '../../components/TTSButton';
import { colors, shadows } from '../../theme/colors';
import { generateMonitoringTTS } from '../../utils/helpers';

export default function MonitoringScreen({ navigation }) {
  const { currentUser, getActiveBookingByCustomer, getMonitoringByBookingId } = useApp();
  const activeBooking = getActiveBookingByCustomer(currentUser.id);
  const monitoring = activeBooking ? getMonitoringByBookingId(activeBooking.id) : null;

  if (!activeBooking || !['sedang_dititipkan', 'pembayaran_berhasil'].includes(activeBooking.status)) {
    return (
      <SafeAreaView style={styles.safe}>
        <Header title="Monitoring Motor" />
        <View style={styles.empty}>
          <Ionicons name="eye-off-outline" size={52} color={colors.neutral300} />
          <Text style={styles.emptyTitle}>Tidak Ada Penitipan Aktif</Text>
          <Text style={styles.emptyDesc}>
            Monitoring hanya tersedia saat motor sedang dititipkan.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const ttsText = generateMonitoringTTS(activeBooking, monitoring);

  return (
    <SafeAreaView style={styles.safe}>
      <Header
        title="Monitoring Motor"
        subtitle={activeBooking.nomorPolisi}
        rightComponent={
          <TTSButton text={ttsText} />
        }
      />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Motor Summary */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <View>
              <Text style={styles.nopol}>{activeBooking.nomorPolisi}</Text>
              <Text style={styles.merek}>{activeBooking.merek} · {activeBooking.warna}</Text>
            </View>
            <StatusBadge status={activeBooking.status} />
          </View>
          <View style={styles.divider} />
          <View style={styles.lokasiRow}>
            <Ionicons name="location" size={16} color={colors.primary} />
            <Text style={styles.lokasiText}>
              {activeBooking.lokasi || 'Lokasi belum ditentukan'}
            </Text>
          </View>
        </View>

        {/* Monitoring Card */}
        {monitoring ? (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Foto & Status Terkini</Text>
              <TTSButton text={ttsText} size="sm" />
            </View>
            <MonitoringCard
              booking={activeBooking}
              monitoring={monitoring}
              style={styles.monCard}
            />
          </>
        ) : (
          <View style={styles.noMonCard}>
            <Ionicons name="camera-outline" size={36} color={colors.neutral300} />
            <Text style={styles.noMonTitle}>Belum Ada Data Monitoring</Text>
            <Text style={styles.noMonDesc}>
              Pengelola belum mengunggah data monitoring. Silakan cek kembali nanti.
            </Text>
          </View>
        )}

        {/* Detail Report Button */}
        {monitoring && (
          <TouchableOpacity
            style={styles.reportBtn}
            onPress={() => navigation.navigate('ConditionReport', { bookingId: activeBooking.id })}
            activeOpacity={0.85}
          >
            <Ionicons name="document-text-outline" size={18} color={colors.primary} />
            <Text style={styles.reportBtnText}>Lihat Laporan Kondisi Lengkap</Text>
            <Ionicons name="chevron-forward" size={16} color={colors.primary} style={{ marginLeft: 'auto' }} />
          </TouchableOpacity>
        )}

        {/* TTS Info */}
        <View style={styles.ttsInfo}>
          <Ionicons name="volume-medium-outline" size={14} color={colors.primary} />
          <Text style={styles.ttsInfoText}>
            Tekan tombol speaker di pojok kanan atas untuk mendengarkan informasi motor.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { padding: 16, paddingBottom: 40 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  emptyTitle: { fontSize: 17, fontWeight: '700', color: colors.neutral700, marginTop: 16, marginBottom: 8 },
  emptyDesc: { fontSize: 13, color: colors.neutral500, textAlign: 'center', lineHeight: 20 },
  summaryCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    ...shadows.sm,
  },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  nopol: { fontSize: 20, fontWeight: '800', color: colors.neutral900, letterSpacing: 0.5 },
  merek: { fontSize: 13, color: colors.neutral500, marginTop: 2 },
  divider: { height: 1, backgroundColor: colors.neutral100, marginVertical: 12 },
  lokasiRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  lokasiText: { fontSize: 14, fontWeight: '600', color: colors.primary },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: colors.neutral900 },
  monCard: { ...shadows.sm, marginBottom: 12 },
  noMonCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 28,
    alignItems: 'center',
    ...shadows.sm,
    marginBottom: 12,
  },
  noMonTitle: { fontSize: 15, fontWeight: '700', color: colors.neutral700, marginTop: 12, marginBottom: 6 },
  noMonDesc: { fontSize: 13, color: colors.neutral500, textAlign: 'center', lineHeight: 18 },
  reportBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.primaryLight,
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
  },
  reportBtnText: { fontSize: 14, fontWeight: '600', color: colors.primary },
  ttsInfo: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'flex-start',
    backgroundColor: colors.primaryLight,
    borderRadius: 10,
    padding: 12,
  },
  ttsInfoText: { flex: 1, fontSize: 12, color: colors.primary, lineHeight: 18 },
});

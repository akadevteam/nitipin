import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../../context/AppContext';
import Header from '../../components/Header';
import ConditionCard from '../../components/ConditionCard';
import TTSButton from '../../components/TTSButton';
import { colors, shadows } from '../../theme/colors';
import { MOTOR_PLACEHOLDER_IMAGES } from '../../data/dummyData';
import { formatDate, generateMonitoringTTS } from '../../utils/helpers';

export default function ConditionReportScreen({ navigation, route }) {
  const { bookingId } = route.params;
  const { getBookingById, getMonitoringByBookingId } = useApp();
  const booking = getBookingById(bookingId);
  const monitoring = getMonitoringByBookingId(bookingId);

  if (!booking || !monitoring) {
    return (
      <SafeAreaView style={styles.safe}>
        <Header title="Laporan Kondisi" showBack onBack={() => navigation.goBack()} />
        <View style={styles.empty}>
          <Ionicons name="document-outline" size={52} color={colors.neutral300} />
          <Text style={styles.emptyTitle}>Laporan Belum Tersedia</Text>
          <Text style={styles.emptyDesc}>Pengelola belum mengisi laporan kondisi motor.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const ttsText = generateMonitoringTTS(booking, monitoring);
  const fotoUri = MOTOR_PLACEHOLDER_IMAGES[monitoring.fotoIndex ?? booking.fotoIndex ?? 0];

  return (
    <SafeAreaView style={styles.safe}>
      <Header
        title="Laporan Kondisi"
        subtitle={booking.nomorPolisi}
        showBack
        onBack={() => navigation.goBack()}
        rightComponent={<TTSButton text={ttsText} />}
      />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Foto */}
        <Image source={{ uri: fotoUri }} style={styles.foto} resizeMode="cover" />

        {/* Tanggal Laporan */}
        <View style={styles.dateBar}>
          <Ionicons name="calendar-outline" size={14} color={colors.neutral500} />
          <Text style={styles.dateText}>
            Laporan per {formatDate(monitoring.tanggalMonitoring)}
          </Text>
        </View>

        {/* Lokasi */}
        <View style={styles.lokasiCard}>
          <View style={styles.lokasiLeft}>
            <Ionicons name="location" size={18} color={colors.primary} />
            <View>
              <Text style={styles.lokasiLabel}>Lokasi Penyimpanan</Text>
              <Text style={styles.lokasiValue}>{monitoring.lokasi}</Text>
            </View>
          </View>
        </View>

        {/* Condition Card */}
        <ConditionCard monitoring={monitoring} style={[styles.condCard, shadows.sm]} />

        {/* TTS Section */}
        <View style={styles.ttsCard}>
          <View style={styles.ttsLeft}>
            <Ionicons name="volume-medium-outline" size={18} color={colors.primary} />
            <View>
              <Text style={styles.ttsTitle}>Dengarkan Laporan</Text>
              <Text style={styles.ttsDesc}>Tekan tombol untuk membacakan laporan kondisi motor.</Text>
            </View>
          </View>
          <TTSButton text={ttsText} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { paddingBottom: 40 },
  foto: { width: '100%', height: 200, backgroundColor: colors.neutral100 },
  dateBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral100,
  },
  dateText: { fontSize: 12, color: colors.neutral500 },
  lokasiCard: {
    backgroundColor: colors.primaryLight,
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 12,
    padding: 14,
  },
  lokasiLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  lokasiLabel: { fontSize: 11, color: colors.primary },
  lokasiValue: { fontSize: 15, fontWeight: '700', color: colors.primary },
  condCard: { margin: 16, marginBottom: 0 },
  ttsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.white,
    margin: 16,
    borderRadius: 14,
    padding: 14,
    ...shadows.sm,
  },
  ttsLeft: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  ttsTitle: { fontSize: 13, fontWeight: '700', color: colors.neutral900 },
  ttsDesc: { fontSize: 11, color: colors.neutral500, marginTop: 2 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  emptyTitle: { fontSize: 17, fontWeight: '700', color: colors.neutral700, marginTop: 16, marginBottom: 6 },
  emptyDesc: { fontSize: 13, color: colors.neutral500, textAlign: 'center' },
});

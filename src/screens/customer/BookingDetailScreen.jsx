import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../../context/AppContext';
import Header from '../../components/Header';
import StatusBadge from '../../components/StatusBadge';
import Button from '../../components/Button';
import { colors, shadows } from '../../theme/colors';
import { MOTOR_PLACEHOLDER_IMAGES } from '../../data/dummyData';
import {
  formatDate,
  formatCurrency,
  calculateDuration,
  canCancelBooking,
  canPayBooking,
  getPaymentMethodLabel,
} from '../../utils/helpers';

export default function BookingDetailScreen({ navigation, route }) {
  const { bookingId } = route.params;
  const { getBookingById, updateBooking } = useApp();
  const booking = getBookingById(bookingId);
  const [loading, setLoading] = useState(false);

  if (!booking) {
    return (
      <SafeAreaView style={styles.safe}>
        <Header title="Detail Booking" showBack onBack={() => navigation.goBack()} />
        <View style={styles.empty}>
          <Text style={styles.emptyText}>Booking tidak ditemukan.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const duration = calculateDuration(booking.tanggalMasuk, booking.tanggalKeluar);
  const fotoUri = MOTOR_PLACEHOLDER_IMAGES[booking.fotoIndex ?? 0];

  const handleCancel = () => {
    Alert.alert(
      'Batalkan Booking',
      'Apakah Anda yakin ingin membatalkan booking ini?',
      [
        { text: 'Tidak', style: 'cancel' },
        {
          text: 'Ya, Batalkan',
          style: 'destructive',
          onPress: () => {
            setLoading(true);
            setTimeout(() => {
              updateBooking(bookingId, { status: 'dibatalkan' });
              setLoading(false);
              Alert.alert('Berhasil', 'Booking telah dibatalkan.');
            }, 600);
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <Header title="Detail Booking" showBack onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Foto */}
        <Image source={{ uri: fotoUri }} style={styles.foto} resizeMode="cover" />

        {/* Status */}
        <View style={styles.statusRow}>
          <StatusBadge status={booking.status} />
          {booking.status === 'menunggu_konfirmasi' && (
            <View style={styles.waitingInfo}>
              <Ionicons name="time-outline" size={13} color={colors.warning} />
              <Text style={styles.waitingText}>Menunggu konfirmasi dari pengelola</Text>
            </View>
          )}
        </View>

        {/* Info Motor */}
        <InfoCard title="Informasi Motor">
          <InfoRow icon="car-outline" label="Nomor Polisi" value={booking.nomorPolisi} highlight />
          <InfoRow icon="bicycle-outline" label="Merek / Tipe" value={booking.merek} />
          <InfoRow icon="color-palette-outline" label="Warna" value={booking.warna} />
          <InfoRow icon="person-outline" label="Pemilik" value={booking.customerName} />
          <InfoRow icon="call-outline" label="Nomor HP" value={booking.customerPhone} />
        </InfoCard>

        {/* Info Penitipan */}
        <InfoCard title="Info Penitipan">
          <InfoRow icon="calendar-outline" label="Tanggal Masuk" value={formatDate(booking.tanggalMasuk)} />
          <InfoRow icon="calendar-outline" label="Tanggal Keluar" value={formatDate(booking.tanggalKeluar)} />
          <InfoRow icon="time-outline" label="Durasi" value={`${duration} hari`} />
          <InfoRow
            icon="location-outline"
            label="Lokasi Penyimpanan"
            value={booking.lokasi || 'Belum ditentukan'}
            valueColor={booking.lokasi ? colors.secondary : colors.neutral500}
          />
        </InfoCard>

        {/* Info Pembayaran */}
        <InfoCard title="Pembayaran">
          <InfoRow icon="pricetag-outline" label="Total Biaya" value={formatCurrency(booking.totalBiaya)} highlight />
          <InfoRow
            icon="card-outline"
            label="Metode"
            value={getPaymentMethodLabel(booking.metodePembayaran)}
          />
          <InfoRow
            icon="checkmark-circle-outline"
            label="Status Bayar"
            value={
              ['pembayaran_berhasil', 'sedang_dititipkan', 'selesai'].includes(booking.status)
                ? 'Lunas'
                : 'Belum Dibayar'
            }
            valueColor={
              ['pembayaran_berhasil', 'sedang_dititipkan', 'selesai'].includes(booking.status)
                ? colors.secondary
                : colors.warning
            }
          />
        </InfoCard>

        {/* Catatan */}
        {booking.catatan ? (
          <InfoCard title="Catatan">
            <Text style={styles.noteText}>{booking.catatan}</Text>
          </InfoCard>
        ) : null}

        {/* Actions */}
        <View style={styles.actions}>
          {canPayBooking(booking.status) && (
            <Button
              title="Bayar Sekarang"
              onPress={() => navigation.navigate('Payment', { bookingId })}
              style={styles.actionBtn}
            />
          )}
          {booking.status === 'sedang_dititipkan' && (
            <Button
              title="Lihat Monitoring"
              variant="outline"
              onPress={() => navigation.getParent()?.getParent()?.navigate('MonitoringTab')}
              style={styles.actionBtn}
            />
          )}
          {canCancelBooking(booking.status) && (
            <Button
              title="Batalkan Booking"
              variant="danger"
              onPress={handleCancel}
              loading={loading}
              style={styles.actionBtn}
            />
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function InfoCard({ title, children }) {
  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{title}</Text>
      {children}
    </View>
  );
}

function InfoRow({ icon, label, value, highlight, valueColor }) {
  return (
    <View style={styles.infoRow}>
      <Ionicons name={icon} size={15} color={colors.neutral500} />
      <Text style={styles.infoLabel}>{label}</Text>
      <Text
        style={[
          styles.infoValue,
          highlight && styles.highlight,
          valueColor && { color: valueColor },
        ]}
      >
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { paddingBottom: 40 },
  foto: { width: '100%', height: 200, backgroundColor: colors.neutral100 },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral100,
  },
  waitingInfo: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  waitingText: { fontSize: 12, color: colors.warning },
  card: {
    backgroundColor: colors.white,
    margin: 16,
    marginBottom: 0,
    borderRadius: 16,
    padding: 16,
    ...shadows.sm,
  },
  cardTitle: { fontSize: 14, fontWeight: '700', color: colors.neutral900, marginBottom: 12 },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral100,
  },
  infoLabel: { flex: 1, fontSize: 13, color: colors.neutral500 },
  infoValue: { fontSize: 13, fontWeight: '600', color: colors.neutral900, maxWidth: '50%', textAlign: 'right' },
  highlight: { color: colors.primary, fontSize: 15 },
  noteText: { fontSize: 13, color: colors.neutral700, lineHeight: 20 },
  actions: { padding: 16, gap: 10 },
  actionBtn: {},
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyText: { color: colors.neutral500 },
});

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  Alert,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../../context/AppContext';
import Header from '../../components/Header';
import StatusBadge from '../../components/StatusBadge';
import Button from '../../components/Button';
import { colors, shadows } from '../../theme/colors';
import { MOTOR_PLACEHOLDER_IMAGES, LOKASI_OPTIONS } from '../../data/dummyData';
import {
  formatDate,
  formatCurrency,
  calculateDuration,
  getPaymentMethodLabel,
} from '../../utils/helpers';

export default function BookingDetailPengelolaScreen({ navigation, route }) {
  const { bookingId } = route.params;
  const { getBookingById, updateBooking } = useApp();
  const booking = getBookingById(bookingId);

  const [loading, setLoading] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(booking?.lokasi || LOKASI_OPTIONS[0]);
  const [showSlotModal, setShowSlotModal] = useState(false);

  if (!booking) {
    return (
      <SafeAreaView style={styles.safe}>
        <Header title="Detail Booking" showBack onBack={() => navigation.goBack()} />
        <View style={styles.empty}>
          <Text style={styles.emptyText}>Data booking tidak ditemukan.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const duration = calculateDuration(booking.tanggalMasuk, booking.tanggalKeluar);
  const fotoUri = MOTOR_PLACEHOLDER_IMAGES[booking.fotoIndex ?? 0];

  const handleConfirm = () => {
    Alert.alert(
      'Konfirmasi Booking',
      `Konfirmasi booking untuk motor ${booking.nomorPolisi} dengan penempatan di ${selectedSlot}?`,
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Konfirmasi',
          onPress: () => {
            setLoading(true);
            setTimeout(() => {
              updateBooking(bookingId, {
                status: 'dikonfirmasi',
                lokasi: selectedSlot,
              });
              setLoading(false);
              Alert.alert('Sukses', 'Booking berhasil dikonfirmasi dan lokasi slot telah ditentukan.');
            }, 600);
          },
        },
      ]
    );
  };

  const handleReject = () => {
    Alert.alert(
      'Tolak Booking',
      'Apakah Anda yakin ingin menolak pengajuan booking ini?',
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Ya, Tolak',
          style: 'destructive',
          onPress: () => {
            setLoading(true);
            setTimeout(() => {
              updateBooking(bookingId, { status: 'ditolak' });
              setLoading(false);
              Alert.alert('Booking Ditolak', 'Status booking telah diubah menjadi Ditolak.');
            }, 600);
          },
        },
      ]
    );
  };

  const handleFinishPenitipan = () => {
    Alert.alert(
      'Selesaikan Penitipan',
      `Tandai bahwa motor ${booking.nomorPolisi} telah diambil oleh pemilik?`,
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Selesai',
          onPress: () => {
            setLoading(true);
            setTimeout(() => {
              updateBooking(bookingId, { status: 'selesai' });
              setLoading(false);
              Alert.alert('Berhasil', 'Penitipan motor ini telah diselesaikan.');
            }, 600);
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <Header
        title="Detail Booking Customer"
        showBack
        onBack={() => navigation.goBack()}
      />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Foto Motor */}
        <Image source={{ uri: fotoUri }} style={styles.foto} resizeMode="cover" />

        {/* Status Bar */}
        <View style={styles.statusBar}>
          <View>
            <Text style={styles.orderId}>ID: #{booking.id.toUpperCase()}</Text>
            <Text style={styles.orderDate}>Dibuat pada {formatDate(booking.createdAt)}</Text>
          </View>
          <StatusBadge status={booking.status} />
        </View>

        {/* Info Pemilik */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Data Pemilik Motor</Text>
          <InfoRow icon="person-outline" label="Nama Customer" value={booking.customerName} />
          <InfoRow icon="call-outline" label="Nomor Telepon" value={booking.customerPhone} />
        </View>

        {/* Info Motor */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Data Kendaraan</Text>
          <InfoRow icon="car-outline" label="Nomor Polisi" value={booking.nomorPolisi} highlight />
          <InfoRow icon="bicycle-outline" label="Merek / Tipe" value={booking.merek} />
          <InfoRow icon="color-palette-outline" label="Warna" value={booking.warna} />
        </View>

        {/* Info Jadwal & Biaya */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Jadwal & Pembayaran</Text>
          <InfoRow icon="calendar-outline" label="Tanggal Masuk" value={formatDate(booking.tanggalMasuk)} />
          <InfoRow icon="calendar-outline" label="Tanggal Keluar" value={formatDate(booking.tanggalKeluar)} />
          <InfoRow icon="time-outline" label="Durasi" value={`${duration} hari`} />
          <InfoRow icon="pricetag-outline" label="Total Biaya" value={formatCurrency(booking.totalBiaya)} highlight />
          <InfoRow
            icon="card-outline"
            label="Metode Bayar"
            value={getPaymentMethodLabel(booking.metodePembayaran)}
          />
          <InfoRow
            icon="wallet-outline"
            label="Status Bayar"
            value={
              ['pembayaran_berhasil', 'sedang_dititipkan', 'selesai'].includes(booking.status)
                ? 'Lunas'
                : 'Belum Lunas'
            }
            valueColor={
              ['pembayaran_berhasil', 'sedang_dititipkan', 'selesai'].includes(booking.status)
                ? colors.secondary
                : colors.warning
            }
          />
        </View>

        {/* Penentuan Lokasi Slot */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Lokasi Penyimpanan Motor</Text>
          {booking.status === 'menunggu_konfirmasi' ? (
            <View>
              <Text style={styles.slotDesc}>
                Pilih slot penyimpanan sebelum menyetujui booking ini:
              </Text>
              <TouchableOpacity
                style={styles.slotSelector}
                onPress={() => setShowSlotModal(true)}
              >
                <Ionicons name="location-outline" size={20} color={colors.primary} />
                <Text style={styles.slotSelectorText}>{selectedSlot}</Text>
                <Ionicons name="chevron-down" size={18} color={colors.neutral500} />
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.confirmedSlotRow}>
              <Ionicons name="location" size={20} color={colors.primary} />
              <Text style={styles.confirmedSlotText}>
                {booking.lokasi || 'Belum ditentukan'}
              </Text>
            </View>
          )}
        </View>

        {/* Aksi Berdasarkan Status */}
        <View style={styles.actions}>
          {booking.status === 'menunggu_konfirmasi' && (
            <>
              <Button
                title="Konfirmasi & Tentukan Slot"
                onPress={handleConfirm}
                loading={loading}
                style={styles.actionBtn}
              />
              <Button
                title="Tolak Pengajuan"
                variant="danger"
                onPress={handleReject}
                loading={loading}
                style={styles.actionBtn}
              />
            </>
          )}

          {booking.status === 'sedang_dititipkan' && (
            <>
              <Button
                title="Update Laporan Monitoring"
                onPress={() =>
                  navigation.navigate('MotorTab', {
                    screen: 'MonitoringForm',
                    params: { bookingId: booking.id },
                  })
                }
                style={styles.actionBtn}
              />
              <Button
                title="Tandai Penitipan Selesai"
                variant="outline"
                onPress={handleFinishPenitipan}
                loading={loading}
                style={styles.actionBtn}
              />
            </>
          )}
        </View>
      </ScrollView>

      {/* Modal Pemilihan Slot */}
      <Modal visible={showSlotModal} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Pilih Area Penyimpanan</Text>
            {LOKASI_OPTIONS.map((slot) => (
              <TouchableOpacity
                key={slot}
                style={[
                  styles.slotOption,
                  selectedSlot === slot && styles.slotOptionSelected,
                ]}
                onPress={() => {
                  setSelectedSlot(slot);
                  setShowSlotModal(false);
                }}
              >
                <Ionicons
                  name={selectedSlot === slot ? 'radio-button-on' : 'radio-button-off'}
                  size={18}
                  color={selectedSlot === slot ? colors.primary : colors.neutral300}
                />
                <Text
                  style={[
                    styles.slotOptionText,
                    selectedSlot === slot && styles.slotOptionTextSelected,
                  ]}
                >
                  {slot}
                </Text>
              </TouchableOpacity>
            ))}
            <Button
              title="Tutup"
              variant="neutral"
              onPress={() => setShowSlotModal(false)}
              style={{ marginTop: 12 }}
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
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
  statusBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral100,
  },
  orderId: { fontSize: 13, fontWeight: '700', color: colors.neutral900 },
  orderDate: { fontSize: 11, color: colors.neutral500, marginTop: 2 },
  card: {
    backgroundColor: colors.white,
    marginHorizontal: 16,
    marginTop: 12,
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
  infoValue: { fontSize: 13, fontWeight: '600', color: colors.neutral900, textAlign: 'right' },
  highlight: { color: colors.primary, fontSize: 15 },
  slotDesc: { fontSize: 12, color: colors.neutral500, marginBottom: 8 },
  slotSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.primaryLight,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  slotSelectorText: { flex: 1, fontSize: 14, fontWeight: '700', color: colors.primary },
  confirmedSlotRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 4 },
  confirmedSlotText: { fontSize: 15, fontWeight: '700', color: colors.primary },
  actions: { padding: 16, gap: 10 },
  actionBtn: {},
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyText: { color: colors.neutral500 },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 24,
  },
  modalCard: {
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: 20,
  },
  modalTitle: { fontSize: 16, fontWeight: '700', color: colors.neutral900, marginBottom: 16 },
  slotOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral100,
  },
  slotOptionSelected: { backgroundColor: colors.primaryLight, borderRadius: 8, paddingHorizontal: 8 },
  slotOptionText: { fontSize: 14, color: colors.neutral700 },
  slotOptionTextSelected: { fontWeight: '700', color: colors.primary },
});

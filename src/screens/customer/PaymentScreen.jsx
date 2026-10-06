import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Modal,
  Animated,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Speech from 'expo-speech';
import { useApp } from '../../context/AppContext';
import Header from '../../components/Header';
import Button from '../../components/Button';
import PaymentMethodCard from '../../components/PaymentMethodCard';
import { colors, shadows } from '../../theme/colors';
import {
  formatCurrency,
  formatDate,
  calculateDuration,
  generatePaymentSuccessTTS,
} from '../../utils/helpers';

export default function PaymentScreen({ navigation, route }) {
  const { bookingId } = route.params;
  const { getBookingById, updateBooking } = useApp();
  const booking = getBookingById(bookingId);

  const [selectedMethod, setSelectedMethod] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const scaleAnim = React.useRef(new Animated.Value(0)).current;

  if (!booking) return null;

  const duration = calculateDuration(booking.tanggalMasuk, booking.tanggalKeluar);

  const handlePay = () => {
    if (!selectedMethod) {
      alert('Pilih metode pembayaran terlebih dahulu.');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      updateBooking(bookingId, {
        status: 'sedang_dititipkan',
        metodePembayaran: selectedMethod,
      });
      setLoading(false);
      setShowSuccess(true);
      // Animate
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 50,
        friction: 7,
      }).start();
      // TTS
      const updatedBooking = { ...booking, metodePembayaran: selectedMethod, status: 'sedang_dititipkan' };
      const ttsText = generatePaymentSuccessTTS(updatedBooking);
      Speech.speak(ttsText, { language: 'id-ID', pitch: 1.0, rate: 0.88 });
    }, 1500);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <Header title="Pembayaran" showBack onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Summary Card */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Ringkasan Penitipan</Text>
          <SummaryRow label="Motor" value={`${booking.nomorPolisi} · ${booking.merek}`} />
          <SummaryRow label="Pemilik" value={booking.customerName} />
          <SummaryRow label="Tanggal Masuk" value={formatDate(booking.tanggalMasuk)} />
          <SummaryRow label="Tanggal Keluar" value={formatDate(booking.tanggalKeluar)} />
          <SummaryRow label="Durasi" value={`${duration} hari`} />
          {booking.lokasi && <SummaryRow label="Lokasi" value={booking.lokasi} />}
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total Biaya</Text>
            <Text style={styles.totalValue}>{formatCurrency(booking.totalBiaya)}</Text>
          </View>
        </View>

        {/* Rate info */}
        <View style={styles.rateInfo}>
          <Ionicons name="information-circle-outline" size={14} color={colors.primary} />
          <Text style={styles.rateText}>
            Tarif Rp 30.000/hari × {duration} hari = {formatCurrency(booking.totalBiaya)}
          </Text>
        </View>

        {/* Payment Methods */}
        <Text style={styles.sectionTitle}>Pilih Metode Pembayaran</Text>
        {['tunai', 'qris', 'transfer'].map((m) => (
          <PaymentMethodCard
            key={m}
            method={m}
            selected={selectedMethod === m}
            onSelect={setSelectedMethod}
          />
        ))}

        <Button
          title={loading ? 'Memproses...' : 'Bayar Sekarang'}
          onPress={handlePay}
          loading={loading}
          disabled={!selectedMethod}
          style={styles.payBtn}
          size="lg"
        />
      </ScrollView>

      {/* Success Modal */}
      <Modal visible={showSuccess} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <Animated.View style={[styles.successCard, { transform: [{ scale: scaleAnim }] }]}>
            <View style={styles.successIcon}>
              <Ionicons name="checkmark-circle" size={64} color={colors.secondary} />
            </View>
            <Text style={styles.successTitle}>Pembayaran Berhasil!</Text>
            <Text style={styles.successDesc}>
              Motor {booking.nomorPolisi} telah terdaftar untuk penitipan.
            </Text>
            <View style={styles.successMeta}>
              <Ionicons name="location-outline" size={14} color={colors.neutral500} />
              <Text style={styles.successMetaText}>{booking.lokasi || 'Lokasi akan dikonfirmasi'}</Text>
            </View>

            <Button
              title="Lihat Status Penitipan"
              onPress={() => {
                setShowSuccess(false);
                navigation.reset({
                  index: 0,
                  routes: [{ name: 'Home' }],
                });
              }}
              style={styles.successBtn}
            />
          </Animated.View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function SummaryRow({ label, value }) {
  return (
    <View style={styles.summaryRow}>
      <Text style={styles.summaryLabel}>{label}</Text>
      <Text style={styles.summaryValue} numberOfLines={1}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { padding: 16, paddingBottom: 40 },
  summaryCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
    ...shadows.sm,
  },
  summaryTitle: { fontSize: 15, fontWeight: '700', color: colors.neutral900, marginBottom: 12 },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 7,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral100,
  },
  summaryLabel: { fontSize: 13, color: colors.neutral500 },
  summaryValue: { fontSize: 13, fontWeight: '600', color: colors.neutral900, maxWidth: '60%', textAlign: 'right' },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 12,
    marginTop: 4,
  },
  totalLabel: { fontSize: 15, fontWeight: '700', color: colors.neutral900 },
  totalValue: { fontSize: 18, fontWeight: '800', color: colors.primary },
  rateInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.primaryLight,
    borderRadius: 10,
    padding: 10,
    marginBottom: 20,
  },
  rateText: { fontSize: 12, color: colors.primary },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: colors.neutral900, marginBottom: 12 },
  payBtn: { marginTop: 8 },
  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  successCard: {
    backgroundColor: colors.white,
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    width: '100%',
  },
  successIcon: { marginBottom: 16 },
  successTitle: { fontSize: 22, fontWeight: '800', color: colors.neutral900, marginBottom: 8 },
  successDesc: { fontSize: 14, color: colors.neutral500, textAlign: 'center', lineHeight: 20, marginBottom: 12 },
  successMeta: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 24 },
  successMetaText: { fontSize: 13, color: colors.neutral500 },
  successBtn: { width: '100%' },
});

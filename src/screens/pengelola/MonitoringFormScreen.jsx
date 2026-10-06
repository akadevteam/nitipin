import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../../context/AppContext';
import Header from '../../components/Header';
import Input from '../../components/Input';
import Button from '../../components/Button';
import PhotoUploader from '../../components/PhotoUploader';
import { colors, shadows } from '../../theme/colors';
import {
  MOTOR_PLACEHOLDER_IMAGES,
  KONDISI_OPTIONS,
  BENSIN_OPTIONS,
  LOKASI_OPTIONS,
} from '../../data/dummyData';

export default function MonitoringFormScreen({ navigation, route }) {
  const { bookingId } = route.params || {};
  const { bookings, getBookingById, getMonitoringByBookingId, addOrUpdateMonitoring } = useApp();

  // If no bookingId passed, pick first active motor or first booking
  const selectedBooking = bookingId
    ? getBookingById(bookingId)
    : bookings.find((b) => b.status === 'sedang_dititipkan') || bookings[0];

  const existingMonitoring = selectedBooking ? getMonitoringByBookingId(selectedBooking.id) : null;

  const [kondisiKeseluruhan, setKondisiKeseluruhan] = useState(
    existingMonitoring?.kondisiKeseluruhan || 'Baik'
  );
  const [bensin, setBensin] = useState(existingMonitoring?.bensin || '3/4');
  const [kondisiBody, setKondisiBody] = useState(
    existingMonitoring?.kondisiBody || 'Tidak ada kerusakan'
  );
  const [kondisiBan, setKondisiBan] = useState(existingMonitoring?.kondisiBan || 'Baik');
  const [catatan, setCatatan] = useState(
    existingMonitoring?.catatan || 'Motor dalam kondisi baik selama proses penitipan.'
  );
  const [lokasi, setLokasi] = useState(
    existingMonitoring?.lokasi || selectedBooking?.lokasi || LOKASI_OPTIONS[0]
  );
  const [loading, setLoading] = useState(false);

  if (!selectedBooking) {
    return (
      <SafeAreaView style={styles.safe}>
        <Header title="Laporan Monitoring" showBack onBack={() => navigation.goBack()} />
        <View style={styles.empty}>
          <Text style={styles.emptyText}>Tidak ada motor aktif untuk dimonitor.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const fotoUri = MOTOR_PLACEHOLDER_IMAGES[selectedBooking.fotoIndex ?? 0];

  const handleSave = () => {
    setLoading(true);
    setTimeout(() => {
      addOrUpdateMonitoring({
        bookingId: selectedBooking.id,
        tanggalMonitoring: new Date().toISOString().split('T')[0],
        lokasi,
        kondisiKeseluruhan,
        bensin,
        kondisiBody,
        kondisiBan,
        catatan,
        fotoIndex: selectedBooking.fotoIndex ?? 0,
      });
      setLoading(false);
      Alert.alert(
        'Laporan Tersimpan',
        'Data monitoring dan kondisi motor berhasil diperbarui dan kini dapat dilihat oleh customer.',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    }, 600);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <Header
        title="Input Laporan Monitoring"
        subtitle={selectedBooking.nomorPolisi}
        showBack
        onBack={() => navigation.goBack()}
      />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Motor Info Banner */}
          <View style={styles.bannerCard}>
            <Image source={{ uri: fotoUri }} style={styles.bannerFoto} />
            <View style={styles.bannerInfo}>
              <Text style={styles.bannerNopol}>{selectedBooking.nomorPolisi}</Text>
              <Text style={styles.bannerMerek}>{selectedBooking.merek} · {selectedBooking.warna}</Text>
              <Text style={styles.bannerOwner}>Pemilik: {selectedBooking.customerName}</Text>
            </View>
          </View>

          {/* Lokasi Penyimpanan */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionLabel}>Lokasi Penyimpanan</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
              {LOKASI_OPTIONS.map((slot) => (
                <TouchableOpacity
                  key={slot}
                  style={[styles.chip, lokasi === slot && styles.chipActive]}
                  onPress={() => setLokasi(slot)}
                >
                  <Text style={[styles.chipText, lokasi === slot && styles.chipTextActive]}>
                    {slot.replace('Area Penyimpanan ', '')}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Kondisi Keseluruhan */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionLabel}>Kondisi Keseluruhan</Text>
            <View style={styles.chipRow}>
              {KONDISI_OPTIONS.map((k) => (
                <TouchableOpacity
                  key={k}
                  style={[
                    styles.chip,
                    kondisiKeseluruhan === k && styles.chipActiveSecondary,
                  ]}
                  onPress={() => setKondisiKeseluruhan(k)}
                >
                  <Text
                    style={[
                      styles.chipText,
                      kondisiKeseluruhan === k && styles.chipTextActiveSecondary,
                    ]}
                  >
                    {k}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Kondisi Bensin */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionLabel}>Level Bensin</Text>
            <View style={styles.chipRow}>
              {BENSIN_OPTIONS.map((b) => (
                <TouchableOpacity
                  key={b}
                  style={[styles.chip, bensin === b && styles.chipActiveWarning]}
                  onPress={() => setBensin(b)}
                >
                  <Text
                    style={[
                      styles.chipText,
                      bensin === b && styles.chipTextActiveWarning,
                    ]}
                  >
                    {b}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Kondisi Body & Ban */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionLabel}>Detail Fisik Kendaraan</Text>
            <Input
              label="Kondisi Body"
              value={kondisiBody}
              onChangeText={setKondisiBody}
              placeholder="Contoh: Tidak ada lecet baru"
              leftIcon="construct-outline"
            />
            <Input
              label="Kondisi Ban"
              value={kondisiBan}
              onChangeText={setKondisiBan}
              placeholder="Contoh: Tekanan angin normal, baik"
              leftIcon="ellipse-outline"
            />
            <Input
              label="Catatan Tambahan"
              value={catatan}
              onChangeText={setCatatan}
              placeholder="Catatan lain perihal barang bawaan / kondisi khusus"
              multiline
              numberOfLines={3}
              leftIcon="document-text-outline"
            />
          </View>

          <Button
            title="Simpan & Publikasikan Laporan"
            onPress={handleSave}
            loading={loading}
            size="lg"
            style={styles.saveBtn}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
  content: { padding: 16, paddingBottom: 40 },
  bannerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 12,
    gap: 12,
    marginBottom: 16,
    ...shadows.sm,
  },
  bannerFoto: { width: 70, height: 70, borderRadius: 12, backgroundColor: colors.neutral100 },
  bannerInfo: { flex: 1 },
  bannerNopol: { fontSize: 16, fontWeight: '800', color: colors.neutral900 },
  bannerMerek: { fontSize: 12, color: colors.neutral500, marginTop: 2 },
  bannerOwner: { fontSize: 12, color: colors.primary, marginTop: 2, fontWeight: '600' },
  sectionCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    ...shadows.sm,
  },
  sectionLabel: { fontSize: 13, fontWeight: '700', color: colors.neutral900, marginBottom: 10 },
  chipScroll: { marginHorizontal: -4 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: colors.neutral100,
    marginRight: 6,
    marginBottom: 6,
  },
  chipActive: { backgroundColor: colors.primary },
  chipActiveSecondary: { backgroundColor: colors.secondary },
  chipActiveWarning: { backgroundColor: colors.warning },
  chipText: { fontSize: 13, fontWeight: '600', color: colors.neutral700 },
  chipTextActive: { color: colors.white },
  chipTextActiveSecondary: { color: colors.white },
  chipTextActiveWarning: { color: colors.white },
  saveBtn: { marginTop: 8 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyText: { color: colors.neutral500 },
});

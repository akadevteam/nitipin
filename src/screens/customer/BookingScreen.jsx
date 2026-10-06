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
import { colors } from '../../theme/colors';
import { MOTOR_PLACEHOLDER_IMAGES } from '../../data/dummyData';

export default function BookingScreen({ navigation }) {
  const { currentUser, addBooking } = useApp();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    nomorPolisi: '',
    merek: '',
    warna: '',
    tanggalMasuk: new Date().toISOString().split('T')[0],
    tanggalKeluar: '',
    catatan: '',
    fotoUri: null,
  });
  const [errors, setErrors] = useState({});

  const set = (key) => (val) => setForm((f) => ({ ...f, [key]: val }));

  const validate = () => {
    const e = {};
    if (!form.nomorPolisi.trim()) e.nomorPolisi = 'Nomor polisi wajib diisi';
    if (!form.merek.trim()) e.merek = 'Merek/tipe motor wajib diisi';
    if (!form.warna.trim()) e.warna = 'Warna motor wajib diisi';
    if (!form.tanggalMasuk) e.tanggalMasuk = 'Tanggal masuk wajib diisi';
    if (!form.tanggalKeluar) e.tanggalKeluar = 'Tanggal keluar wajib diisi';
    else if (form.tanggalKeluar <= form.tanggalMasuk)
      e.tanggalKeluar = 'Tanggal keluar harus setelah tanggal masuk';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    Alert.alert(
      'Konfirmasi Booking',
      `Ajukan booking untuk motor ${form.nomorPolisi}?`,
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Ajukan',
          onPress: () => {
            setLoading(true);
            setTimeout(() => {
              const newBooking = addBooking({
                ...form,
                nomorPolisi: form.nomorPolisi.toUpperCase().trim(),
                customerName: currentUser.name,
                fotoUri: form.fotoUri || MOTOR_PLACEHOLDER_IMAGES[0],
                fotoIndex: 0,
              });
              setLoading(false);
              navigation.replace('BookingDetail', { bookingId: newBooking.id });
            }, 1000);
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <Header
        title="Booking Penitipan"
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
          {/* Foto Motor Uploader */}
          <PhotoUploader
            photoUri={form.fotoUri}
            onPhotoSelected={(uri) => set('fotoUri')(uri)}
            label="Foto Kendaraan"
            subtitle="Unggah foto motor Anda (dari kamera atau galeri HP)"
          />

          {/* Info pemilik */}
          <View style={styles.infoBox}>
            <Ionicons name="person-circle-outline" size={16} color={colors.primary} />
            <Text style={styles.infoText}>Pemilik: <Text style={{ fontWeight: '700' }}>{currentUser.name}</Text></Text>
          </View>

          {/* Form */}
          <Input
            label="Nomor Polisi"
            value={form.nomorPolisi}
            onChangeText={set('nomorPolisi')}
            placeholder="Contoh: B 5069 BLP"
            autoCapitalize="characters"
            leftIcon="car-outline"
            error={errors.nomorPolisi}
          />
          <Input
            label="Merek / Tipe Motor"
            value={form.merek}
            onChangeText={set('merek')}
            placeholder="Contoh: Honda Vario 160"
            leftIcon="bicycle-outline"
            error={errors.merek}
          />
          <Input
            label="Warna Motor"
            value={form.warna}
            onChangeText={set('warna')}
            placeholder="Contoh: Hitam"
            leftIcon="color-palette-outline"
            error={errors.warna}
          />

          {/* Tanggal */}
          <View style={styles.dateRow}>
            <View style={styles.dateHalf}>
              <Input
                label="Tanggal Masuk"
                value={form.tanggalMasuk}
                onChangeText={set('tanggalMasuk')}
                placeholder="YYYY-MM-DD"
                leftIcon="calendar-outline"
                error={errors.tanggalMasuk}
                keyboardType="numbers-and-punctuation"
              />
            </View>
            <View style={styles.dateHalf}>
              <Input
                label="Tanggal Keluar"
                value={form.tanggalKeluar}
                onChangeText={set('tanggalKeluar')}
                placeholder="YYYY-MM-DD"
                leftIcon="calendar-outline"
                error={errors.tanggalKeluar}
                keyboardType="numbers-and-punctuation"
              />
            </View>
          </View>

          <Input
            label="Catatan (opsional)"
            value={form.catatan}
            onChangeText={set('catatan')}
            placeholder="Kondisi khusus, permintaan, dll."
            multiline
            numberOfLines={3}
            leftIcon="document-text-outline"
          />

          {/* Info lokasi */}
          <View style={styles.infoBoxYellow}>
            <Ionicons name="location-outline" size={16} color={colors.warning} />
            <Text style={styles.infoTextYellow}>
              Lokasi penyimpanan akan ditentukan oleh pengelola setelah booking dikonfirmasi.
            </Text>
          </View>

          <Button
            title="Ajukan Booking"
            onPress={handleSubmit}
            loading={loading}
            style={styles.submitBtn}
            size="lg"
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
  fotoSection: { marginBottom: 16 },
  fotoLabel: { fontSize: 13, fontWeight: '600', color: colors.neutral700, marginBottom: 8 },
  fotoContainer: { borderRadius: 14, overflow: 'hidden', position: 'relative' },
  fotoPreview: { width: '100%', height: 180, backgroundColor: colors.neutral100 },
  fotoBadge: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  fotoBadgeText: { color: colors.white, fontSize: 11 },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.primaryLight,
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
  },
  infoText: { fontSize: 13, color: colors.primary },
  infoBoxYellow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'flex-start',
    backgroundColor: colors.warningLight,
    borderRadius: 10,
    padding: 12,
    marginBottom: 20,
  },
  infoTextYellow: { flex: 1, fontSize: 12, color: '#92400E', lineHeight: 18 },
  dateRow: { flexDirection: 'row', gap: 12 },
  dateHalf: { flex: 1 },
  submitBtn: { marginTop: 4 },
});

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  Linking,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import Header from '../components/Header';
import { colors, shadows } from '../theme/colors';

export default function PermissionsScreen({ navigation }) {
  const [cameraGranted, setCameraGranted] = useState(false);
  const [mediaGranted, setMediaGranted] = useState(false);
  const [loading, setLoading] = useState(true);

  // Periksa status izin saat layar dibuka
  const checkPermissions = async () => {
    try {
      setLoading(true);
      const cam = await ImagePicker.getCameraPermissionsAsync();
      const media = await ImagePicker.getMediaLibraryPermissionsAsync();

      setCameraGranted(cam.granted);
      setMediaGranted(media.granted);
    } catch (e) {
      console.log('Error checking permissions:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkPermissions();
  }, []);

  // Request Izin Sensor Kamera
  const requestCameraPermission = async () => {
    try {
      const result = await ImagePicker.requestCameraPermissionsAsync();
      setCameraGranted(result.granted);

      if (result.granted) {
        Alert.alert('Izin Diberikan ✅', 'Sensor kamera sekarang aktif dan siap digunakan dalam aplikasi.');
      } else {
        if (!result.canAskAgain) {
          showOpenSettingsAlert('Kamera');
        } else {
          Alert.alert('Izin Ditolak ❌', 'Anda menolak akses ke sensor kamera.');
        }
      }
    } catch (err) {
      Alert.alert('Error', err.message);
    }
  };

  // Request Izin Media / Galeri
  const requestMediaPermission = async () => {
    try {
      const result = await ImagePicker.requestMediaLibraryPermissionsAsync();
      setMediaGranted(result.granted);

      if (result.granted) {
        Alert.alert('Izin Diberikan ✅', 'Akses media foto galeri diaktifkan.');
      } else {
        if (!result.canAskAgain) {
          showOpenSettingsAlert('Media / Galeri');
        } else {
          Alert.alert('Izin Ditolak ❌', 'Anda menolak akses penyimpanan media galeri.');
        }
      }
    } catch (err) {
      Alert.alert('Error', err.message);
    }
  };

  const showOpenSettingsAlert = (feature) => {
    Alert.alert(
      `Izin ${feature} Dinonaktifkan`,
      `Izin telah ditolak secara permanen oleh sistem. Anda dapat mengaktifkannya secara manual melalui menu Pengaturan HP.`,
      [
        { text: 'Batal', style: 'cancel' },
        { text: 'Buka Pengaturan', onPress: () => Linking.openSettings() },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <Header
        title="Izin Sensor & Perangkat"
        subtitle="Manajemen Runtime Permission"
        showBack
        onBack={() => navigation.goBack()}
      />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Banner Edukasi Sesuai Materi Week 7 */}
        <View style={styles.bannerCard}>
          <View style={styles.bannerIcon}>
            <Ionicons name="hardware-chip-outline" size={32} color={colors.primary} />
          </View>
          <View style={styles.bannerTextWrap}>
            <Text style={styles.bannerTitle}>Sensor & Privasi Perangkat</Text>
            <Text style={styles.bannerDesc}>
              Aplikasi NITIPIN memerlukan izin (runtime permission) untuk mengakses sensor hardware
              sesuai kebutuhan fitur.
            </Text>
          </View>
        </View>

        {/* Status Sensor Kamera */}
        <Text style={styles.sectionTitle}>Daftar Sensor Perangkat</Text>

        <View style={[styles.sensorCard, shadows.sm]}>
          <View style={styles.sensorHeader}>
            <View style={[styles.sensorIconBox, { backgroundColor: '#EBF5FF' }]}>
              <Ionicons name="camera" size={24} color={colors.primary} />
            </View>
            <View style={styles.sensorInfo}>
              <View style={styles.titleRow}>
                <Text style={styles.sensorName}>Sensor Kamera</Text>
                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: cameraGranted ? colors.secondaryLight : colors.dangerLight },
                  ]}
                >
                  <Text
                    style={[
                      styles.statusBadgeText,
                      { color: cameraGranted ? colors.secondary : colors.danger },
                    ]}
                  >
                    {cameraGranted ? 'Diizinkan' : 'Ditolak'}
                  </Text>
                </View>
              </View>
              <Text style={styles.permissionKey}>android.permission.CAMERA</Text>
            </View>
          </View>

          <Text style={styles.sensorDesc}>
            Digunakan saat Customer melakukan booking motor dan Pengelola mendokumentasikan kondisi fisik motor secara live.
          </Text>

          <View style={styles.divider} />

          <View style={styles.actionRow}>
            <Text style={styles.actionLabel}>Status Akses Sensor:</Text>
            <Switch
              value={cameraGranted}
              onValueChange={requestCameraPermission}
              trackColor={{ false: colors.neutral200, true: colors.primary }}
              thumbColor={colors.white}
            />
          </View>
        </View>

        {/* Status Akses Galeri / Media */}
        <View style={[styles.sensorCard, shadows.sm]}>
          <View style={styles.sensorHeader}>
            <View style={[styles.sensorIconBox, { backgroundColor: '#DEF7EC' }]}>
              <Ionicons name="images" size={24} color={colors.secondary} />
            </View>
            <View style={styles.sensorInfo}>
              <View style={styles.titleRow}>
                <Text style={styles.sensorName}>Media & Galeri</Text>
                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: mediaGranted ? colors.secondaryLight : colors.dangerLight },
                  ]}
                >
                  <Text
                    style={[
                      styles.statusBadgeText,
                      { color: mediaGranted ? colors.secondary : colors.danger },
                    ]}
                  >
                    {mediaGranted ? 'Diizinkan' : 'Ditolak'}
                  </Text>
                </View>
              </View>
              <Text style={styles.permissionKey}>READ_MEDIA_IMAGES / STORAGE</Text>
            </View>
          </View>

          <Text style={styles.sensorDesc}>
            Digunakan untuk memilih foto kendaraan atau dokumen STNK yang tersimpan di memori HP.
          </Text>

          <View style={styles.divider} />

          <View style={styles.actionRow}>
            <Text style={styles.actionLabel}>Status Akses Media:</Text>
            <Switch
              value={mediaGranted}
              onValueChange={requestMediaPermission}
              trackColor={{ false: colors.neutral200, true: colors.secondary }}
              thumbColor={colors.white}
            />
          </View>
        </View>

        {/* Best Practice Box (Sesuai Slide 5) */}
        <View style={styles.bestPracticeCard}>
          <Text style={styles.bpTitle}>🛡️ Praktik Terbaik Sensor & Privasi</Text>
          <View style={styles.bpItem}>
            <Ionicons name="checkmark-circle" size={16} color={colors.secondary} />
            <Text style={styles.bpText}>Izin diminta saat aplikasi dijalankan (Runtime Permission).</Text>
          </View>
          <View style={styles.bpItem}>
            <Ionicons name="checkmark-circle" size={16} color={colors.secondary} />
            <Text style={styles.bpText}>Aplikasi menjelaskan alasan izin sebelum sensor diakses.</Text>
          </View>
          <View style={styles.bpItem}>
            <Ionicons name="checkmark-circle" size={16} color={colors.secondary} />
            <Text style={styles.bpText}>Pengguna bebas menolak tanpa menyebabkan aplikasi crash.</Text>
          </View>
        </View>

        {/* Tombol Buka Pengaturan OS */}
        <TouchableOpacity
          style={styles.settingsBtn}
          onPress={() => Linking.openSettings()}
          activeOpacity={0.8}
        >
          <Ionicons name="settings-outline" size={18} color={colors.primary} />
          <Text style={styles.settingsBtnText}>Buka Pengaturan Aplikasi Sistem</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { padding: 16, paddingBottom: 40 },
  bannerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    ...shadows.sm,
  },
  bannerIcon: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bannerTextWrap: { flex: 1 },
  bannerTitle: { fontSize: 15, fontWeight: '800', color: colors.neutral900 },
  bannerDesc: { fontSize: 12, color: colors.neutral600, marginTop: 4, lineHeight: 18 },
  sectionTitle: { fontSize: 15, fontWeight: '800', color: colors.neutral900, marginBottom: 12 },
  sensorCard: {
    backgroundColor: colors.white,
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
  },
  sensorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  sensorIconBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sensorInfo: { flex: 1 },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sensorName: { fontSize: 15, fontWeight: '700', color: colors.neutral900 },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  permissionKey: {
    fontSize: 11,
    color: colors.neutral400,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    marginTop: 2,
  },
  sensorDesc: {
    fontSize: 13,
    color: colors.neutral600,
    lineHeight: 18,
    marginTop: 10,
  },
  divider: {
    height: 1,
    backgroundColor: colors.neutral100,
    marginVertical: 12,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  actionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.neutral700,
  },
  bestPracticeCard: {
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    borderRadius: 16,
    padding: 16,
    marginTop: 10,
    marginBottom: 20,
    gap: 8,
  },
  bpTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#166534',
    marginBottom: 4,
  },
  bpItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  bpText: {
    fontSize: 12,
    color: '#166534',
    flex: 1,
    lineHeight: 18,
  },
  settingsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.white,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  settingsBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary,
  },
});

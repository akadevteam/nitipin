import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Alert,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { colors, shadows } from '../theme/colors';
import { MOTOR_PLACEHOLDER_IMAGES } from '../data/dummyData';

export default function PhotoUploader({
  photoUri,
  onPhotoSelected,
  label = 'Foto Motor',
  subtitle = 'Ambil foto langsung dari kamera sensor atau galeri HP',
  style,
}) {
  const [modalVisible, setModalVisible] = useState(false);
  const [permissionDialogVisible, setPermissionDialogVisible] = useState(false);
  const [pendingAction, setPendingAction] = useState(null); // 'camera' | 'gallery'

  // Fungsi internal mengecek izin Kamera dengan dialog persetujuan (Runtime Permission Week 7)
  const handleRequestCamera = async () => {
    setModalVisible(false);

    // Cek status izin saat ini
    const status = await ImagePicker.getCameraPermissionsAsync();
    if (status.granted) {
      launchCameraDirectly();
      return;
    }

    // Jika belum diizinkan, tampilkan dialog persetujuan edukatif
    setPendingAction('camera');
    setPermissionDialogVisible(true);
  };

  // Fungsi internal mengecek izin Galeri dengan dialog persetujuan
  const handleRequestGallery = async () => {
    setModalVisible(false);

    const status = await ImagePicker.getMediaLibraryPermissionsAsync();
    if (status.granted) {
      launchGalleryDirectly();
      return;
    }

    setPendingAction('gallery');
    setPermissionDialogVisible(true);
  };

  // Eksekusi buka kamera setelah izin
  const launchCameraDirectly = async () => {
    try {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) {
        Alert.alert(
          'Izin Kamera Ditolak',
          'Aplikasi membutuhkan izin sensor kamera untuk mengambil foto kendaraan/kondisi motor. Anda dapat mengaktifkannya di pengaturan HP.'
        );
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        onPhotoSelected(result.assets[0].uri);
      }
    } catch (err) {
      console.error('Error opening camera:', err);
      Alert.alert('Gagal Mengakses Kamera', err.message);
    }
  };

  // Eksekusi buka galeri setelah izin
  const launchGalleryDirectly = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert(
          'Izin Galeri Ditolak',
          'Aplikasi membutuhkan izin untuk memilih foto kendaraan dari penyimpanan perangkat.'
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        onPhotoSelected(result.assets[0].uri);
      }
    } catch (err) {
      console.error('Error opening gallery:', err);
      Alert.alert('Gagal Membuka Galeri', err.message);
    }
  };

  const handleConfirmPermission = () => {
    setPermissionDialogVisible(false);
    if (pendingAction === 'camera') {
      launchCameraDirectly();
    } else if (pendingAction === 'gallery') {
      launchGalleryDirectly();
    }
    setPendingAction(null);
  };

  const handleDenyPermission = () => {
    setPermissionDialogVisible(false);
    setPendingAction(null);
    Alert.alert(
      'Akses Dibatalkan',
      'Anda membatalkan permintaan izin. Fitur kamera tidak dapat dijalankan tanpa izin pengguna.'
    );
  };

  // Preset foto motor
  const pickPreset = (uri) => {
    onPhotoSelected(uri);
    setModalVisible(false);
  };

  const removePhoto = () => {
    onPhotoSelected(null);
  };

  return (
    <View style={[styles.container, style]}>
      {label ? <Text style={styles.label}>{label}</Text> : null}

      {photoUri ? (
        // Preview Foto yang Terpilih
        <View style={[styles.previewContainer, shadows.sm]}>
          <Image source={{ uri: photoUri }} style={styles.previewImage} resizeMode="cover" />
          <View style={styles.previewOverlay}>
            <View style={styles.badgeSuccess}>
              <Ionicons name="checkmark-circle" size={14} color={colors.white} />
              <Text style={styles.badgeText}>Foto Terpilih</Text>
            </View>
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={styles.changeBtn}
                onPress={() => setModalVisible(true)}
                activeOpacity={0.8}
              >
                <Ionicons name="camera-reverse-outline" size={16} color={colors.primary} />
                <Text style={styles.changeBtnText}>Ganti</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.removeBtn}
                onPress={removePhoto}
                activeOpacity={0.8}
              >
                <Ionicons name="trash-outline" size={16} color={colors.danger} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      ) : (
        // Tombol Dropzone Belum Ada Foto
        <TouchableOpacity
          style={styles.dropzone}
          onPress={() => setModalVisible(true)}
          activeOpacity={0.7}
        >
          <View style={styles.iconCircle}>
            <Ionicons name="camera-outline" size={28} color={colors.primary} />
          </View>
          <Text style={styles.uploadPrompt}>Tambahkan Foto Kendaraan</Text>
          <Text style={styles.uploadSub}>{subtitle}</Text>
          <View style={styles.sensorBadge}>
            <Ionicons name="hardware-chip-outline" size={12} color={colors.primary} />
            <Text style={styles.sensorBadgeText}>Sensor Kamera Perangkat</Text>
          </View>
        </TouchableOpacity>
      )}

      {/* 1. MODAL PILIHAN SUMBER FOTO */}
      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalCard, shadows.lg]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Pilih Sumber Foto</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close-circle-outline" size={24} color={colors.neutral500} />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.optionBtn}
              onPress={handleRequestCamera}
              activeOpacity={0.7}
            >
              <View style={[styles.optionIcon, { backgroundColor: '#EBF5FF' }]}>
                <Ionicons name="camera" size={22} color={colors.primary} />
              </View>
              <View style={styles.optionTextWrap}>
                <Text style={styles.optionTitle}>Ambil Foto dengan Kamera</Text>
                <Text style={styles.optionDesc}>Mengakses sensor kamera perangkat Anda</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.neutral300} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.optionBtn}
              onPress={handleRequestGallery}
              activeOpacity={0.7}
            >
              <View style={[styles.optionIcon, { backgroundColor: '#DEF7EC' }]}>
                <Ionicons name="images" size={22} color={colors.secondary} />
              </View>
              <View style={styles.optionTextWrap}>
                <Text style={styles.optionTitle}>Pilih dari Galeri Foto</Text>
                <Text style={styles.optionDesc}>Pilih gambar yang tersimpan di HP</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.neutral300} />
            </TouchableOpacity>

            <View style={styles.divider} />
            <Text style={styles.presetLabel}>Atau pilih dari foto contoh motor:</Text>
            <View style={styles.presetRow}>
              {MOTOR_PLACEHOLDER_IMAGES.map((imgUri, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={styles.presetThumbnailWrap}
                  onPress={() => pickPreset(imgUri)}
                  activeOpacity={0.8}
                >
                  <Image source={{ uri: imgUri }} style={styles.presetThumbnail} />
                  <View style={styles.presetBadge}>
                    <Text style={styles.presetBadgeText}>Contoh #{idx + 1}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.cancelBtnText}>Batal</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* 2. MODAL DIALOG IZIN SENSOR PERANGKAT (Runtime Permission) */}
      <Modal visible={permissionDialogVisible} transparent animationType="slide">
        <View style={styles.modalBackdrop}>
          <View style={[styles.permDialogCard, shadows.lg]}>
            <View style={styles.permIconContainer}>
              <Ionicons
                name={pendingAction === 'camera' ? 'camera' : 'images'}
                size={40}
                color={colors.primary}
              />
            </View>

            <Text style={styles.permTitle}>
              {pendingAction === 'camera'
                ? 'Izinkan Akses Sensor Kamera?'
                : 'Izinkan Akses Galeri & Media?'}
            </Text>

            <Text style={styles.permDescription}>
              {pendingAction === 'camera'
                ? 'Aplikasi NITIPIN memerlukan izin sensor kamera untuk mengambil foto dokumentasi kendaraan secara langsung saat booking dan pemeriksaan kondisi fisik motor.'
                : 'Aplikasi NITIPIN memerlukan izin media penyimpanan untuk memilih foto dokumen kendaraan dari perangkat Anda.'}
            </Text>

            <View style={styles.permBestPracticeBox}>
              <View style={styles.permCheckRow}>
                <Ionicons name="shield-checkmark" size={16} color={colors.secondary} />
                <Text style={styles.permCheckText}>Data foto hanya digunakan untuk verifikasi penitipan</Text>
              </View>
              <View style={styles.permCheckRow}>
                <Ionicons name="lock-closed" size={16} color={colors.secondary} />
                <Text style={styles.permCheckText}>Privasi pengguna terjamin aman</Text>
              </View>
            </View>

            <View style={styles.permButtonRow}>
              <TouchableOpacity
                style={styles.permDenyBtn}
                onPress={handleDenyPermission}
                activeOpacity={0.8}
              >
                <Text style={styles.permDenyText}>Tolak</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.permAllowBtn}
                onPress={handleConfirmPermission}
                activeOpacity={0.8}
              >
                <Text style={styles.permAllowText}>Izinkan</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.neutral700,
    marginBottom: 8,
  },
  dropzone: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: colors.primary + '60',
    backgroundColor: colors.primaryLight + '40',
    borderRadius: 16,
    padding: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    ...shadows.sm,
  },
  uploadPrompt: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.neutral900,
    marginBottom: 4,
  },
  uploadSub: {
    fontSize: 12,
    color: colors.neutral500,
    textAlign: 'center',
    marginBottom: 8,
  },
  sensorBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  sensorBadgeText: {
    fontSize: 11,
    color: colors.primary,
    fontWeight: '700',
  },
  previewContainer: {
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: colors.neutral100,
  },
  previewImage: {
    width: '100%',
    height: 200,
  },
  previewOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  badgeSuccess: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: colors.secondary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeText: {
    color: colors.white,
    fontSize: 11,
    fontWeight: '700',
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  changeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.white,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  changeBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
  },
  removeBtn: {
    backgroundColor: colors.white,
    padding: 6,
    borderRadius: 8,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.neutral900,
  },
  optionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    backgroundColor: colors.neutral50,
    marginBottom: 10,
  },
  optionIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  optionTextWrap: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.neutral900,
  },
  optionDesc: {
    fontSize: 12,
    color: colors.neutral500,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: colors.neutral100,
    marginVertical: 12,
  },
  presetLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.neutral600,
    marginBottom: 10,
  },
  presetRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  presetThumbnailWrap: {
    flex: 1,
    borderRadius: 10,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 1,
    borderColor: colors.neutral200,
  },
  presetThumbnail: {
    width: '100%',
    height: 65,
  },
  presetBadge: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingVertical: 2,
    alignItems: 'center',
  },
  presetBadgeText: {
    color: colors.white,
    fontSize: 9,
    fontWeight: '600',
  },
  cancelBtn: {
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: colors.neutral100,
    borderRadius: 12,
  },
  cancelBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.neutral700,
  },

  // Permission Dialog Styling (Sesuai Konsep Week 7 Slide 5)
  permDialogCard: {
    width: '100%',
    backgroundColor: colors.white,
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
  },
  permIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  permTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.neutral900,
    textAlign: 'center',
    marginBottom: 8,
  },
  permDescription: {
    fontSize: 13,
    color: colors.neutral600,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 16,
  },
  permBestPracticeBox: {
    width: '100%',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 12,
    marginBottom: 20,
    gap: 8,
  },
  permCheckRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  permCheckText: {
    fontSize: 12,
    color: colors.neutral700,
    flex: 1,
  },
  permButtonRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  permDenyBtn: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 12,
    backgroundColor: colors.neutral100,
    alignItems: 'center',
  },
  permDenyText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.neutral700,
  },
  permAllowBtn: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: 'center',
  },
  permAllowText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.white,
  },
});

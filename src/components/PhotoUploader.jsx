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
  subtitle = 'Ambil foto langsung atau pilih dari galeri HP Anda',
  style,
}) {
  const [modalVisible, setModalVisible] = useState(false);

  // 1. Pilih dari Galeri HP
  const pickFromGallery = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (permission.status !== 'granted') {
        Alert.alert(
          'Izin Ditolak',
          'Aplikasi membutuhkan izin untuk membuka galeri foto di perangkat Anda.'
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
        setModalVisible(false);
      }
    } catch (err) {
      console.error('Error picking image from gallery:', err);
      Alert.alert('Gagal Membuka Galeri', err.message);
    }
  };

  // 2. Ambil Foto Kamera Langsung
  const takeWithCamera = async () => {
    try {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (permission.status !== 'granted') {
        Alert.alert(
          'Izin Ditolak',
          'Aplikasi membutuhkan izin untuk mengakses kamera perangkat Anda.'
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
        setModalVisible(false);
      }
    } catch (err) {
      console.error('Error taking photo:', err);
      Alert.alert('Gagal Mengakses Kamera', err.message);
    }
  };

  // 3. Preset Foto Motor Dummy
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
        </TouchableOpacity>
      )}

      {/* Modal Pilihan Pengambilan Foto */}
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
              onPress={takeWithCamera}
              activeOpacity={0.7}
            >
              <View style={[styles.optionIcon, { backgroundColor: '#EBF5FF' }]}>
                <Ionicons name="camera" size={22} color={colors.primary} />
              </View>
              <View style={styles.optionTextWrap}>
                <Text style={styles.optionTitle}>Ambil Foto dengan Kamera</Text>
                <Text style={styles.optionDesc}>Buka kamera HP Anda langsung</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.neutral300} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.optionBtn}
              onPress={pickFromGallery}
              activeOpacity={0.7}
            >
              <View style={[styles.optionIcon, { backgroundColor: '#DEF7EC' }]}>
                <Ionicons name="images" size={22} color={colors.secondary} />
              </View>
              <View style={styles.optionTextWrap}>
                <Text style={styles.optionTitle}>Pilih dari Galeri Foto</Text>
                <Text style={styles.optionDesc}>Pilih gambar motor yang tersimpan di HP</Text>
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
    padding: 24,
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
  },
  previewContainer: {
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: colors.neutral100,
  },
  previewImage: {
    width: '100%',
    height: 190,
  },
  previewOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  badgeSuccess: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.secondary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeText: {
    color: colors.white,
    fontSize: 11,
    fontWeight: '700',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  changeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.white,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  changeBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
  },
  removeBtn: {
    backgroundColor: colors.white,
    padding: 5,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 36 : 24,
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
    paddingVertical: 12,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral100,
  },
  optionIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
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
    marginVertical: 14,
  },
  presetLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.neutral500,
    marginBottom: 10,
  },
  presetRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  presetThumbnailWrap: {
    flex: 1,
    height: 70,
    borderRadius: 10,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 1,
    borderColor: colors.neutral200,
  },
  presetThumbnail: {
    width: '100%',
    height: '100%',
  },
  presetBadge: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingVertical: 2,
    alignItems: 'center',
  },
  presetBadgeText: {
    color: colors.white,
    fontSize: 9,
    fontWeight: '700',
  },
  cancelBtn: {
    alignItems: 'center',
    paddingVertical: 12,
    backgroundColor: colors.neutral100,
    borderRadius: 12,
  },
  cancelBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.neutral700,
  },
});

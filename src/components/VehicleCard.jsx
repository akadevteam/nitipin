import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, shadows } from '../theme/colors';
import StatusBadge from './StatusBadge';
import { MOTOR_PLACEHOLDER_IMAGES } from '../data/dummyData';
import { formatDateShort } from '../utils/helpers';

export default function VehicleCard({ booking, onPress, style }) {
  const fotoUri = MOTOR_PLACEHOLDER_IMAGES[booking.fotoIndex ?? 0];

  return (
    <TouchableOpacity
      style={[styles.card, shadows.sm, style]}
      onPress={onPress}
      activeOpacity={0.85}
    >
      {/* Foto Motor */}
      <Image
        source={{ uri: fotoUri }}
        style={styles.foto}
        resizeMode="cover"
      />
      {/* Overlay gradient feel */}
      <View style={styles.body}>
        <View style={styles.row}>
          <View style={styles.flex}>
            <Text style={styles.nopol}>{booking.nomorPolisi}</Text>
            <Text style={styles.merek}>{booking.merek}</Text>
          </View>
          <StatusBadge status={booking.status} />
        </View>

        <View style={styles.divider} />

        <View style={styles.infoRow}>
          <View style={styles.infoItem}>
            <Ionicons name="color-palette-outline" size={14} color={colors.neutral500} />
            <Text style={styles.infoText}>{booking.warna}</Text>
          </View>
          <View style={styles.infoItem}>
            <Ionicons name="calendar-outline" size={14} color={colors.neutral500} />
            <Text style={styles.infoText}>{formatDateShort(booking.tanggalMasuk)}</Text>
          </View>
          {booking.lokasi && (
            <View style={styles.infoItem}>
              <Ionicons name="location-outline" size={14} color={colors.neutral500} />
              <Text style={styles.infoText} numberOfLines={1}>
                {booking.lokasi.replace('Area Penyimpanan ', '')}
              </Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 12,
  },
  foto: {
    width: '100%',
    height: 150,
    backgroundColor: colors.neutral100,
  },
  body: { padding: 14 },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  flex: { flex: 1, marginRight: 8 },
  nopol: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.neutral900,
    letterSpacing: 0.5,
  },
  merek: {
    fontSize: 13,
    color: colors.neutral500,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: colors.neutral100,
    marginVertical: 10,
  },
  infoRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  infoText: {
    fontSize: 12,
    color: colors.neutral500,
  },
});

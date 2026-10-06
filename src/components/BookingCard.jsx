import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, shadows } from '../theme/colors';
import StatusBadge from './StatusBadge';
import { formatDateShort } from '../utils/helpers';

export default function BookingCard({ booking, onPress, showCustomer = false, style }) {
  return (
    <TouchableOpacity
      style={[styles.card, shadows.sm, style]}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <View style={styles.header}>
        <View style={styles.iconBox}>
          <Ionicons name="bicycle-outline" size={22} color={colors.primary} />
        </View>
        <View style={styles.flex}>
          <Text style={styles.nopol}>{booking.nomorPolisi}</Text>
          <Text style={styles.merek} numberOfLines={1}>{booking.merek} · {booking.warna}</Text>
        </View>
        <StatusBadge status={booking.status} />
      </View>

      <View style={styles.divider} />

      <View style={styles.footer}>
        {showCustomer && (
          <View style={styles.infoItem}>
            <Ionicons name="person-outline" size={13} color={colors.neutral500} />
            <Text style={styles.infoText}>{booking.customerName}</Text>
          </View>
        )}
        <View style={styles.infoItem}>
          <Ionicons name="calendar-outline" size={13} color={colors.neutral500} />
          <Text style={styles.infoText}>
            {formatDateShort(booking.tanggalMasuk)} – {formatDateShort(booking.tanggalKeluar)}
          </Text>
        </View>
        {booking.lokasi ? (
          <View style={styles.infoItem}>
            <Ionicons name="location-outline" size={13} color={colors.neutral500} />
            <Text style={styles.infoText} numberOfLines={1}>
              {booking.lokasi.replace('Area Penyimpanan ', 'Slot ')}
            </Text>
          </View>
        ) : null}
        <View style={styles.chevron}>
          <Ionicons name="chevron-forward" size={16} color={colors.neutral300} />
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconBox: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  flex: { flex: 1 },
  nopol: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.neutral900,
  },
  merek: {
    fontSize: 12,
    color: colors.neutral500,
    marginTop: 1,
  },
  divider: {
    height: 1,
    backgroundColor: colors.neutral100,
    marginVertical: 10,
  },
  footer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 10,
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
  chevron: {
    marginLeft: 'auto',
  },
});

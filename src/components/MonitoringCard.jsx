import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { MOTOR_PLACEHOLDER_IMAGES } from '../data/dummyData';
import { formatDate } from '../utils/helpers';

export default function MonitoringCard({ booking, monitoring, style }) {
  const fotoUri = MOTOR_PLACEHOLDER_IMAGES[monitoring?.fotoIndex ?? booking?.fotoIndex ?? 0];

  return (
    <View style={[styles.card, style]}>
      <Image
        source={{ uri: fotoUri }}
        style={styles.foto}
        resizeMode="cover"
      />
      <View style={styles.body}>
        <View style={styles.row}>
          <Ionicons name="calendar-outline" size={14} color={colors.neutral500} />
          <Text style={styles.meta}>
            Diperbarui: {formatDate(monitoring?.tanggalMonitoring || booking?.tanggalMasuk)}
          </Text>
        </View>
        <View style={styles.row}>
          <Ionicons name="location-outline" size={14} color={colors.primary} />
          <Text style={styles.lokasi}>{monitoring?.lokasi || booking?.lokasi || 'Belum ditentukan'}</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.kondisiRow}>
          <KondisiChip
            icon="shield-checkmark-outline"
            label="Kondisi"
            value={monitoring?.kondisiKeseluruhan || '-'}
            color={colors.secondary}
          />
          <KondisiChip
            icon="car-outline"
            label="Bensin"
            value={monitoring?.bensin || '-'}
            color={colors.warning}
          />
        </View>
      </View>
    </View>
  );
}

function KondisiChip({ icon, label, value, color }) {
  return (
    <View style={styles.chip}>
      <Ionicons name={icon} size={16} color={color} />
      <View>
        <Text style={styles.chipLabel}>{label}</Text>
        <Text style={[styles.chipValue, { color }]}>{value}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: 16,
    overflow: 'hidden',
  },
  foto: {
    width: '100%',
    height: 180,
    backgroundColor: colors.neutral100,
  },
  body: { padding: 14 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  meta: { fontSize: 12, color: colors.neutral500 },
  lokasi: { fontSize: 14, fontWeight: '600', color: colors.neutral900 },
  divider: {
    height: 1,
    backgroundColor: colors.neutral100,
    marginVertical: 10,
  },
  kondisiRow: { flexDirection: 'row', gap: 12 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.neutral100,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    flex: 1,
  },
  chipLabel: { fontSize: 10, color: colors.neutral500 },
  chipValue: { fontSize: 13, fontWeight: '700' },
});

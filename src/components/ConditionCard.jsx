import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

export default function ConditionCard({ monitoring, style }) {
  if (!monitoring) return null;

  const items = [
    {
      icon: 'shield-checkmark-outline',
      label: 'Kondisi Keseluruhan',
      value: monitoring.kondisiKeseluruhan,
      color: colors.secondary,
    },
    {
      icon: 'car-outline',
      label: 'Bensin',
      value: monitoring.bensin,
      color: colors.warning,
    },
    {
      icon: 'construct-outline',
      label: 'Kondisi Body',
      value: monitoring.kondisiBody,
      color: colors.primary,
    },
    {
      icon: 'ellipse-outline',
      label: 'Kondisi Ban',
      value: monitoring.kondisiBan,
      color: colors.neutral700,
    },
  ];

  return (
    <View style={[styles.card, style]}>
      <Text style={styles.title}>Laporan Kondisi</Text>
      {items.map((item, i) => (
        <View key={i} style={[styles.row, i < items.length - 1 && styles.borderBottom]}>
          <View style={[styles.iconBox, { backgroundColor: item.color + '20' }]}>
            <Ionicons name={item.icon} size={16} color={item.color} />
          </View>
          <Text style={styles.label}>{item.label}</Text>
          <Text style={[styles.value, { color: item.color }]}>{item.value || '-'}</Text>
        </View>
      ))}
      {monitoring.catatan ? (
        <View style={styles.noteBox}>
          <Ionicons name="document-text-outline" size={14} color={colors.neutral500} />
          <Text style={styles.noteText}>{monitoring.catatan}</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.neutral900,
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    gap: 10,
  },
  borderBottom: {
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral100,
  },
  iconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    flex: 1,
    fontSize: 13,
    color: colors.neutral700,
  },
  value: {
    fontSize: 13,
    fontWeight: '600',
  },
  noteBox: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
    padding: 12,
    backgroundColor: colors.neutral100,
    borderRadius: 10,
    alignItems: 'flex-start',
  },
  noteText: {
    flex: 1,
    fontSize: 13,
    color: colors.neutral700,
    lineHeight: 18,
  },
});

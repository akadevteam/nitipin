import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

const methods = {
  tunai: {
    icon: 'cash-outline',
    label: 'Tunai',
    desc: 'Bayar langsung di tempat penitipan',
    color: colors.secondary,
  },
  qris: {
    icon: 'qr-code-outline',
    label: 'QRIS',
    desc: 'Scan kode QR untuk pembayaran',
    color: colors.primary,
  },
  transfer: {
    icon: 'card-outline',
    label: 'Transfer Bank',
    desc: 'Transfer ke rekening penitipan',
    color: colors.purple,
  },
};

export default function PaymentMethodCard({ method, selected, onSelect }) {
  const config = methods[method];
  if (!config) return null;

  return (
    <TouchableOpacity
      style={[styles.card, selected && styles.selected]}
      onPress={() => onSelect(method)}
      activeOpacity={0.85}
    >
      <View style={[styles.iconBox, { backgroundColor: config.color + '18' }]}>
        <Ionicons name={config.icon} size={22} color={config.color} />
      </View>
      <View style={styles.flex}>
        <Text style={[styles.label, selected && { color: colors.primary }]}>
          {config.label}
        </Text>
        <Text style={styles.desc}>{config.desc}</Text>
      </View>
      <View style={[styles.radio, selected && styles.radioSelected]}>
        {selected && <View style={styles.radioDot} />}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    backgroundColor: colors.white,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: colors.neutral200,
    marginBottom: 10,
  },
  selected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  flex: { flex: 1 },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.neutral900,
  },
  desc: {
    fontSize: 12,
    color: colors.neutral500,
    marginTop: 2,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.neutral300,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSelected: { borderColor: colors.primary },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary,
  },
});

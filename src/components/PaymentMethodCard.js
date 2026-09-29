import React from 'react';
import { TouchableOpacity, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme';

export default function PaymentMethodCard({ label, icon, selected, onPress }) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.85} accessibilityLabel={`Metode ${label}`}
      style={{ flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 12, borderWidth: 2, marginBottom: 10, backgroundColor: '#fff',
        borderColor: selected ? colors.primary : colors.border }}>
      <Ionicons name={icon} size={24} color={selected ? colors.primary : colors.muted} />
      <Text style={{ flex: 1, marginLeft: 12, fontWeight: '700', color: colors.text }}>{label}</Text>
      <Ionicons name={selected ? 'radio-button-on' : 'radio-button-off'} size={22} color={selected ? colors.primary : colors.border} />
    </TouchableOpacity>
  );
}

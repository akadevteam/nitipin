import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme';

export default function Button({ title, onPress, variant = 'primary', icon, disabled, style }) {
  const v = { primary: [colors.primary, '#fff'], outline: ['#fff', colors.primary], danger: ['#FEE2E2', colors.danger], success: [colors.success, '#fff'] }[variant];
  return (
    <TouchableOpacity accessibilityRole="button" accessibilityLabel={title} disabled={disabled} onPress={onPress} activeOpacity={0.8}
      style={[s.btn, { backgroundColor: v[0], borderColor: variant === 'outline' ? colors.primary : v[0], opacity: disabled ? 0.5 : 1 }, style]}>
      {icon && <Ionicons name={icon} size={18} color={v[1]} style={{ marginRight: 8 }} />}
      <Text style={[s.txt, { color: v[1] }]}>{title}</Text>
    </TouchableOpacity>
  );
}
const s = StyleSheet.create({
  btn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 14, paddingHorizontal: 16, borderRadius: 12, borderWidth: 1, marginTop: 8 },
  txt: { fontWeight: '700', fontSize: 15 },
});

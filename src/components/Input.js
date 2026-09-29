import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { colors } from '../theme';

export default function Input({ label, ...props }) {
  return (
    <View style={{ marginBottom: 12 }}>
      {label && <Text style={s.label}>{label}</Text>}
      <TextInput placeholderTextColor="#9CA3AF" style={s.input} {...props} />
    </View>
  );
}
export function ChipGroup({ label, options, value, onChange }) {
  return (
    <View style={{ marginBottom: 12 }}>
      <Text style={s.label}>{label}</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
        {options.map((o) => (
          <TouchableOpacity key={o} onPress={() => onChange(o)} style={[s.chip, value === o && s.chipOn]}>
            <Text style={{ color: value === o ? '#fff' : colors.text, fontWeight: '600' }}>{o}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}
const s = StyleSheet.create({
  label: { fontSize: 13, fontWeight: '600', color: colors.muted, marginBottom: 6 },
  input: { backgroundColor: '#fff', borderWidth: 1, borderColor: colors.border, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, color: colors.text },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: colors.border, backgroundColor: '#fff', marginRight: 8, marginBottom: 8 },
  chipOn: { backgroundColor: colors.primary, borderColor: colors.primary },
});

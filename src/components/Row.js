import React from 'react';
import { View, Text } from 'react-native';
import { colors } from '../theme';
export default function Row({ label, value, bold }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 }}>
      <Text style={{ color: colors.muted, flex: 1 }}>{label}</Text>
      <Text style={{ color: colors.text, fontWeight: bold ? '800' : '600', flex: 1.4, textAlign: 'right' }}>{value || '-'}</Text>
    </View>
  );
}

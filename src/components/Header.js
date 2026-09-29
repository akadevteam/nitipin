import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme';

export default function Header({ title, subtitle, onBack }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
      {onBack && (
        <TouchableOpacity onPress={onBack} accessibilityLabel="Kembali" style={{ marginRight: 10, padding: 4 }}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
      )}
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 22, fontWeight: '800', color: colors.text }}>{title}</Text>
        {subtitle && <Text style={{ color: colors.muted, marginTop: 2 }}>{subtitle}</Text>}
      </View>
    </View>
  );
}

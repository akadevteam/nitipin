import React from 'react';
import { View, StyleSheet } from 'react-native';
import { colors, radius } from '../theme';
export default function Card({ children, style }) {
  return <View style={[s.card, style]}>{children}</View>;
}
const s = StyleSheet.create({
  card: { backgroundColor: colors.card, borderRadius: radius, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: colors.border },
});

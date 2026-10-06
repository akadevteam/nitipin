import React from 'react';
import { View, StyleSheet } from 'react-native';
import { colors, shadows } from '../theme/colors';

export default function Card({ children, style, shadow = 'sm', noPadding = false }) {
  const shadowStyle = shadows[shadow] || shadows.sm;
  return (
    <View style={[styles.card, shadowStyle, !noPadding && styles.padding, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: 16,
    overflow: 'hidden',
  },
  padding: {
    padding: 16,
  },
});

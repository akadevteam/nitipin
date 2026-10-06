import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { statusColors } from '../theme/colors';

export default function StatusBadge({ status, style }) {
  const config = statusColors[status] || {
    bg: '#F3F4F6',
    text: '#6B7280',
    label: status || 'Unknown',
  };

  return (
    <View style={[styles.badge, { backgroundColor: config.bg }, style]}>
      <View style={[styles.dot, { backgroundColor: config.text }]} />
      <Text style={[styles.label, { color: config.text }]}>{config.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
  },
});

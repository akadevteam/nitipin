import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  View,
} from 'react-native';
import { colors } from '../theme/colors';

const variantStyles = {
  primary: {
    container: { backgroundColor: colors.primary },
    text: { color: colors.white },
  },
  secondary: {
    container: { backgroundColor: colors.secondary },
    text: { color: colors.white },
  },
  outline: {
    container: {
      backgroundColor: 'transparent',
      borderWidth: 1.5,
      borderColor: colors.primary,
    },
    text: { color: colors.primary },
  },
  danger: {
    container: { backgroundColor: colors.danger },
    text: { color: colors.white },
  },
  ghost: {
    container: { backgroundColor: 'transparent' },
    text: { color: colors.primary },
  },
  neutral: {
    container: { backgroundColor: colors.neutral100 },
    text: { color: colors.neutral700 },
  },
};

export default function Button({
  title,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  style,
  textStyle,
  size = 'md',
}) {
  const v = variantStyles[variant] || variantStyles.primary;
  const sizeStyle = size === 'sm' ? styles.sm : size === 'lg' ? styles.lg : styles.md;

  return (
    <TouchableOpacity
      style={[
        styles.container,
        sizeStyle,
        v.container,
        disabled && styles.disabled,
        style,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color={v.text.color} size="small" />
      ) : (
        <Text style={[styles.text, v.text, textStyle]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  sm: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 8 },
  md: { paddingVertical: 14, paddingHorizontal: 20 },
  lg: { paddingVertical: 17, paddingHorizontal: 24 },
  text: {
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  disabled: {
    opacity: 0.45,
  },
});

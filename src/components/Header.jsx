import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

export default function Header({
  title,
  subtitle,
  showBack = false,
  onBack,
  rightComponent,
  transparent = false,
}) {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top + 8 },
        transparent && styles.transparent,
      ]}
    >
      <View style={styles.inner}>
        {showBack ? (
          <TouchableOpacity style={styles.backBtn} onPress={onBack} activeOpacity={0.7}>
            <Ionicons name="arrow-back" size={22} color={transparent ? colors.white : colors.neutral900} />
          </TouchableOpacity>
        ) : (
          <View style={styles.backBtn} />
        )}

        <View style={styles.titleWrap}>
          <Text
            style={[styles.title, transparent && { color: colors.white }]}
            numberOfLines={1}
          >
            {title}
          </Text>
          {subtitle && (
            <Text style={[styles.subtitle, transparent && { color: colors.white + 'CC' }]}>
              {subtitle}
            </Text>
          )}
        </View>

        <View style={styles.rightWrap}>
          {rightComponent || <View style={styles.backBtn} />}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral100,
  },
  transparent: {
    backgroundColor: 'transparent',
    borderBottomWidth: 0,
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  backBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleWrap: {
    flex: 1,
    alignItems: 'center',
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.neutral900,
  },
  subtitle: {
    fontSize: 12,
    color: colors.neutral500,
    marginTop: 1,
  },
  rightWrap: {
    width: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

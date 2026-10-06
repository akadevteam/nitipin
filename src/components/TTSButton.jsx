import React, { useState } from 'react';
import { TouchableOpacity, StyleSheet, Animated, View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Speech from 'expo-speech';
import { colors } from '../theme/colors';

export default function TTSButton({ text, style, size = 'md' }) {
  const [speaking, setSpeaking] = useState(false);

  const handlePress = async () => {
    if (speaking) {
      Speech.stop();
      setSpeaking(false);
      return;
    }
    setSpeaking(true);
    Speech.speak(text, {
      language: 'id-ID',
      pitch: 1.0,
      rate: 0.88,
      onDone: () => setSpeaking(false),
      onStopped: () => setSpeaking(false),
      onError: () => setSpeaking(false),
    });
  };

  const btnSize = size === 'sm' ? 36 : 46;
  const iconSize = size === 'sm' ? 18 : 22;

  return (
    <TouchableOpacity
      style={[
        styles.btn,
        { width: btnSize, height: btnSize, borderRadius: btnSize / 2 },
        speaking && styles.active,
        style,
      ]}
      onPress={handlePress}
      activeOpacity={0.8}
    >
      <Ionicons
        name={speaking ? 'volume-high' : 'volume-medium-outline'}
        size={iconSize}
        color={speaking ? colors.white : colors.primary}
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: {
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  active: {
    backgroundColor: colors.primary,
  },
});

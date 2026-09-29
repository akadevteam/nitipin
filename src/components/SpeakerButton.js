import React, { useState } from 'react';
import { TouchableOpacity, Text } from 'react-native';
import * as Speech from 'expo-speech';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme';

export const speak = (text) => {
  Speech.stop();
  Speech.speak(text, { language: 'id-ID', rate: 0.9 });
};

export default function SpeakerButton({ text, label = 'Dengarkan Informasi' }) {
  const [on, setOn] = useState(false);
  const toggle = () => {
    if (on) { Speech.stop(); setOn(false); return; }
    setOn(true);
    Speech.speak(text, { language: 'id-ID', rate: 0.9, onDone: () => setOn(false), onStopped: () => setOn(false), onError: () => setOn(false) });
  };
  return (
    <TouchableOpacity onPress={toggle} accessibilityRole="button" accessibilityLabel={on ? 'Hentikan pembacaan' : label}
      style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primaryLight, borderRadius: 12, paddingVertical: 14, marginTop: 8 }}>
      <Ionicons name={on ? 'stop-circle' : 'volume-high'} size={22} color={colors.primary} />
      <Text style={{ color: colors.primary, fontWeight: '700', marginLeft: 8 }}>{on ? 'Hentikan' : label}</Text>
    </TouchableOpacity>
  );
}

import React from 'react';
import { View, Image, Text, TouchableOpacity, StyleSheet } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme';

export function Photo({ uri, height = 160 }) {
  return uri ? <Image source={{ uri }} style={{ width: '100%', height, borderRadius: 12 }} resizeMode="cover" />
    : <View style={[s.ph, { height }]}><Ionicons name="image-outline" size={42} color={colors.muted} /><Text style={s.t}>Belum ada foto</Text></View>;
}
export default function PhotoPicker({ label = 'Foto Motor', uri, onChange }) {
  const pick = async () => {
    const r = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.6 });
    if (!r.canceled) onChange(r.assets[0].uri);
  };
  return (
    <View style={{ marginBottom: 12 }}>
      <Text style={s.label}>{label}</Text>
      <TouchableOpacity onPress={pick} activeOpacity={0.8}>
        <Photo uri={uri} />
        <Text style={[s.t, { color: colors.primary, marginTop: 6 }]}>{uri ? 'Ketuk untuk ganti foto' : 'Ketuk untuk pilih foto'}</Text>
      </TouchableOpacity>
    </View>
  );
}
const s = StyleSheet.create({
  ph: { backgroundColor: colors.primaryLight, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  t: { color: colors.muted, fontSize: 12, marginTop: 4, textAlign: 'center' },
  label: { fontSize: 13, fontWeight: '600', color: colors.muted, marginBottom: 6 },
});

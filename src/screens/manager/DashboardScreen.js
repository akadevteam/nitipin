import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Screen from '../../components/Screen';
import Header from '../../components/Header';
import { useApp } from '../../context/AppContext';
import { colors } from '../../theme';

const Stat = ({ icon, label, value, color, onPress }) => (
  <TouchableOpacity onPress={onPress} activeOpacity={0.85} style={{ width: '48%', backgroundColor: '#fff', borderRadius: 14, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: colors.border }}>
    <Ionicons name={icon} size={24} color={color} />
    <Text style={{ fontSize: 28, fontWeight: '900', color: colors.text, marginTop: 8 }}>{value}</Text>
    <Text style={{ color: colors.muted, fontSize: 13 }}>{label}</Text>
  </TouchableOpacity>
);

export default function DashboardScreen({ navigation }) {
  const { user, bookings } = useApp();
  const n = (fn) => bookings.filter(fn).length;
  const soon = n((b) => b.status === 'Sedang Dititipkan' && (new Date(b.exit) - new Date('2026-09-29')) / 86400000 <= 3);
  return (
    <Screen>
      <Header title={`Halo, ${user.name}`} subtitle="Ringkasan penitipan hari ini" />
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
        <Stat icon="mail-unread-outline" label="Booking Baru" value={n((b) => b.status === 'Menunggu Konfirmasi')} color={colors.info} onPress={() => navigation.navigate('Booking')} />
        <Stat icon="hourglass-outline" label="Menunggu Konfirmasi" value={n((b) => b.status === 'Menunggu Konfirmasi')} color={colors.warning} onPress={() => navigation.navigate('Booking')} />
        <Stat icon="bicycle-outline" label="Motor Dititipkan" value={n((b) => ['Pembayaran Berhasil', 'Sedang Dititipkan'].includes(b.status))} color="#4338CA" onPress={() => navigation.navigate('Motor')} />
        <Stat icon="checkmark-circle-outline" label="Pembayaran Berhasil" value={n((b) => b.paid)} color={colors.success} onPress={() => navigation.navigate('Booking')} />
        <Stat icon="exit-outline" label="Segera Keluar (≤3 hari)" value={soon} color={colors.danger} onPress={() => navigation.navigate('Motor')} />
      </View>
    </Screen>
  );
}

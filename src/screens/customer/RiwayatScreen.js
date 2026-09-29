import React from 'react';
import { Text } from 'react-native';
import Screen from '../../components/Screen';
import Header from '../../components/Header';
import BookingCard from '../../components/BookingCard';
import { useApp } from '../../context/AppContext';
import { colors } from '../../theme';

export default function RiwayatScreen({ navigation }) {
  const { user, bookings } = useApp();
  const mine = bookings.filter((b) => b.customerId === user.id);
  return (
    <Screen>
      <Header title="Riwayat" subtitle="Semua booking penitipan Anda" />
      {mine.length === 0 && <Text style={{ color: colors.muted }}>Belum ada riwayat.</Text>}
      {mine.map((b) => <BookingCard key={b.id} b={b} onPress={() => navigation.navigate('BookingDetail', { id: b.id })} />)}
    </Screen>
  );
}

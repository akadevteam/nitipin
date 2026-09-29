import React, { useState } from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import Screen from '../../components/Screen';
import Header from '../../components/Header';
import BookingCard from '../../components/BookingCard';
import { useApp } from '../../context/AppContext';
import { colors } from '../../theme';

const tabs = ['Semua', 'Menunggu Konfirmasi', 'Booking Dikonfirmasi', 'Pembayaran Berhasil'];

export default function BookingListScreen({ navigation }) {
  const { bookings } = useApp();
  const [tab, setTab] = useState('Semua');
  const list = tab === 'Semua' ? bookings : bookings.filter((b) => b.status === tab);
  return (
    <Screen>
      <Header title="Daftar Booking" subtitle="Booking dari customer" />
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 8 }}>
        {tabs.map((t) => (
          <TouchableOpacity key={t} onPress={() => setTab(t)} style={{ paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20, marginRight: 8, marginBottom: 8, backgroundColor: tab === t ? colors.primary : '#fff', borderWidth: 1, borderColor: tab === t ? colors.primary : colors.border }}>
            <Text style={{ color: tab === t ? '#fff' : colors.text, fontWeight: '600', fontSize: 12 }}>{t}</Text>
          </TouchableOpacity>
        ))}
      </View>
      {list.length === 0 && <Text style={{ color: colors.muted }}>Tidak ada booking.</Text>}
      {list.map((b) => <BookingCard key={b.id} b={b} showOwner onPress={() => navigation.navigate('ManagerBookingDetail', { id: b.id })} />)}
    </Screen>
  );
}

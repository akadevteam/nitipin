import React from 'react';
import { View, Text } from 'react-native';
import Screen from '../../components/Screen';
import Header from '../../components/Header';
import Card from '../../components/Card';
import Button from '../../components/Button';
import BookingCard from '../../components/BookingCard';
import { useApp } from '../../context/AppContext';
import { ACTIVE_STATUS } from '../../utils/helpers';
import { colors } from '../../theme';

export default function HomeScreen({ navigation }) {
  const { user, bookings } = useApp();
  const mine = bookings.filter((b) => b.customerId === user.id);
  const active = mine.filter((b) => ACTIVE_STATUS.includes(b.status));
  const history = mine.filter((b) => !ACTIVE_STATUS.includes(b.status)).slice(0, 2);

  return (
    <Screen>
      <Header title={`Halo, ${user.name} 👋`} subtitle="Selamat datang di NITIPIN" />
      {active.length === 0 ? (
        <Card style={{ backgroundColor: colors.primaryLight, borderColor: colors.primaryLight }}>
          <Text style={{ fontSize: 18, fontWeight: '800', color: colors.text }}>Titipkan Motor Anda</Text>
          <Text style={{ color: colors.muted, marginTop: 4 }}>Belum ada penitipan aktif.</Text>
          <Button title="Booking Penitipan" icon="add-circle-outline" onPress={() => navigation.navigate('Booking')} />
        </Card>
      ) : (
        <>
          <Text style={{ fontWeight: '800', fontSize: 16, color: colors.text, marginBottom: 8 }}>Penitipan Aktif</Text>
          {active.map((b) => <BookingCard key={b.id} b={b} onPress={() => navigation.navigate('BookingDetail', { id: b.id })} />)}
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <Button style={{ flex: 1 }} title="Booking Baru" variant="outline" onPress={() => navigation.navigate('Booking')} />
            <Button style={{ flex: 1 }} title="Monitoring" icon="eye-outline" onPress={() => navigation.navigate('Monitoring')} />
          </View>
        </>
      )}
      {history.length > 0 && (
        <>
          <Text style={{ fontWeight: '800', fontSize: 16, color: colors.text, marginTop: 20, marginBottom: 8 }}>Riwayat Terakhir</Text>
          {history.map((b) => <BookingCard key={b.id} b={b} onPress={() => navigation.navigate('BookingDetail', { id: b.id })} />)}
        </>
      )}
    </Screen>
  );
}

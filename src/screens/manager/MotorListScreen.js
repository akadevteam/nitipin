import React from 'react';
import { Text } from 'react-native';
import Screen from '../../components/Screen';
import Header from '../../components/Header';
import BookingCard from '../../components/BookingCard';
import Card from '../../components/Card';
import Row from '../../components/Row';
import { useApp } from '../../context/AppContext';
import { colors } from '../../theme';

export default function MotorListScreen({ navigation }) {
  const { bookings } = useApp();
  const list = bookings.filter((b) => ['Pembayaran Berhasil', 'Sedang Dititipkan'].includes(b.status));
  return (
    <Screen>
      <Header title="Motor Dititipkan" subtitle={`${list.length} motor saat ini`} />
      {list.length === 0 && <Text style={{ color: colors.muted }}>Belum ada motor dititipkan.</Text>}
      {list.map((b) => (
        <React.Fragment key={b.id}>
          <BookingCard b={b} showOwner onPress={() => navigation.navigate('ManagerBookingDetail', { id: b.id })} />
        </React.Fragment>
      ))}
    </Screen>
  );
}

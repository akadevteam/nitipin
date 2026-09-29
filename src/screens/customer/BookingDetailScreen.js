import React from 'react';
import { Alert, Text } from 'react-native';
import Screen from '../../components/Screen';
import Header from '../../components/Header';
import Card from '../../components/Card';
import Row from '../../components/Row';
import Button from '../../components/Button';
import VehicleCard from '../../components/VehicleCard';
import StatusBadge from '../../components/StatusBadge';
import { useApp } from '../../context/AppContext';
import { formatDate, canCancel, rupiah } from '../../utils/helpers';
import { colors } from '../../theme';

export default function BookingDetailScreen({ route, navigation }) {
  const { bookings, cancelBooking } = useApp();
  const b = bookings.find((x) => x.id === route.params.id);
  if (!b) return null;
  const payStatus = b.paid ? `Lunas (${b.payMethod})` : b.status === 'Booking Dikonfirmasi' ? 'Menunggu Pembayaran' : 'Belum Dibayar';

  const cancel = () => Alert.alert('Batalkan Booking', 'Yakin ingin membatalkan booking ini?', [
    { text: 'Tidak' }, { text: 'Ya, Batalkan', style: 'destructive', onPress: () => cancelBooking(b.id) },
  ]);

  return (
    <Screen>
      <Header title="Detail Booking" onBack={() => navigation.goBack()} />
      <Card><Text style={{ color: colors.muted, marginBottom: 6 }}>Status Booking</Text><StatusBadge status={b.status} /></Card>
      <VehicleCard b={b} />
      <Card>
        <Row label="Tanggal Masuk" value={formatDate(b.entry)} />
        <Row label="Tanggal Keluar" value={formatDate(b.exit)} />
        <Row label="Lokasi Penyimpanan" value={b.location || 'Ditentukan pengelola'} />
        <Row label="Total Biaya" value={rupiah(b.total)} />
        <Row label="Status Pembayaran" value={payStatus} bold />
      </Card>
      {b.status === 'Booking Dikonfirmasi' && !b.paid && <Button title="Bayar Sekarang" icon="card-outline" onPress={() => navigation.navigate('Payment', { id: b.id })} />}
      {b.status === 'Sedang Dititipkan' && <Button title="Lihat Monitoring" icon="eye-outline" onPress={() => navigation.navigate('CustomerTabs', { screen: 'Monitoring' })} />}
      {canCancel(b) && <Button title="Batalkan Booking" variant="danger" onPress={cancel} />}
    </Screen>
  );
}

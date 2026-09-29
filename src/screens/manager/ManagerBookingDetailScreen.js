import React, { useState } from 'react';
import { Alert, Text } from 'react-native';
import Screen from '../../components/Screen';
import Header from '../../components/Header';
import Card from '../../components/Card';
import Row from '../../components/Row';
import Input from '../../components/Input';
import Button from '../../components/Button';
import VehicleCard from '../../components/VehicleCard';
import StatusBadge from '../../components/StatusBadge';
import { useApp } from '../../context/AppContext';
import { formatDate, rupiah } from '../../utils/helpers';
import { colors } from '../../theme';

export default function ManagerBookingDetailScreen({ route, navigation }) {
  const { bookings, confirmBooking, rejectBooking, finishBooking } = useApp();
  const b = bookings.find((x) => x.id === route.params.id);
  const [loc, setLoc] = useState(b?.location || '');
  if (!b) return null;

  const confirm = () => {
    if (!loc.trim()) return Alert.alert('Lokasi kosong', 'Tentukan lokasi penyimpanan terlebih dahulu.');
    confirmBooking(b.id, loc.trim());
    Alert.alert('Berhasil', 'Booking Dikonfirmasi. Customer dapat melanjutkan ke pembayaran.', [{ text: 'OK', onPress: () => navigation.goBack() }]);
  };
  const reject = () => Alert.alert('Tolak Booking', 'Yakin menolak booking ini?', [
    { text: 'Batal' }, { text: 'Tolak', style: 'destructive', onPress: () => { rejectBooking(b.id); navigation.goBack(); } },
  ]);

  return (
    <Screen>
      <Header title="Detail Booking" onBack={() => navigation.goBack()} />
      <Card><Text style={{ color: colors.muted, marginBottom: 6 }}>Status</Text><StatusBadge status={b.status} /></Card>
      <VehicleCard b={b} />
      <Card>
        <Row label="Tanggal Masuk" value={formatDate(b.entry)} />
        <Row label="Tanggal Keluar" value={formatDate(b.exit)} />
        <Row label="Total Biaya" value={rupiah(b.total)} />
        <Row label="Pembayaran" value={b.paid ? `Lunas (${b.payMethod})` : 'Belum dibayar'} bold />
      </Card>
      {b.status === 'Menunggu Konfirmasi' && (
        <>
          <Input label="Lokasi Penyimpanan" value={loc} onChangeText={setLoc} placeholder="Area Penyimpanan A-12" />
          <Button title="Konfirmasi Booking" variant="success" icon="checkmark" onPress={confirm} />
          <Button title="Tolak Booking" variant="danger" onPress={reject} />
        </>
      )}
      {['Pembayaran Berhasil', 'Sedang Dititipkan'].includes(b.status) && (
        <>
          <Row label="Lokasi Penyimpanan" value={b.location} />
          <Button title="Isi / Perbarui Laporan" icon="clipboard-outline" onPress={() => navigation.navigate('ReportForm', { id: b.id })} />
        </>
      )}
      {b.status === 'Sedang Dititipkan' && <Button title="Tandai Selesai (Motor Keluar)" variant="outline" onPress={() => { finishBooking(b.id); navigation.goBack(); }} />}
    </Screen>
  );
}

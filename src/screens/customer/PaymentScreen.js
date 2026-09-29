import React, { useState } from 'react';
import { Text, Alert } from 'react-native';
import Screen from '../../components/Screen';
import Header from '../../components/Header';
import Card from '../../components/Card';
import Row from '../../components/Row';
import Button from '../../components/Button';
import PaymentMethodCard from '../../components/PaymentMethodCard';
import { speak } from '../../components/SpeakerButton';
import { useApp } from '../../context/AppContext';
import { calcDays, rupiah, paymentSpeech } from '../../utils/helpers';
import { colors } from '../../theme';

const methods = [
  { label: 'Tunai', icon: 'cash-outline' },
  { label: 'QRIS', icon: 'qr-code-outline' },
  { label: 'Transfer Bank', icon: 'business-outline' },
];

export default function PaymentScreen({ route, navigation }) {
  const { bookings, pay } = useApp();
  const b = bookings.find((x) => x.id === route.params.id);
  const [method, setMethod] = useState(null);
  const [done, setDone] = useState(false);
  if (!b) return null;

  const submit = () => {
    pay(b.id, method);
    setDone(true);
    speak(paymentSpeech(b));
  };

  if (done) {
    return (
      <Screen>
        <Card style={{ alignItems: 'center', marginTop: 60 }}>
          <Text style={{ fontSize: 56 }}>✅</Text>
          <Text style={{ fontSize: 22, fontWeight: '900', color: colors.success, marginTop: 8 }}>Pembayaran Berhasil</Text>
          <Text style={{ color: colors.muted, textAlign: 'center', marginTop: 6 }}>Motor {b.plate} telah terdaftar untuk penitipan.</Text>
        </Card>
        <Button title="Lihat Detail Booking" onPress={() => navigation.replace('BookingDetail', { id: b.id })} />
        <Button title="Ke Beranda" variant="outline" onPress={() => navigation.navigate('CustomerTabs', { screen: 'Home' })} />
      </Screen>
    );
  }

  return (
    <Screen>
      <Header title="Pembayaran" subtitle="Simulasi — tidak ada transaksi asli" onBack={() => navigation.goBack()} />
      <Card>
        <Row label="Motor" value={`${b.plate} • ${b.brand}`} />
        <Row label="Durasi" value={`${calcDays(b.entry, b.exit)} hari`} />
        <Row label="Total Biaya" value={rupiah(b.total)} bold />
      </Card>
      <Text style={{ fontWeight: '800', color: colors.text, marginBottom: 8 }}>Metode Pembayaran</Text>
      {methods.map((m) => <PaymentMethodCard key={m.label} {...m} selected={method === m.label} onPress={() => setMethod(m.label)} />)}
      <Button title={`Bayar ${rupiah(b.total)}`} disabled={!method} onPress={submit} />
    </Screen>
  );
}

import React from 'react';
import { Text } from 'react-native';
import Screen from '../../components/Screen';
import Header from '../../components/Header';
import Card from '../../components/Card';
import Row from '../../components/Row';
import Button from '../../components/Button';
import { useApp } from '../../context/AppContext';
import { formatDate } from '../../utils/helpers';
import { colors } from '../../theme';

export default function LaporanListScreen({ navigation }) {
  const { bookings } = useApp();
  const list = bookings.filter((b) => ['Pembayaran Berhasil', 'Sedang Dititipkan'].includes(b.status));
  return (
    <Screen>
      <Header title="Laporan Kondisi" subtitle="Monitoring motor yang dititipkan" />
      {list.length === 0 && <Text style={{ color: colors.muted }}>Belum ada motor untuk dilaporkan.</Text>}
      {list.map((b) => (
        <Card key={b.id}>
          <Text style={{ fontWeight: '800', fontSize: 17, color: colors.text }}>{b.plate}</Text>
          <Text style={{ color: colors.muted, marginBottom: 6 }}>{b.brand} • {b.owner}</Text>
          <Row label="Lokasi" value={b.location} />
          <Row label="Laporan terakhir" value={b.report ? `${formatDate(b.report.date)} — ${b.report.overall}` : 'Belum ada'} />
          <Button title={b.report ? 'Perbarui Laporan' : 'Buat Laporan'} icon="create-outline" onPress={() => navigation.navigate('ReportForm', { id: b.id })} />
        </Card>
      ))}
    </Screen>
  );
}

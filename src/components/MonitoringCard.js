import React from 'react';
import { View, Text } from 'react-native';
import Card from './Card';
import { Photo } from './PhotoBox';
import StatusBadge from './StatusBadge';
import Row from './Row';
import { formatDate } from '../utils/helpers';
import { colors } from '../theme';

export default function MonitoringCard({ b }) {
  const r = b.report;
  return (
    <Card>
      <Photo uri={r?.photo || b.photo} />
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
        <Text style={{ fontSize: 18, fontWeight: '800', color: colors.text }}>{b.plate}</Text>
        <StatusBadge status={b.status} />
      </View>
      <Text style={{ color: colors.muted, marginBottom: 6 }}>{b.brand}</Text>
      <Row label="Tanggal Monitoring" value={formatDate(r?.date)} />
      <Row label="Lokasi Penyimpanan" value={b.location} />
      <Row label="Kondisi Motor" value={r?.overall || 'Belum ada laporan'} bold />
    </Card>
  );
}

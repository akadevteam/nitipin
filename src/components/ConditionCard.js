import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Card from './Card';
import { Photo } from './PhotoBox';
import { formatDate } from '../utils/helpers';
import { colors } from '../theme';

const Item = ({ icon, label, value }) => (
  <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 8 }}>
    <View style={{ width: 34, height: 34, borderRadius: 10, backgroundColor: colors.primaryLight, alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
      <Ionicons name={icon} size={18} color={colors.primary} />
    </View>
    <View style={{ flex: 1 }}>
      <Text style={{ color: colors.muted, fontSize: 12 }}>{label}</Text>
      <Text style={{ color: colors.text, fontWeight: '700', fontSize: 15 }}>{value}</Text>
    </View>
  </View>
);

export default function ConditionCard({ report }) {
  if (!report) return null;
  return (
    <Card>
      <Text style={{ fontWeight: '800', fontSize: 16, color: colors.text, marginBottom: 4 }}>Laporan Kondisi Motor</Text>
      <Text style={{ color: colors.muted, marginBottom: 10 }}>Tanggal laporan: {formatDate(report.date)}</Text>
      <Item icon="shield-checkmark-outline" label="Kondisi Keseluruhan" value={report.overall} />
      <Item icon="speedometer-outline" label="Bensin" value={report.fuel} />
      <Item icon="construct-outline" label="Body" value={report.body} />
      <Item icon="disc-outline" label="Ban" value={report.tire} />
      <Item icon="document-text-outline" label="Catatan" value={report.note || '-'} />
      <Text style={{ color: colors.muted, fontSize: 12, marginTop: 8, marginBottom: 6 }}>Dokumentasi</Text>
      <Photo uri={report.photo} height={140} />
    </Card>
  );
}

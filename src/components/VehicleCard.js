import React from 'react';
import { View, Text } from 'react-native';
import Card from './Card';
import { Photo } from './PhotoBox';
import Row from './Row';
import { colors } from '../theme';

export default function VehicleCard({ b }) {
  return (
    <Card>
      <View style={{ marginBottom: 12 }}><Photo uri={b.photo} /></View>
      <Text style={{ fontSize: 18, fontWeight: '800', color: colors.text }}>{b.plate}</Text>
      <Text style={{ color: colors.muted, marginBottom: 8 }}>{b.brand} • {b.color}</Text>
      <Row label="Pemilik" value={b.owner} />
    </Card>
  );
}

import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Card from './Card';
import StatusBadge from './StatusBadge';
import { formatDate } from '../utils/helpers';
import { colors } from '../theme';

export default function BookingCard({ b, onPress, showOwner }) {
  return (
    <TouchableOpacity activeOpacity={0.85} onPress={onPress}>
      <Card>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={{ fontSize: 17, fontWeight: '800', color: colors.text }}>{b.plate}</Text>
          <StatusBadge status={b.status} />
        </View>
        <Text style={{ color: colors.muted, marginTop: 4 }}>{b.brand} • {b.color}</Text>
        {showOwner && <Text style={{ color: colors.text, marginTop: 4 }}>Pemilik: {b.owner}</Text>}
        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 10 }}>
          <Ionicons name="calendar-outline" size={16} color={colors.muted} />
          <Text style={{ color: colors.muted, marginLeft: 6, fontSize: 13 }}>{formatDate(b.entry)} → {formatDate(b.exit)}</Text>
        </View>
      </Card>
    </TouchableOpacity>
  );
}

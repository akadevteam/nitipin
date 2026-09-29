import React from 'react';
import { View, Text } from 'react-native';
import { colors } from '../theme';

const map = {
  'Menunggu Konfirmasi': ['#FEF3C7', colors.warning], 'Booking Dikonfirmasi': ['#DBEAFE', colors.info],
  'Menunggu Pembayaran': ['#FEF3C7', colors.warning], 'Pembayaran Berhasil': ['#DCFCE7', colors.success],
  'Sedang Dititipkan': ['#E0E7FF', '#4338CA'], 'Selesai': ['#F3F4F6', '#4B5563'],
  'Dibatalkan': ['#FEE2E2', colors.danger], 'Ditolak': ['#FEE2E2', colors.danger],
};
export default function StatusBadge({ status }) {
  const [bg, fg] = map[status] || ['#F3F4F6', '#4B5563'];
  return (
    <View style={{ backgroundColor: bg, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, alignSelf: 'flex-start' }}>
      <Text style={{ color: fg, fontSize: 12, fontWeight: '700' }}>{status}</Text>
    </View>
  );
}

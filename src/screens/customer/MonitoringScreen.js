import React from 'react';
import { Text } from 'react-native';
import Screen from '../../components/Screen';
import Header from '../../components/Header';
import Card from '../../components/Card';
import Button from '../../components/Button';
import MonitoringCard from '../../components/MonitoringCard';
import ConditionCard from '../../components/ConditionCard';
import SpeakerButton from '../../components/SpeakerButton';
import { useApp } from '../../context/AppContext';
import { reportSpeech } from '../../utils/helpers';
import { colors } from '../../theme';

export default function MonitoringScreen({ navigation }) {
  const { user, bookings } = useApp();
  const list = bookings.filter((b) => b.customerId === user.id && ['Pembayaran Berhasil', 'Sedang Dititipkan'].includes(b.status));

  return (
    <Screen>
      <Header title="Monitoring Motor" subtitle="Kondisi motor yang sedang dititipkan" />
      {list.length === 0 && (
        <Card style={{ alignItems: 'center' }}>
          <Text style={{ color: colors.muted, textAlign: 'center' }}>Belum ada motor yang sedang dititipkan. Monitoring muncul setelah pembayaran berhasil.</Text>
          <Button title="Booking Penitipan" onPress={() => navigation.navigate('Booking')} />
        </Card>
      )}
      {list.map((b) => (
        <React.Fragment key={b.id}>
          <MonitoringCard b={b} />
          {b.report ? (
            <>
              <ConditionCard report={b.report} />
              <SpeakerButton text={reportSpeech(b)} label="Dengarkan Laporan" />
            </>
          ) : (
            <Card><Text style={{ color: colors.muted }}>Menunggu laporan kondisi pertama dari pengelola.</Text></Card>
          )}
        </React.Fragment>
      ))}
    </Screen>
  );
}

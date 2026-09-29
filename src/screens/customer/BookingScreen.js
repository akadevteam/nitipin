import React, { useState } from 'react';
import { Text, Alert } from 'react-native';
import Screen from '../../components/Screen';
import Header from '../../components/Header';
import Input from '../../components/Input';
import Button from '../../components/Button';
import PhotoPicker from '../../components/PhotoBox';
import Card from '../../components/Card';
import { useApp } from '../../context/AppContext';
import { isValidDate, todayISO, calcTotal, rupiah } from '../../utils/helpers';
import { colors } from '../../theme';

const empty = { owner: '', plate: '', brand: '', color: '', entry: todayISO(), exit: '', photo: null };

export default function BookingScreen({ navigation }) {
  const { user, addBooking } = useApp();
  const [f, setF] = useState({ ...empty, owner: user.name });
  const set = (k) => (v) => setF((p) => ({ ...p, [k]: v }));

  const submit = () => {
    if (!f.owner || !f.plate || !f.brand || !f.color) return Alert.alert('Data belum lengkap', 'Mohon isi semua data motor.');
    if (!isValidDate(f.entry) || !isValidDate(f.exit)) return Alert.alert('Tanggal tidak valid', 'Gunakan format TTTT-BB-HH, contoh 2026-10-02.');
    if (new Date(f.exit) <= new Date(f.entry)) return Alert.alert('Tanggal tidak valid', 'Tanggal keluar harus setelah tanggal masuk.');
    const id = addBooking({ ...f, plate: f.plate.toUpperCase() });
    setF({ ...empty, owner: user.name });
    navigation.navigate('BookingDetail', { id });
  };

  return (
    <Screen>
      <Header title="Booking Penitipan" subtitle="Isi data motor yang akan dititipkan" />
      <Input label="Nama Pemilik" value={f.owner} onChangeText={set('owner')} />
      <Input label="Nomor Polisi" value={f.plate} onChangeText={set('plate')} autoCapitalize="characters" placeholder="B 1234 ABC" />
      <Input label="Merek / Tipe Motor" value={f.brand} onChangeText={set('brand')} placeholder="Honda Vario 160" />
      <Input label="Warna Motor" value={f.color} onChangeText={set('color')} placeholder="Hitam" />
      <Input label="Tanggal Masuk (TTTT-BB-HH)" value={f.entry} onChangeText={set('entry')} keyboardType="numbers-and-punctuation" />
      <Input label="Tanggal Keluar (TTTT-BB-HH)" value={f.exit} onChangeText={set('exit')} keyboardType="numbers-and-punctuation" placeholder="2026-10-02" />
      <PhotoPicker uri={f.photo} onChange={set('photo')} />
      {isValidDate(f.entry) && isValidDate(f.exit) && new Date(f.exit) > new Date(f.entry) && (
        <Card><Text style={{ color: colors.muted }}>Estimasi biaya</Text><Text style={{ fontWeight: '800', fontSize: 18, color: colors.text }}>{rupiah(calcTotal(f.entry, f.exit))}</Text></Card>
      )}
      <Text style={{ color: colors.muted, fontSize: 12 }}>Lokasi penyimpanan ditentukan oleh pengelola setelah booking dikonfirmasi.</Text>
      <Button title="Ajukan Booking" onPress={submit} />
    </Screen>
  );
}

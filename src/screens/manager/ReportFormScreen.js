import React, { useState } from 'react';
import { Alert } from 'react-native';
import Screen from '../../components/Screen';
import Header from '../../components/Header';
import Input, { ChipGroup } from '../../components/Input';
import Button from '../../components/Button';
import PhotoPicker from '../../components/PhotoBox';
import { useApp } from '../../context/AppContext';
import { isValidDate, todayISO } from '../../utils/helpers';

export default function ReportFormScreen({ route, navigation }) {
  const { bookings, saveReport } = useApp();
  const b = bookings.find((x) => x.id === route.params.id);
  const r = b?.report;
  const [loc, setLoc] = useState(b?.location || '');
  const [f, setF] = useState({
    date: todayISO(), photo: r?.photo || null, overall: r?.overall || 'Baik', fuel: r?.fuel || '¾',
    body: r?.body || 'Tidak ada kerusakan', tire: r?.tire || 'Baik', note: r?.note || '',
  });
  if (!b) return null;
  const set = (k) => (v) => setF((p) => ({ ...p, [k]: v }));

  const save = () => {
    if (!loc.trim()) return Alert.alert('Lokasi kosong', 'Isi lokasi penyimpanan.');
    if (!isValidDate(f.date)) return Alert.alert('Tanggal tidak valid', 'Gunakan format TTTT-BB-HH.');
    saveReport(b.id, f, loc.trim());
    Alert.alert('Laporan Disimpan', 'Customer sekarang dapat melihat laporan ini.', [{ text: 'OK', onPress: () => navigation.goBack() }]);
  };

  return (
    <Screen>
      <Header title="Laporan Kondisi" subtitle={`${b.plate} • ${b.brand}`} onBack={() => navigation.goBack()} />
      <PhotoPicker label="Foto Motor Terbaru" uri={f.photo} onChange={set('photo')} />
      <Input label="Tanggal Monitoring (TTTT-BB-HH)" value={f.date} onChangeText={set('date')} keyboardType="numbers-and-punctuation" />
      <Input label="Lokasi Penyimpanan" value={loc} onChangeText={setLoc} placeholder="Area Penyimpanan A-12" />
      <ChipGroup label="Kondisi Keseluruhan" options={['Baik', 'Perlu Perhatian', 'Rusak']} value={f.overall} onChange={set('overall')} />
      <ChipGroup label="Bensin" options={['Kosong', '¼', '½', '¾', 'Penuh']} value={f.fuel} onChange={set('fuel')} />
      <Input label="Kondisi Body" value={f.body} onChangeText={set('body')} />
      <Input label="Kondisi Ban" value={f.tire} onChangeText={set('tire')} />
      <Input label="Catatan Tambahan" value={f.note} onChangeText={set('note')} multiline style={{ minHeight: 80, textAlignVertical: 'top' }} />
      <Button title="Simpan Laporan" onPress={save} />
    </Screen>
  );
}

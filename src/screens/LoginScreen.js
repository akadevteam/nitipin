import React, { useState } from 'react';
import { View, Text, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import Screen from '../components/Screen';
import Input from '../components/Input';
import Button from '../components/Button';
import { useApp } from '../context/AppContext';
import { colors } from '../theme';

export default function LoginScreen({ navigation }) {
  const { login } = useApp();
  const [id, setId] = useState('');
  const [pw, setPw] = useState('');

  const submit = () => {
    const u = login(id, pw);
    if (!u) return Alert.alert('Gagal Masuk', 'Akun atau kata sandi salah.');
    navigation.replace(u.role === 'customer' ? 'CustomerTabs' : 'ManagerTabs');
  };
  const fill = (a) => { setId(a); setPw('1234'); };

  return (
    <Screen>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={{ alignItems: 'center', marginTop: 40, marginBottom: 32 }}>
          <View style={{ width: 72, height: 72, borderRadius: 20, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ color: '#fff', fontSize: 34, fontWeight: '900' }}>N</Text>
          </View>
          <Text style={{ fontSize: 28, fontWeight: '900', color: colors.text, marginTop: 12 }}>NITIPIN</Text>
          <Text style={{ color: colors.muted }}>Penitipan motor jadi lebih tertata</Text>
        </View>
        <Input label="Nomor HP / Email" value={id} onChangeText={setId} autoCapitalize="none" placeholder="budi" />
        <Input label="Kata Sandi" value={pw} onChangeText={setPw} secureTextEntry placeholder="••••" />
        <Button title="Masuk" onPress={submit} />
        <Button title="Buat Akun" variant="outline" onPress={() => Alert.alert('Prototype', 'Pendaftaran akun belum tersedia. Gunakan akun demo di bawah.')} />
        <View style={{ marginTop: 28, padding: 14, borderRadius: 12, backgroundColor: colors.primaryLight }}>
          <Text style={{ fontWeight: '700', color: colors.text, marginBottom: 4 }}>Akun demo (ketuk untuk mengisi)</Text>
          <Text onPress={() => fill('budi')} style={{ color: colors.primary, paddingVertical: 6 }}>Customer — budi / 1234</Text>
          <Text onPress={() => fill('pengelola')} style={{ color: colors.primary, paddingVertical: 6 }}>Pengelola — pengelola / 1234</Text>
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}

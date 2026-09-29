import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Screen from '../components/Screen';
import Header from '../components/Header';
import Card from '../components/Card';
import Row from '../components/Row';
import Button from '../components/Button';
import { useApp } from '../context/AppContext';
import { colors } from '../theme';

export default function ProfilScreen({ navigation }) {
  const { user, logout } = useApp();
  const out = () => { logout(); navigation.getParent().reset({ index: 0, routes: [{ name: 'Login' }] }); };
  return (
    <Screen>
      <Header title="Profil" />
      <Card style={{ alignItems: 'center' }}>
        <Ionicons name="person-circle" size={80} color={colors.primary} />
        <Text style={{ fontSize: 20, fontWeight: '800', color: colors.text }}>{user?.name}</Text>
        <Text style={{ color: colors.muted, textTransform: 'capitalize' }}>{user?.role}</Text>
      </Card>
      <Card>
        <Row label="Nomor HP" value={user?.phone} />
        <Row label="Peran" value={user?.role === 'customer' ? 'Customer' : 'Pengelola Penitipan'} />
      </Card>
      <Button title="Keluar" variant="danger" icon="log-out-outline" onPress={out} />
    </Screen>
  );
}

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../../context/AppContext';
import Input from '../../components/Input';
import Button from '../../components/Button';
import { colors } from '../../theme/colors';

export default function RegisterScreen({ navigation }) {
  const { register } = useApp();
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const set = (key) => (val) => setForm((f) => ({ ...f, [key]: val }));

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Nama wajib diisi';
    if (!form.email.trim()) e.email = 'Email wajib diisi';
    else if (!/^[^@]+@[^@]+\.[^@]+$/.test(form.email)) e.email = 'Format email tidak valid';
    if (!form.phone.trim()) e.phone = 'Nomor HP wajib diisi';
    if (!form.password) e.password = 'Password wajib diisi';
    else if (form.password.length < 6) e.password = 'Password minimal 6 karakter';
    if (form.confirmPassword !== form.password) e.confirmPassword = 'Password tidak cocok';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleRegister = () => {
    if (!validate()) return;
    setLoading(true);
    setTimeout(() => {
      const result = register({
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        password: form.password,
      });
      setLoading(false);
      if (!result.success) {
        Alert.alert('Pendaftaran Gagal', result.message);
      }
      // On success, AppContext sets currentUser → AppNavigator auto-navigates
    }, 800);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.headerRow}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
              <Ionicons name="arrow-back" size={22} color={colors.neutral900} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Buat Akun</Text>
            <View style={styles.backBtn} />
          </View>

          <View style={styles.logoWrap}>
            <View style={styles.logoBox}>
              <Ionicons name="person-add" size={28} color={colors.white} />
            </View>
            <Text style={styles.subtitle}>Daftar sebagai Customer NITIPIN</Text>
          </View>

          <View style={styles.card}>
            <Input
              label="Nama Lengkap"
              value={form.name}
              onChangeText={set('name')}
              placeholder="Masukkan nama lengkap"
              leftIcon="person-outline"
              error={errors.name}
            />
            <Input
              label="Email"
              value={form.email}
              onChangeText={set('email')}
              placeholder="Masukkan email"
              keyboardType="email-address"
              autoCapitalize="none"
              leftIcon="mail-outline"
              error={errors.email}
            />
            <Input
              label="Nomor HP"
              value={form.phone}
              onChangeText={set('phone')}
              placeholder="08xxxxxxxxxx"
              keyboardType="phone-pad"
              leftIcon="call-outline"
              error={errors.phone}
            />
            <Input
              label="Password"
              value={form.password}
              onChangeText={set('password')}
              placeholder="Minimal 6 karakter"
              secureTextEntry
              leftIcon="lock-closed-outline"
              error={errors.password}
            />
            <Input
              label="Konfirmasi Password"
              value={form.confirmPassword}
              onChangeText={set('confirmPassword')}
              placeholder="Ulangi password"
              secureTextEntry
              leftIcon="lock-closed-outline"
              error={errors.confirmPassword}
            />

            <Button
              title="Daftar Sekarang"
              onPress={handleRegister}
              loading={loading}
              style={styles.btn}
            />
          </View>

          <View style={styles.loginRow}>
            <Text style={styles.loginText}>Sudah punya akun? </Text>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Text style={styles.loginLink}>Masuk</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
  container: { flexGrow: 1, paddingHorizontal: 24, paddingTop: 16, paddingBottom: 32 },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  backBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 17, fontWeight: '700', color: colors.neutral900 },
  logoWrap: { alignItems: 'center', marginBottom: 24 },
  logoBox: {
    width: 64,
    height: 64,
    borderRadius: 18,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  subtitle: { fontSize: 13, color: colors.neutral500 },
  card: {
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  btn: { marginTop: 4 },
  loginRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 24 },
  loginText: { fontSize: 14, color: colors.neutral500 },
  loginLink: { fontSize: 14, fontWeight: '700', color: colors.primary },
});

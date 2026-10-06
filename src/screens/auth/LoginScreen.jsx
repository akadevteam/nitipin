import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
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

export default function LoginScreen({ navigation }) {
  const { login } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!email.trim()) e.email = 'Email wajib diisi';
    if (!password) e.password = 'Password wajib diisi';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleLogin = async () => {
    if (!validate()) return;
    setLoading(true);
    setTimeout(() => {
      const result = login(email.trim(), password);
      setLoading(false);
      if (!result.success) {
        Alert.alert('Login Gagal', result.message);
      }
    }, 800);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>

        <ScrollView
          contentContainerStyle={styles.container}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled">

          {/* Logo */}
          <View style={styles.logoWrap}>
            <Image
              source={require('../../../assets/icon.png')}
              style={{ width: 85, height: 85, marginBottom: 12, borderRadius: 20 }}
              resizeMode="contain"
            />
            <Text style={styles.logoText}>NITIPIN</Text>
            <Text style={styles.logoSub}>Aplikasi Penitipan Motor Terpercaya</Text>
          </View>

          {/* Card Form */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Masuk ke Akun Anda</Text>

            <Input
              label="Email"
              value={email}
              onChangeText={setEmail}
              placeholder="Masukkan email Anda"
              keyboardType="email-address"
              autoCapitalize="none"
              leftIcon="mail-outline"
              error={errors.email}
            />
            <Input
              label="Password"
              value={password}
              onChangeText={setPassword}
              placeholder="Masukkan password"
              secureTextEntry
              leftIcon="lock-closed-outline"
              error={errors.password}
            />

            <Button
              title="Masuk"
              onPress={handleLogin}
              loading={loading}
              style={styles.loginBtn}
            />

            {/* Demo accounts info */}
            <View style={styles.demoBox}>
              <Ionicons name="information-circle-outline" size={14} color={colors.primary} />
              <Text style={styles.demoText}>
                Demo: budi@gmail.com / 123456{`\n`}Pengelola: pengelola@nitipin.id / admin123
              </Text>
            </View>
          </View>

          {/* Register link */}
          <View style={styles.registerRow}>
            <Text style={styles.registerText}>Belum punya akun? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text style={styles.registerLink}>Buat Akun</Text>
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
  container: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 32,
  },
  logoWrap: { alignItems: 'center', marginBottom: 36 },
  logoBox: {
    width: 72,
    height: 72,
    borderRadius: 20,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  logoText: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.neutral900,
    letterSpacing: 2,
  },
  logoSub: {
    fontSize: 13,
    color: colors.neutral500,
    marginTop: 4,
    textAlign: 'center',
  },
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
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.neutral900,
    marginBottom: 20,
  },
  loginBtn: { marginTop: 4 },
  demoBox: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 16,
    padding: 12,
    backgroundColor: colors.primaryLight,
    borderRadius: 10,
    alignItems: 'flex-start',
  },
  demoText: {
    flex: 1,
    fontSize: 12,
    color: colors.primary,
    lineHeight: 18,
  },
  registerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  registerText: { fontSize: 14, color: colors.neutral500 },
  registerLink: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary,
  },
});

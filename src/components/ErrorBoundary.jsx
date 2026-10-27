// ============================================================
// ErrorBoundary — Menangkap Error Tak Terduga (React Class Component)
// Week 6: Error Handling & Reliable API
// ============================================================
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, shadows } from '../theme/colors';

/**
 * ErrorBoundary menangkap exception JavaScript di tree komponen React
 * yang tidak bisa ditangkap oleh try/catch biasa.
 *
 * Penggunaan:
 * <ErrorBoundary>
 *   <KomponenYangMungkinError />
 * </ErrorBoundary>
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  // Dipanggil saat ada error di subtree — update state agar render fallback UI
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  // Dipanggil setelah render fallback UI — cocok untuk logging
  componentDidCatch(error, errorInfo) {
    console.error('[ErrorBoundary] Uncaught error:', error, errorInfo);
    this.setState({ errorInfo });

    // Di production, bisa kirim ke Sentry / Crashlytics:
    // crashlytics().recordError(error);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      // Jika ada custom fallback dari props, tampilkan itu
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.handleReset);
      }

      const errorMessage = this.state.error?.message || 'Terjadi kesalahan yang tidak diketahui';

      return (
        <View style={styles.container}>
          <View style={styles.card}>
            <View style={styles.iconBox}>
              <Ionicons name="warning-outline" size={40} color={colors.danger} />
            </View>

            <Text style={styles.title}>Ups, Terjadi Kesalahan!</Text>
            <Text style={styles.subtitle}>
              Bagian ini mengalami masalah dan tidak bisa ditampilkan.
            </Text>

            {/* Detail error untuk debugging */}
            <View style={styles.errorDetail}>
              <Text style={styles.errorDetailLabel}>Detail Error:</Text>
              <Text style={styles.errorDetailText} numberOfLines={3}>
                {errorMessage}
              </Text>
            </View>

            <TouchableOpacity
              style={styles.retryBtn}
              onPress={this.handleReset}
              activeOpacity={0.8}
            >
              <Ionicons name="refresh-outline" size={16} color={colors.white} />
              <Text style={styles.retryText}>Coba Lagi</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: colors.background,
  },
  card: {
    width: '100%',
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: 28,
    alignItems: 'center',
    ...shadows.md,
  },
  iconBox: {
    width: 72,
    height: 72,
    borderRadius: 20,
    backgroundColor: '#FFF5F5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.neutral900,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 13,
    color: colors.neutral500,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 16,
  },
  errorDetail: {
    width: '100%',
    backgroundColor: '#FFF5F5',
    borderRadius: 10,
    padding: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#FDE8E8',
  },
  errorDetailLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.danger,
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  errorDetailText: {
    fontSize: 12,
    color: colors.neutral700,
    fontFamily: 'monospace',
    lineHeight: 18,
  },
  retryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.danger,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  retryText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '700',
  },
});

export default ErrorBoundary;

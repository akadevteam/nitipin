import React, { useEffect } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppProvider } from './src/context/AppContext';
import AppNavigator from './src/navigation/AppNavigator';
import ErrorBoundary from './src/components/ErrorBoundary';
import NetworkStatusBar from './src/components/NetworkStatusBar';
import { API_BASE_URL } from './src/services/api';

export default function App() {
  useEffect(() => {
    // Pada mode web / browser responsif, kunci overflow body agar navbar tetap fixed di bawah seperti native app
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      document.documentElement.style.height = '100%';
      document.body.style.height = '100%';
      document.body.style.margin = '0';
      document.body.style.padding = '0';
      document.body.style.overflow = 'hidden';
      const rootTag = document.getElementById('root');
      if (rootTag) {
        rootTag.style.height = '100%';
        rootTag.style.display = 'flex';
        rootTag.style.flexDirection = 'column';
        rootTag.style.overflow = 'hidden';
      }
    }
  }, []);

  return (
    <SafeAreaProvider style={styles.container}>
      {/* ErrorBoundary membungkus seluruh app untuk menangkap crash tak terduga */}
      <ErrorBoundary>
        <View style={styles.container}>
          <AppProvider>
            <StatusBar style="dark" />
            <AppNavigator />
            {/* NetworkStatusBar — indikator offline/online di bagian atas */}
            <NetworkStatusBar apiBaseUrl={API_BASE_URL} />
          </AppProvider>
        </View>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    height: Platform.OS === 'web' ? '100vh' : '100%',
    width: '100%',
    overflow: 'hidden',
  },
});

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Platform,
  Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Notifications from 'expo-notifications';
import Header from '../../components/Header';
import { colors, shadows } from '../../theme/colors';
import {
  registerForPushNotificationsAsync,
  sendPushNotification,
  sendLocalNotification,
  NOTIFICATION_TEMPLATES,
  requestWebNotificationPermission,
} from '../../services/notificationService';
import { API_BASE_URL } from '../../services/api';

const isWeb = Platform.OS === 'web';

export default function NotificationScreen({ navigation }) {
  // ── State ──────────────────────────────────────────────────
  const [token, setToken] = useState('');
  const [permissionStatus, setPermissionStatus] = useState('checking');
  const [loadingToken, setLoadingToken] = useState(true);
  const [sending, setSending] = useState(false);
  const [backendSyncStatus, setBackendSyncStatus] = useState('Menghubungkan...');
  const [webPermStatus, setWebPermStatus] = useState('default');
  
  // Template & Custom Input
  const [selectedTemplate, setSelectedTemplate] = useState(NOTIFICATION_TEMPLATES[0]);
  const [customTitle, setCustomTitle] = useState('');
  const [customBody, setCustomBody] = useState('');
  const [useCustom, setUseCustom] = useState(false);

  // Riwayat Notifikasi yang Diterima
  const [receivedLogs, setReceivedLogs] = useState([]);
  const notificationListener = useRef();
  const responseListener = useRef();

  // ── Effect: Registrasi Token & Listener ────────────────────
  useEffect(() => {
    initNotifications();

    // Listener hanya aktif di mobile (expo-notifications tidak support web)
    if (!isWeb) {
      notificationListener.current = Notifications.addNotificationReceivedListener((notification) => {
        const title = notification.request.content.title;
        const body = notification.request.content.body;
        const data = notification.request.content.data;
        setReceivedLogs((prev) => [
          { id: Date.now().toString(), title, body, data, receivedAt: new Date().toLocaleTimeString('id-ID') },
          ...prev,
        ]);
      });

      responseListener.current = Notifications.addNotificationResponseReceivedListener((response) => {
        const data = response.notification.request.content.data;
        handleNotificationNavigation(data);
      });

      return () => {
        if (notificationListener.current) notificationListener.current.remove();
        if (responseListener.current) responseListener.current.remove();
      };
    }
  }, []);

  // ── Inisialisasi Token & Izin ──────────────────────────────
  const initNotifications = async () => {
    setLoadingToken(true);
    try {
      const res = await registerForPushNotificationsAsync('u1');
      if (res.success) {
        setToken(res.token);
        setPermissionStatus('granted');
        if (res.isMock && Platform.OS === 'web') {
          setBackendSyncStatus('Token Web tersimpan ke MySQL Server ✅');
        } else {
          setBackendSyncStatus('Tersimpan di Database MySQL Server ✅');
        }
      } else {
        setPermissionStatus(res.status || 'denied');
        setBackendSyncStatus('Izin Ditolak ❌');
        // Di web, tidak gunakan Alert karena bisa blocking — tampilkan di UI saja
        if (Platform.OS !== 'web') {
          Alert.alert('Perhatian', res.error || 'Izin notifikasi tidak diaktifkan.');
        }
      }
    } catch (e) {
      console.error(e);
      setPermissionStatus('error');
      setBackendSyncStatus('Gagal: ' + e.message);
    } finally {
      setLoadingToken(false);
    }
  };

  // ── Handler Deep Linking Navigasi (Task 03) ─────────────────
  const handleNotificationNavigation = (data) => {
    if (!data) return;
    if (data.screen === 'BookingDetail') {
      navigation.navigate('BookingDetail', { bookingId: data.bookingId || data.id || 'b1' });
    } else if (data.screen === 'Location') {
      navigation.navigate('Location');
    } else {
      navigation.navigate('Home');
    }
  };

  // ── Handler Kirim Notifikasi (Task 02) ──────────────────────
  const handleSendNotification = async (viaServer = true) => {
    const titleToSend = useCustom ? customTitle.trim() : selectedTemplate.title;
    const bodyToSend = useCustom ? customBody.trim() : selectedTemplate.body;
    const dataToSend = useCustom
      ? { screen: 'BookingDetail', bookingId: 'b1', action: 'custom_test' }
      : selectedTemplate.data;

    if (!titleToSend || !bodyToSend) {
      Alert.alert('Data Kurang', 'Judul dan isi pesan notifikasi wajib diisi!');
      return;
    }

    setSending(true);
    try {
      // Di web, selalu gunakan sendPushNotification yang sudah handle web
      const result = await sendPushNotification({
        to: token,
        title: titleToSend,
        body: bodyToSend,
        data: dataToSend,
      });

      if (result.success) {
        const methodLabel = result.method === 'server'
          ? 'Backend MySQL Server'
          : result.method === 'web-browser'
          ? 'Web Browser Notification API'
          : 'Local Notification';

        // Di web gunakan window.alert karena lebih aman
        if (Platform.OS === 'web') {
          window.alert(`✅ Notifikasi berhasil dikirim!\n\nMetode: ${methodLabel}\nCek pop-up notifikasi di kanan atas browser Anda.`);
          // Tambahkan ke log manual karena tidak ada listener di web
          setReceivedLogs((prev) => [
            { id: Date.now().toString(), title: titleToSend, body: bodyToSend, data: dataToSend, receivedAt: new Date().toLocaleTimeString('id-ID') },
            ...prev,
          ]);
        } else {
          Alert.alert('Berhasil Dikirim!', `Notifikasi diproses via ${methodLabel}.\n\nCek bar notifikasi HP Anda!`);
        }
      } else {
        const errMsg = result.error || result.message || 'Terjadi kesalahan saat mengirim.';
        if (Platform.OS === 'web') {
          window.alert('❌ Gagal: ' + errMsg);
        } else {
          Alert.alert('Gagal', errMsg);
        }
      }
    } catch (err) {
      Alert.alert('Error', err.message);
    } finally {
      setSending(false);
    }
  };

  // ── Salin Token ───────────────────────────────────────────
  const handleShareOrCopyToken = async () => {
    if (!token) return;
    if (Platform.OS === 'web') {
      try {
        await navigator.clipboard.writeText(token);
        window.alert('Token berhasil disalin ke clipboard!');
      } catch (_) {
        window.alert('Token: ' + token);
      }
      return;
    }
    try {
      await Share.share({ message: token, title: 'Expo Push Token NITIPIN' });
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <Header
        title="Push Notifikasi (Week 11)"
        showBack
        onBack={() => navigation.goBack()}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Banner Penjelasan Tugas Week 11 */}
        <View style={styles.heroCard}>
          <View style={styles.heroIconBox}>
            <Ionicons name="notifications" size={28} color="#FFFFFF" />
          </View>
          <View style={{ flex: 1 }}>
            <View style={styles.badgeRow}>
              <View style={styles.badgeWeek}>
                <Text style={styles.badgeWeekText}>SPRINT 09</Text>
              </View>
              <Text style={styles.badgeSub}>TASK 01, 02, 03</Text>
            </View>
            <Text style={styles.heroTitle}>Push Notification System</Text>
            <Text style={styles.heroDesc}>
              Registrasi perangkat, pengiriman via Server MySQL, dan deep linking ke Detail Penitipan.
            </Text>
          </View>
        </View>

        {/* ── CARD 1: Task 01 - Device Registration & Token ── */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.cardHeaderLeft}>
              <View style={[styles.stepDot, { backgroundColor: colors.primary }]}>
                <Text style={styles.stepDotText}>1</Text>
              </View>
              <Text style={styles.cardTitle}>Status Registrasi Perangkat</Text>
            </View>
            <TouchableOpacity onPress={initNotifications} style={styles.refreshBtn}>
              <Ionicons name="reload" size={16} color={colors.primary} />
            </TouchableOpacity>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Izin Notifikasi</Text>
            <View style={styles.statusPill}>
              <View
                style={[
                  styles.statusIndicator,
                  { backgroundColor: permissionStatus === 'granted' ? colors.success : colors.danger },
                ]}
              />
              <Text style={styles.statusText}>
                {permissionStatus === 'granted' ? 'Diberikan (Granted)' : 'Belum Diizinkan'}
              </Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Database Server</Text>
            <Text style={styles.dbStatusText}>{backendSyncStatus}</Text>
          </View>

          {/* Token Box */}
          <Text style={[styles.infoLabel, { marginTop: 12, marginBottom: 6 }]}>
            Expo Push Token:
          </Text>
          <View style={styles.tokenBox}>
            {loadingToken ? (
              <View style={styles.tokenLoading}>
                <ActivityIndicator size="small" color={colors.primary} />
                <Text style={styles.tokenLoadingText}>Mengambil token perangkat...</Text>
              </View>
            ) : (
              <>
                <Text style={styles.tokenText} numberOfLines={3} selectable>
                  {token || 'Token belum tersedia'}
                </Text>
                <TouchableOpacity
                  style={styles.copyBtn}
                  onPress={handleShareOrCopyToken}
                  activeOpacity={0.7}
                >
                  <Ionicons name="copy-outline" size={16} color={colors.primary} />
                  <Text style={styles.copyBtnText}>Salin / Share Token</Text>
                </TouchableOpacity>
              </>
            )}
          </View>

          {/* Info platform-aware */}
          <View style={styles.expoGoTipBox}>
            <Ionicons name="information-circle" size={18} color="#3B82F6" />
            <Text style={styles.expoGoTipText}>
              {isWeb ? (
                <Text>
                  <Text style={{ fontWeight: '700' }}>Browser Web:</Text> Notifikasi menggunakan Web Notification API bawaan browser. Izinkan saat dialog muncul, atau klik ikon 🔒 di address bar untuk mengaktifkannya.
                </Text>
              ) : (
                <Text>
                  <Text style={{ fontWeight: '700' }}>Catatan Expo Go:</Text> Sesuai kebijakan SDK 53+, remote push di Expo Go digantikan notifikasi lokal. Tombol kirim akan memunculkan pop-up notifikasi di HP Anda.
                </Text>
              )}
            </Text>
          </View>
        </View>

        {/* ── CARD 2: Task 02 - Send Push Notification ── */}
        <View style={styles.card}>
          <View style={styles.cardHeaderLeft}>
            <View style={[styles.stepDot, { backgroundColor: colors.warning }]}>
              <Text style={styles.stepDotText}>2</Text>
            </View>
            <Text style={styles.cardTitle}>Kirim Push Notifikasi</Text>
          </View>
          <Text style={styles.cardSubtitle}>
            Pilih opsi template pesan penitipan atau buat pesan custom:
          </Text>

          {/* Tab Selector: Template vs Custom */}
          <View style={styles.tabRow}>
            <TouchableOpacity
              style={[styles.tabBtn, !useCustom && styles.tabBtnActive]}
              onPress={() => setUseCustom(false)}
            >
              <Ionicons
                name="list-outline"
                size={16}
                color={!useCustom ? colors.primary : colors.neutral500}
              />
              <Text style={[styles.tabBtnText, !useCustom && styles.tabBtnTextActive]}>
                Pilihan Template
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tabBtn, useCustom && styles.tabBtnActive]}
              onPress={() => setUseCustom(true)}
            >
              <Ionicons
                name="create-outline"
                size={16}
                color={useCustom ? colors.primary : colors.neutral500}
              />
              <Text style={[styles.tabBtnText, useCustom && styles.tabBtnTextActive]}>
                Pesan Custom
              </Text>
            </TouchableOpacity>
          </View>

          {/* Mode Template */}
          {!useCustom ? (
            <View style={styles.templateList}>
              {NOTIFICATION_TEMPLATES.map((item) => {
                const isSelected = selectedTemplate.id === item.id;
                return (
                  <TouchableOpacity
                    key={item.id}
                    style={[styles.templateItem, isSelected && styles.templateItemActive]}
                    onPress={() => setSelectedTemplate(item)}
                    activeOpacity={0.8}
                  >
                    <View style={styles.templateTopRow}>
                      <View style={styles.categoryBadge}>
                        <Text style={styles.categoryBadgeText}>{item.category}</Text>
                      </View>
                      {isSelected && (
                        <Ionicons name="checkmark-circle" size={18} color={colors.primary} />
                      )}
                    </View>
                    <Text style={styles.templateTitle}>{item.title}</Text>
                    <Text style={styles.templateBody}>{item.body}</Text>
                    <View style={styles.targetRow}>
                      <Ionicons name="arrow-forward-circle-outline" size={14} color={colors.neutral600} />
                      <Text style={styles.targetText}>
                        Arahkan ke: <Text style={{ fontWeight: '700' }}>{item.data.screen}</Text>
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          ) : (
            /* Mode Custom */
            <View style={styles.customForm}>
              <Text style={styles.inputLabel}>Judul Notifikasi</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Contoh: Titipan Barang Selesai"
                value={customTitle}
                onChangeText={setCustomTitle}
              />

              <Text style={styles.inputLabel}>Isi Pesan Notifikasi</Text>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                placeholder="Tulis pesan lengkap notifikasi di sini..."
                value={customBody}
                onChangeText={setCustomBody}
                multiline
                numberOfLines={3}
              />
            </View>
          )}

          {/* Tombol Aksi Kirim */}
          <View style={styles.actionButtonsCol}>
            <TouchableOpacity
              style={[styles.primaryActionBtn, sending && { opacity: 0.7 }]}
              onPress={() => handleSendNotification(true)}
              disabled={sending}
              activeOpacity={0.85}
            >
              {sending ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <Ionicons name="paper-plane" size={18} color="#FFFFFF" />
                  <Text style={styles.primaryActionBtnText}>
                    {isWeb ? 'Tampilkan Notifikasi Browser' : 'Kirim via Server Backend MySQL'}
                  </Text>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryActionBtn}
              onPress={() => handleSendNotification(false)}
              disabled={sending}
              activeOpacity={0.85}
            >
              <Ionicons name="flash-outline" size={18} color={colors.primary} />
              <Text style={styles.secondaryActionBtnText}>
                {isWeb ? 'Uji Notifikasi Browser (Web API)' : 'Uji Notifikasi Lokal (Instan)'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ── CARD 3: Task 03 - Deep Linking & Response ── */}
        <View style={styles.card}>
          <View style={styles.cardHeaderLeft}>
            <View style={[styles.stepDot, { backgroundColor: colors.success }]}>
              <Text style={styles.stepDotText}>3</Text>
            </View>
            <Text style={styles.cardTitle}>Handle Tap & Navigasi (Deep Link)</Text>
          </View>
          <Text style={styles.cardSubtitle}>
            Saat Anda mengetuk (*tap*) notifikasi yang masuk, sistem membaca payload JSON dan otomatis membuka halaman fitur terkait:
          </Text>

          <TouchableOpacity
            style={styles.directNavBtn}
            onPress={() => handleNotificationNavigation(selectedTemplate.data)}
            activeOpacity={0.8}
          >
            <Ionicons name="open-outline" size={20} color={colors.primary} />
            <View style={{ flex: 1 }}>
              <Text style={styles.directNavTitle}>Simulasi Buka: Detail Penitipan</Text>
              <Text style={styles.directNavDesc}>
                Target: {selectedTemplate.data.screen} (ID: {selectedTemplate.data.bookingId || selectedTemplate.data.id || 'b1'})
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.neutral400} />
          </TouchableOpacity>
        </View>

        {/* ── CARD 4: Log Notifikasi Masuk ── */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.cardHeaderLeft}>
              <Ionicons name="time-outline" size={20} color={colors.neutral700} />
              <Text style={styles.cardTitle}>Log Notifikasi Diterima</Text>
            </View>
            {receivedLogs.length > 0 && (
              <TouchableOpacity onPress={() => setReceivedLogs([])}>
                <Text style={styles.clearLogsText}>Bersihkan</Text>
              </TouchableOpacity>
            )}
          </View>

          {receivedLogs.length === 0 ? (
            <View style={styles.emptyLogBox}>
              <Ionicons name="notifications-off-outline" size={32} color={colors.neutral400} />
              <Text style={styles.emptyLogText}>
                Belum ada notifikasi yang diterima pada sesi ini.
              </Text>
              <Text style={styles.emptyLogSub}>
                Coba kirim notifikasi di atas untuk melihat responnya di sini.
              </Text>
            </View>
          ) : (
            receivedLogs.map((log) => (
              <View key={log.id} style={styles.logItem}>
                <View style={styles.logHeader}>
                  <Text style={styles.logTitle}>{log.title}</Text>
                  <Text style={styles.logTime}>{log.receivedAt}</Text>
                </View>
                <Text style={styles.logBody}>{log.body}</Text>
                {log.data && Object.keys(log.data).length > 0 && (
                  <View style={styles.payloadBox}>
                    <Text style={styles.payloadTitle}>Payload Data:</Text>
                    <Text style={styles.payloadCode}>
                      {JSON.stringify(log.data, null, 2)}
                    </Text>
                  </View>
                )}
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 36,
  },
  heroCard: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    ...shadows.md,
  },
  heroIconBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  badgeWeek: {
    backgroundColor: colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginRight: 6,
  },
  badgeWeekText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
  badgeSub: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '600',
  },
  heroTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 2,
  },
  heroDesc: {
    color: '#94A3B8',
    fontSize: 12,
    lineHeight: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...shadows.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepDot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  stepDotText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.neutral900,
  },
  cardSubtitle: {
    fontSize: 12,
    color: colors.neutral600,
    marginTop: 4,
    marginBottom: 12,
    lineHeight: 17,
  },
  refreshBtn: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: '#EFF6FF',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  infoLabel: {
    fontSize: 13,
    color: colors.neutral600,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.neutral800,
  },
  dbStatusText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
  },
  tokenBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  tokenLoading: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  tokenLoadingText: {
    marginLeft: 8,
    fontSize: 12,
    color: colors.neutral600,
  },
  tokenText: {
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontSize: 11.5,
    color: '#334155',
    lineHeight: 16,
  },
  copyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    paddingVertical: 8,
    backgroundColor: '#EFF6FF',
    borderRadius: 8,
  },
  copyBtnText: {
    marginLeft: 6,
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
  },
  tabRow: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 10,
    padding: 3,
    marginBottom: 12,
  },
  tabBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 8,
  },
  tabBtnActive: {
    backgroundColor: '#FFFFFF',
    ...shadows.sm,
  },
  tabBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.neutral600,
    marginLeft: 6,
  },
  tabBtnTextActive: {
    color: colors.primary,
  },
  templateList: {
    gap: 10,
    marginBottom: 14,
  },
  templateItem: {
    padding: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
  },
  templateItemActive: {
    borderColor: colors.primary,
    backgroundColor: '#F0F7FF',
  },
  templateTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  categoryBadge: {
    backgroundColor: '#E2E8F0',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  categoryBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.neutral700,
  },
  templateTitle: {
    fontSize: 13.5,
    fontWeight: '700',
    color: colors.neutral900,
    marginBottom: 2,
  },
  templateBody: {
    fontSize: 12,
    color: colors.neutral600,
    lineHeight: 16,
    marginBottom: 6,
  },
  targetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  targetText: {
    fontSize: 11,
    color: colors.neutral600,
  },
  customForm: {
    marginBottom: 14,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.neutral700,
    marginBottom: 4,
    marginTop: 6,
  },
  textInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
    color: colors.neutral900,
  },
  textArea: {
    height: 70,
    textAlignVertical: 'top',
  },
  actionButtonsCol: {
    gap: 8,
  },
  primaryActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingVertical: 12,
    borderRadius: 10,
    gap: 8,
    ...shadows.sm,
  },
  primaryActionBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  secondaryActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    paddingVertical: 11,
    borderRadius: 10,
    gap: 8,
  },
  secondaryActionBtnText: {
    color: '#15803D',
    fontSize: 12.5,
    fontWeight: '700',
  },
  directNavBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 10,
  },
  directNavTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.neutral800,
  },
  directNavDesc: {
    fontSize: 11,
    color: colors.neutral600,
    marginTop: 2,
  },
  clearLogsText: {
    fontSize: 12,
    color: colors.danger,
    fontWeight: '600',
  },
  emptyLogBox: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  emptyLogText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.neutral600,
    marginTop: 8,
  },
  emptyLogSub: {
    fontSize: 11,
    color: colors.neutral400,
    marginTop: 2,
    textAlign: 'center',
  },
  logItem: {
    backgroundColor: '#F8FAFC',
    padding: 10,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
    marginBottom: 8,
  },
  logHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  logTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.neutral900,
  },
  logTime: {
    fontSize: 10.5,
    color: colors.neutral500,
  },
  logBody: {
    fontSize: 12,
    color: colors.neutral700,
    lineHeight: 16,
  },
  payloadBox: {
    marginTop: 6,
    backgroundColor: '#E2E8F0',
    padding: 6,
    borderRadius: 6,
  },
  payloadTitle: {
    fontSize: 10,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 2,
  },
  payloadCode: {
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontSize: 10,
    color: '#0F172A',
  },
  expoGoTipBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#EFF6FF',
    borderRadius: 8,
    padding: 10,
    marginTop: 10,
    gap: 8,
  },
  expoGoTipText: {
    flex: 1,
    fontSize: 11,
    color: '#1E40AF',
    lineHeight: 15,
  },
});

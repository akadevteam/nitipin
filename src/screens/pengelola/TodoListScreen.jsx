import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Alert,
  RefreshControl,
  Switch,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Header from '../../components/Header';
import { colors, shadows } from '../../theme/colors';
import {
  getTodos,
  createTodo,
  updateTodoStatus,
  deleteTodo,
  setSimulateError,
  getSimulateError,
  NITIPIN_TASK_PRESETS,
} from '../../services/todoService';

export default function TodoListScreen({ navigation }) {
  // ─── 02. Tri-State Management (Sesuai Materi Slide 9) ─────────
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // State untuk form input & aksi spesifik
  const [newTitle, setNewTitle] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState(null); // ID item yang sedang diproses (PATCH/DELETE)
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('all'); // 'all' | 'pending' | 'completed'

  // Fitur demonstrasi simulasi error untuk dosen/penguji
  const [isSimulateError, setIsSimulateErrorState] = useState(getSimulateError());

  // Ref untuk AbortController (Slide 10: Mencegah memory leak saat unmount)
  const abortControllerRef = useRef(null);

  // ─── 01. TAMPILKAN DATA API (GET + useEffect + AbortController) ───
  const loadTodos = useCallback(async (isPullRefresh = false) => {
    if (isPullRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);

    // Batalkan request sebelumnya jika masih berjalan
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const result = await getTodos(controller.signal);
      if (result.success) {
        setTodos(result.data);
      } else {
        throw new Error(result.error);
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        const msg = err.message || 'Gagal mengambil data dari server';
        setError(msg);
        // 05. Error Handling via Alert
        Alert.alert('Gagal Memuat Tugas', msg);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Slide 10: Dependency array [] untuk dieksekusi 1x saat komponen dimount
  useEffect(() => {
    loadTodos();

    // Cleanup function untuk batalkan request jika user keluar dari screen
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [loadTodos]);

  // ─── 03. MENAMBAHKAN TODO (POST) ──────────────────────────────
  const handleAddTodo = async () => {
    const trimmed = newTitle.trim();
    if (!trimmed) {
      Alert.alert('Input Kosong', 'Silakan ketikkan nama tugas operasional.');
      return;
    }

    setSubmitting(true);
    try {
      // POST ke REST API JSONPlaceholder
      const result = await createTodo(trimmed);
      if (result.success) {
        // Update state lokal dengan data yang berhasil dibuat di server
        setTodos((prev) => [result.data, ...prev]);
        setNewTitle('');
        Alert.alert(
          'Tugas Ditambahkan!',
          `Tugas "${result.data.title}" berhasil dikirim ke REST API (Status 201 Created).`
        );
      }
    } catch (err) {
      // 05. Error Handling blok try...catch
      Alert.alert('Gagal Menambah Tugas', err.message || 'Terjadi kesalahan jaringan.');
    } finally {
      setSubmitting(false);
    }
  };

  // ─── 04. UBAH STATUS TUGAS (PATCH) ─────────────────────────────
  const handleToggleStatus = async (item) => {
    const nextCompleted = !item.completed;
    setActionLoadingId(item.id);

    try {
      // PATCH ke REST API
      const result = await updateTodoStatus(item.id, nextCompleted);
      if (result.success) {
        setTodos((prev) =>
          prev.map((t) => (t.id === item.id ? { ...t, completed: nextCompleted } : t))
        );
      }
    } catch (err) {
      // 05. Error Handling
      Alert.alert('Gagal Mengubah Status', err.message || 'Gagal memperbarui status di server.');
    } finally {
      setActionLoadingId(null);
    }
  };

  // ─── FITUR PLUS: HAPUS TUGAS (DELETE) ─────────────────────────
  const handleDeleteTodo = (item) => {
    Alert.alert(
      'Hapus Tugas?',
      `Yakin ingin menghapus tugas "${item.title}" dari server?`,
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Hapus',
          style: 'destructive',
          onPress: async () => {
            setActionLoadingId(item.id);
            try {
              const result = await deleteTodo(item.id);
              if (result.success) {
                setTodos((prev) => prev.filter((t) => t.id !== item.id));
                Alert.alert('Berhasil', 'Tugas berhasil dihapus dari REST API.');
              }
            } catch (err) {
              Alert.alert('Gagal Menghapus', err.message || 'Gagal menghapus tugas dari server.');
            } finally {
              setActionLoadingId(null);
            }
          },
        },
      ]
    );
  };

  // Toggle mode simulasi error
  const handleToggleSimulateError = (value) => {
    setIsSimulateErrorState(value);
    setSimulateError(value);
    Alert.alert(
      value ? 'Mode Simulasi Error Aktif' : 'Mode Normal Aktif',
      value
        ? 'Semua pemanggilan API berikutnya akan menghasilkan error simulasi untuk menguji validasi try...catch & Alert.'
        : 'Pemanggilan API kembali normal ke https://jsonplaceholder.typicode.com.'
    );
  };

  // Filter list
  const filteredTodos = todos.filter((t) => {
    if (filter === 'pending') return !t.completed;
    if (filter === 'completed') return t.completed;
    return true;
  });

  const totalCount = todos.length;
  const completedCount = todos.filter((t) => t.completed).length;
  const pendingCount = totalCount - completedCount;

  // Render Item FlatList
  const renderItem = ({ item }) => {
    const isItemProcessing = actionLoadingId === item.id;

    return (
      <View style={[styles.todoCard, item.completed && styles.todoCardCompleted]}>
        {/* Checkbox / Toggle Status */}
        <TouchableOpacity
          style={styles.checkArea}
          onPress={() => handleToggleStatus(item)}
          disabled={isItemProcessing}
          activeOpacity={0.7}
        >
          {isItemProcessing ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : (
            <View
              style={[
                styles.checkbox,
                item.completed && styles.checkboxChecked,
              ]}
            >
              {item.completed && <Ionicons name="checkmark" size={16} color={colors.white} />}
            </View>
          )}
        </TouchableOpacity>

        {/* Text Title & Badge ID */}
        <View style={styles.todoContent}>
          <View style={styles.badgeRow}>
            <Text style={styles.badgeId}>ID #{item.id}</Text>
            <Text
              style={[
                styles.statusPill,
                item.completed ? styles.statusPillDone : styles.statusPillPending,
              ]}
            >
              {item.completed ? 'Selesai' : 'Belum Selesai'}
            </Text>
          </View>
          <Text
            style={[
              styles.todoTitle,
              item.completed && styles.todoTitleCompleted,
            ]}
          >
            {item.title}
          </Text>
        </View>

        {/* Action Button: Delete */}
        <TouchableOpacity
          style={styles.deleteBtn}
          onPress={() => handleDeleteTodo(item)}
          disabled={isItemProcessing}
          activeOpacity={0.7}
        >
          <Ionicons name="trash-outline" size={18} color={colors.danger} />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      {/* 06. Header dengan Tombol Reload */}
      <Header
        title="Checklist Tugas Penitipan"
        subtitle="Todo List Async · Week 9"
        showBack
        onBack={() => navigation.goBack()}
        rightComponent={
          <TouchableOpacity
            style={styles.headerReloadBtn}
            onPress={() => loadTodos(false)}
            disabled={loading}
            activeOpacity={0.7}
          >
            <Ionicons
              name="sync"
              size={18}
              color={loading ? colors.neutral300 : colors.primary}
            />
          </TouchableOpacity>
        }
      />

      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <FlatList
          data={filteredTodos}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          // 06. Refresh Data via Pull-to-refresh
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => loadTodos(true)}
              colors={[colors.primary]}
              tintColor={colors.primary}
            />
          }
          ListHeaderComponent={
            <View style={styles.headerSection}>
              {/* Card Banner Info API */}
              <View style={styles.apiBanner}>
                <View style={styles.apiBannerTop}>
                  <View style={styles.apiStatusBadge}>
                    <View
                      style={[
                        styles.dotLive,
                        isSimulateError && { backgroundColor: colors.danger },
                      ]}
                    />
                    <Text style={styles.apiStatusText}>
                      {isSimulateError ? 'SIMULASI ERROR' : 'REST API CONNECTED'}
                    </Text>
                  </View>
                  <Text style={styles.apiHostText}>jsonplaceholder.typicode.com</Text>
                </View>

                {/* Tester Switch: Simulasi Error untuk dosen */}
                <View style={styles.simulatorRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.simulatorTitle}>Uji Coba Error Handling (try/catch)</Text>
                    <Text style={styles.simulatorDesc}>
                      Aktifkan untuk menyimulasikan kegagalan jaringan saat panggil API
                    </Text>
                  </View>
                  <Switch
                    value={isSimulateError}
                    onValueChange={handleToggleSimulateError}
                    trackColor={{ false: colors.neutral200, true: colors.dangerLight }}
                    thumbColor={isSimulateError ? colors.danger : colors.white}
                  />
                </View>
              </View>

              {/* 03. Form Input Todo Baru (POST) */}
              <View style={styles.formCard}>
                <Text style={styles.formLabel}>Tambah Tugas Operasional Baru</Text>
                <View style={styles.inputRow}>
                  <TextInput
                    style={styles.input}
                    placeholder="Contoh: Cek fisik motor Vario B 1234 CD..."
                    placeholderTextColor={colors.neutral300}
                    value={newTitle}
                    onChangeText={setNewTitle}
                    onSubmitEditing={handleAddTodo}
                    returnKeyType="done"
                    editable={!submitting}
                  />
                  <TouchableOpacity
                    style={[styles.addBtn, submitting && styles.addBtnDisabled]}
                    onPress={handleAddTodo}
                    disabled={submitting}
                    activeOpacity={0.8}
                  >
                    {submitting ? (
                      <ActivityIndicator size="small" color={colors.white} />
                    ) : (
                      <>
                        <Ionicons name="add" size={18} color={colors.white} />
                        <Text style={styles.addBtnText}>Tambah</Text>
                      </>
                    )}
                  </TouchableOpacity>
                </View>

                {/* Quick Presets Khas Nitipin */}
                <Text style={styles.presetLabel}>⚡ Saran Cepat Tugas Staf:</Text>
                <FlatList
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  data={NITIPIN_TASK_PRESETS}
                  keyExtractor={(item, idx) => String(idx)}
                  contentContainerStyle={styles.presetList}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={styles.presetChip}
                      onPress={() => setNewTitle(item)}
                      activeOpacity={0.7}
                    >
                      <Ionicons name="sparkles" size={12} color={colors.primary} />
                      <Text style={styles.presetText} numberOfLines={1}>
                        {item}
                      </Text>
                    </TouchableOpacity>
                  )}
                />
              </View>

              {/* Statistik & Filter Tab */}
              <View style={styles.statsRow}>
                <TouchableOpacity
                  style={[styles.statBox, filter === 'all' && styles.statBoxActive]}
                  onPress={() => setFilter('all')}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.statCount, filter === 'all' && styles.statTextActive]}>
                    {totalCount}
                  </Text>
                  <Text style={[styles.statTitle, filter === 'all' && styles.statTextActive]}>
                    Semua
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.statBox, filter === 'pending' && styles.statBoxActive]}
                  onPress={() => setFilter('pending')}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.statCount, { color: colors.warning }]}>
                    {pendingCount}
                  </Text>
                  <Text style={[styles.statTitle, filter === 'pending' && styles.statTextActive]}>
                    Belum Selesai
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.statBox, filter === 'completed' && styles.statBoxActive]}
                  onPress={() => setFilter('completed')}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.statCount, { color: colors.secondary }]}>
                    {completedCount}
                  </Text>
                  <Text style={[styles.statTitle, filter === 'completed' && styles.statTextActive]}>
                    Selesai
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={styles.sectionTitleRow}>
                <Text style={styles.sectionTitle}>Daftar Tugas Operasional</Text>
                <Text style={styles.sectionSubtitle}>
                  {filteredTodos.length} tugas ditampilkan
                </Text>
              </View>
            </View>
          }
          // 02. Loading Indicator (Tri-State Loading Phase)
          ListEmptyComponent={
            loading ? (
              <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={styles.loadingText}>Mengambil data dari REST API...</Text>
                <Text style={styles.loadingSub}>GET /todos?_limit=10</Text>
              </View>
            ) : error ? (
              // 05. Error State UI (Tri-State Error Phase)
              <View style={styles.centerContainer}>
                <Ionicons name="alert-circle-outline" size={48} color={colors.danger} />
                <Text style={styles.errorTitle}>Gagal Mengambil Data</Text>
                <Text style={styles.errorMsg}>{error}</Text>
                <TouchableOpacity
                  style={styles.retryBtn}
                  onPress={() => loadTodos(false)}
                  activeOpacity={0.8}
                >
                  <Ionicons name="refresh" size={16} color={colors.white} />
                  <Text style={styles.retryBtnText}>Coba Lagi</Text>
                </TouchableOpacity>
              </View>
            ) : (
              // Empty State
              <View style={styles.centerContainer}>
                <Ionicons name="checkbox-outline" size={44} color={colors.neutral300} />
                <Text style={styles.emptyTitle}>Tidak Ada Tugas</Text>
                <Text style={styles.emptySub}>
                  Semua tugas telah diselesaikan atau belum ada yang ditambahkan.
                </Text>
              </View>
            )
          }
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  keyboardContainer: {
    flex: 1,
  },
  headerReloadBtn: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: colors.primaryLight,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  headerSection: {
    paddingTop: 12,
    paddingBottom: 8,
  },
  apiBanner: {
    backgroundColor: colors.white,
    borderRadius: 14,
    padding: 14,
    marginBottom: 14,
    ...shadows.sm,
    borderWidth: 1,
    borderColor: colors.neutral200,
  },
  apiBannerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral100,
  },
  apiStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  dotLive: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.secondary,
    marginRight: 6,
  },
  apiStatusText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.primary,
  },
  apiHostText: {
    fontSize: 11,
    color: colors.neutral500,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  simulatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  simulatorTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.neutral900,
  },
  simulatorDesc: {
    fontSize: 10,
    color: colors.neutral500,
    marginTop: 2,
  },
  formCard: {
    backgroundColor: colors.white,
    borderRadius: 14,
    padding: 14,
    marginBottom: 14,
    ...shadows.sm,
    borderWidth: 1,
    borderColor: colors.neutral200,
  },
  formLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.neutral900,
    marginBottom: 8,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    backgroundColor: colors.neutral100,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    color: colors.neutral900,
    borderWidth: 1,
    borderColor: colors.neutral200,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    marginLeft: 8,
  },
  addBtnDisabled: {
    opacity: 0.6,
  },
  addBtnText: {
    color: colors.white,
    fontSize: 13,
    fontWeight: '700',
    marginLeft: 4,
  },
  presetLabel: {
    fontSize: 11,
    color: colors.neutral500,
    marginTop: 10,
    marginBottom: 6,
    fontWeight: '600',
  },
  presetList: {
    paddingVertical: 2,
  },
  presetChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    marginRight: 6,
    maxWidth: 240,
  },
  presetText: {
    fontSize: 11,
    color: colors.primaryDark,
    marginLeft: 4,
    fontWeight: '500',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  statBox: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: 10,
    paddingVertical: 8,
    alignItems: 'center',
    marginHorizontal: 3,
    borderWidth: 1,
    borderColor: colors.neutral200,
    ...shadows.sm,
  },
  statBoxActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  statCount: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.neutral900,
  },
  statTitle: {
    fontSize: 10,
    color: colors.neutral500,
    marginTop: 2,
    fontWeight: '600',
  },
  statTextActive: {
    color: colors.primary,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.neutral900,
  },
  sectionSubtitle: {
    fontSize: 11,
    color: colors.neutral500,
  },
  todoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.neutral200,
    ...shadows.sm,
  },
  todoCardCompleted: {
    backgroundColor: '#FAFBFC',
    borderColor: colors.neutral200,
    opacity: 0.85,
  },
  checkArea: {
    paddingRight: 10,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.neutral300,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
  },
  checkboxChecked: {
    backgroundColor: colors.secondary,
    borderColor: colors.secondary,
  },
  todoContent: {
    flex: 1,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  badgeId: {
    fontSize: 9,
    color: colors.neutral500,
    fontWeight: '700',
    marginRight: 6,
  },
  statusPill: {
    fontSize: 9,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 8,
    fontWeight: '600',
  },
  statusPillPending: {
    backgroundColor: colors.warningLight,
    color: colors.warning,
  },
  statusPillDone: {
    backgroundColor: colors.secondaryLight,
    color: colors.secondary,
  },
  todoTitle: {
    fontSize: 13,
    color: colors.neutral900,
    fontWeight: '600',
    lineHeight: 18,
  },
  todoTitleCompleted: {
    color: colors.neutral500,
    textDecorationLine: 'line-through',
  },
  deleteBtn: {
    padding: 8,
    marginLeft: 6,
  },
  centerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 13,
    fontWeight: '600',
    color: colors.neutral700,
  },
  loadingSub: {
    marginTop: 4,
    fontSize: 11,
    color: colors.neutral500,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  errorTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.danger,
    marginTop: 10,
  },
  errorMsg: {
    fontSize: 12,
    color: colors.neutral500,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 16,
  },
  retryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  retryBtnText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '700',
    marginLeft: 6,
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.neutral700,
    marginTop: 8,
  },
  emptySub: {
    fontSize: 12,
    color: colors.neutral500,
    textAlign: 'center',
    marginTop: 4,
  },
});


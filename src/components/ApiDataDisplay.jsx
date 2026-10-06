import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { fetchPenitipanData } from '../services/apiService';
import { colors, shadows } from '../theme/colors';

export default function ApiDataDisplay() {
  const [activeTab, setActiveTab] = useState('slots'); // 'slots' atau 'layanan'
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [apiData, setApiData] = useState({ layanan: [], slots: [] });

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetchPenitipanData();
      if (response.success) {
        setApiData(response.data);
      } else {
        setError(response.message);
      }
    } catch (err) {
      setError(err.message || 'Terjadi kesalahan sistem');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <View style={styles.container}>
      {/* Header Section dengan Indikator Live REST API */}
      <View style={styles.headerRow}>
        <View>
          <View style={styles.badgeApi}>
            <View style={styles.onlineDot} />
            <Text style={styles.badgeApiText}>REST API CONNECTED</Text>
          </View>
          <Text style={styles.sectionTitle}>Status Slot & Layanan</Text>
        </View>

        <TouchableOpacity
          style={styles.refreshBtn}
          onPress={loadData}
          disabled={loading}
          activeOpacity={0.7}
        >
          <Ionicons
            name="refresh"
            size={16}
            color={loading ? colors.neutral300 : colors.primary}
          />
          <Text style={[styles.refreshText, loading && { color: colors.neutral300 }]}>
            Sync
          </Text>
        </TouchableOpacity>
      </View>

      {/* Tab Switcher: Slot Parkir vs Paket Layanan */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'slots' && styles.tabBtnActive]}
          onPress={() => setActiveTab('slots')}
        >
          <Ionicons
            name="grid-outline"
            size={14}
            color={activeTab === 'slots' ? colors.white : colors.neutral500}
          />
          <Text
            style={[
              styles.tabText,
              activeTab === 'slots' && styles.tabTextActive,
            ]}
          >
            Live Slot Parkir ({apiData.slots.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'layanan' && styles.tabBtnActive]}
          onPress={() => setActiveTab('layanan')}
        >
          <Ionicons
            name="pricetags-outline"
            size={14}
            color={activeTab === 'layanan' ? colors.white : colors.neutral500}
          />
          <Text
            style={[
              styles.tabText,
              activeTab === 'layanan' && styles.tabTextActive,
            ]}
          >
            Paket Layanan ({apiData.layanan.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Konten Display Dinamis */}
      {loading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="small" color={colors.primary} />
          <Text style={styles.loadingText}>Mengambil data dari REST API...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorBox}>
          <Ionicons name="alert-circle-outline" size={24} color={colors.danger} />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={loadData}>
            <Text style={styles.retryText}>Coba Lagi</Text>
          </TouchableOpacity>
        </View>
      ) : activeTab === 'slots' ? (
        /* DISPLAY 1: SLOT PARKIR DTO */
        <View style={styles.slotsGrid}>
          {apiData.slots.map((slot) => {
            const isAvail = slot.isAvailable;
            return (
              <View
                key={slot.kodeSlot}
                style={[
                  styles.slotCard,
                  isAvail ? styles.slotCardAvail : styles.slotCardOccupied,
                ]}
              >
                <View style={styles.slotHeader}>
                  <Text style={styles.slotCode}>{slot.kodeSlot}</Text>
                  <View
                    style={[
                      styles.slotStatusBadge,
                      { backgroundColor: isAvail ? colors.secondaryLight : colors.dangerLight },
                    ]}
                  >
                    <Text
                      style={[
                        styles.slotStatusText,
                        { color: isAvail ? colors.secondary : colors.danger },
                      ]}
                    >
                      {slot.statusLabel}
                    </Text>
                  </View>
                </View>

                <Text style={styles.slotZona}>{slot.zona}</Text>
                <Text style={styles.slotTipe}>{slot.tipeMotor}</Text>

                {slot.kendaraanTerparkir ? (
                  <View style={styles.vehicleInfoBox}>
                    <Ionicons name="bicycle" size={13} color={colors.neutral700} />
                    <View style={styles.vehicleTexts}>
                      <Text style={styles.nopolText}>
                        {slot.kendaraanTerparkir.nomorPolisi}
                      </Text>
                      <Text style={styles.ownerText} numberOfLines={1}>
                        {slot.kendaraanTerparkir.pemilik}
                      </Text>
                    </View>
                  </View>
                ) : (
                  <View style={styles.availInfoBox}>
                    <Ionicons name="checkmark-circle-outline" size={13} color={colors.secondary} />
                    <Text style={styles.availText}>Siap Ditempati</Text>
                  </View>
                )}
              </View>
            );
          })}
        </View>
      ) : (
        /* DISPLAY 2: PAKET LAYANAN DTO */
        <View style={styles.layananList}>
          {apiData.layanan.map((item) => (
            <View key={item.id} style={styles.layananCard}>
              <View style={styles.layananHeader}>
                <View style={styles.layananTitleWrap}>
                  <Text style={styles.layananNama}>{item.namaPaket}</Text>
                  <Text style={styles.layananTarif}>{item.formattedTarif}</Text>
                </View>
                <View
                  style={[
                    styles.availBadge,
                    { backgroundColor: item.isTersedia ? colors.primaryLight : colors.neutral100 },
                  ]}
                >
                  <Text
                    style={[
                      styles.availBadgeText,
                      { color: item.isTersedia ? colors.primary : colors.neutral500 },
                    ]}
                  >
                    {item.isTersedia ? 'Aktif' : 'Penuh'}
                  </Text>
                </View>
              </View>

              <Text style={styles.layananDesc}>{item.deskripsi}</Text>

              {/* Fasilitas Tags */}
              <View style={styles.fasilitasWrap}>
                {item.fasilitas.map((f, idx) => (
                  <View key={idx} style={styles.fasilitasChip}>
                    <Ionicons name="checkmark-sharp" size={11} color={colors.secondary} />
                    <Text style={styles.fasilitasText}>{f}</Text>
                  </View>
                ))}
              </View>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    borderRadius: 18,
    padding: 16,
    marginBottom: 20,
    ...shadows.sm,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  badgeApi: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#DEF7EC',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginBottom: 4,
  },
  onlineDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#0E9F6E',
  },
  badgeApiText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#0E9F6E',
    letterSpacing: 0.5,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.neutral900,
  },
  refreshBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  refreshText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: colors.neutral100,
    borderRadius: 12,
    padding: 3,
    marginBottom: 14,
  },
  tabBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    borderRadius: 9,
  },
  tabBtnActive: {
    backgroundColor: colors.primary,
  },
  tabText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.neutral500,
  },
  tabTextActive: {
    color: colors.white,
    fontWeight: '700',
  },
  loadingBox: {
    paddingVertical: 30,
    alignItems: 'center',
    gap: 8,
  },
  loadingText: {
    fontSize: 12,
    color: colors.neutral500,
  },
  errorBox: {
    paddingVertical: 20,
    alignItems: 'center',
    gap: 6,
  },
  errorText: {
    fontSize: 12,
    color: colors.danger,
    textAlign: 'center',
  },
  retryBtn: {
    marginTop: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: colors.dangerLight,
    borderRadius: 8,
  },
  retryText: {
    fontSize: 12,
    color: colors.danger,
    fontWeight: '700',
  },
  // Slots Display
  slotsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  slotCard: {
    width: '48%',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
  },
  slotCardAvail: {
    backgroundColor: '#F9FEFB',
    borderColor: '#DEF7EC',
  },
  slotCardOccupied: {
    backgroundColor: '#FFF9F9',
    borderColor: '#FDE8E8',
  },
  slotHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  slotCode: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.neutral900,
  },
  slotStatusBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  slotStatusText: {
    fontSize: 10,
    fontWeight: '700',
  },
  slotZona: {
    fontSize: 11,
    color: colors.neutral500,
    fontWeight: '500',
  },
  slotTipe: {
    fontSize: 10,
    color: colors.neutral500,
    marginBottom: 8,
  },
  vehicleInfoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.white,
    padding: 6,
    borderRadius: 8,
    marginTop: 2,
  },
  vehicleTexts: { flex: 1 },
  nopolText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.neutral900,
  },
  ownerText: {
    fontSize: 10,
    color: colors.neutral500,
  },
  availInfoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#E8FDF3',
    padding: 6,
    borderRadius: 8,
    marginTop: 2,
  },
  availText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.secondary,
  },
  // Layanan Display
  layananList: {
    gap: 10,
  },
  layananCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    marginBottom: 10,
  },
  layananHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  layananTitleWrap: { flex: 1, marginRight: 8 },
  layananNama: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.neutral900,
  },
  layananTarif: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.primary,
    marginTop: 2,
  },
  availBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  availBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  layananDesc: {
    fontSize: 12,
    color: colors.neutral700,
    lineHeight: 18,
    marginBottom: 12,
  },
  fasilitasWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  fasilitasChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.white,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  fasilitasText: {
    fontSize: 10,
    color: colors.neutral700,
    fontWeight: '500',
  },
});

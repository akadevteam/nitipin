import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Switch,
  Platform,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import LocationMap from '../../components/LocationMap';
import Header from '../../components/Header';
import { colors, shadows } from '../../theme/colors';
import {
  NITIPIN_HUB,
  calculateDistance,
  formatDistance,
  evaluateGeofence,
} from '../../services/locationService';

const { width } = Dimensions.get('window');

export default function LocationScreen({ navigation }) {
  // ── State Lokasi & GPS (Task 01) ──────────────────────────────
  const [permissionStatus, setPermissionStatus] = useState(null); // 'granted' | 'denied' | 'undetermined'
  const [loading, setLoading] = useState(false);
  const [coords, setCoords] = useState(null); // { latitude, longitude, accuracy, timestamp }
  const [errorMsg, setErrorMsg] = useState(null);

  // ── State Reverse Geocoding (Task 03A) ────────────────────────
  const [addressData, setAddressData] = useState(null);
  const [geocodingLoading, setGeocodingLoading] = useState(false);

  // ── State Battery Optimization & Live Tracking (Slide 15) ─────
  const [isLiveTracking, setIsLiveTracking] = useState(false);
  const subscriptionRef = useRef(null);

  // ── State Geofencing (Task 03B) ───────────────────────────────
  const [geofenceState, setGeofenceState] = useState({
    isInside: false,
    distance: 0,
    radius: NITIPIN_HUB.radius,
  });
  const prevInsideRef = useRef(null);

  // ── Ref Peta (Task 02) ────────────────────────────────────────
  const mapRef = useRef(null);

  // ── 1. Cek & Minta Izin Lokasi ────────────────────────────────
  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      setPermissionStatus(status);
      if (status !== 'granted') {
        setErrorMsg('Izin akses lokasi GPS ditolak oleh pengguna.');
        Alert.alert(
          'Izin Lokasi Diperlukan',
          'Aplikasi membutuhkan izin lokasi untuk menampilkan posisi Anda pada peta dan mendeteksi area penitipan.'
        );
        return false;
      }
      return true;
    } catch (err) {
      setErrorMsg(err.message);
      return false;
    }
  };

  // ── 2. Reverse Geocoding (Task 03A) ───────────────────────────
  // Platform web: gunakan Nominatim (OpenStreetMap) karena expo-location
  // menggunakan Google Geocoding API yang sudah dihapus sejak SDK 49 di web.
  // Platform native (Android/iOS): gunakan Location.reverseGeocodeAsync() seperti biasa.
  const fetchAddress = async (latitude, longitude) => {
    try {
      setGeocodingLoading(true);

      if (Platform.OS === 'web') {
        // ── Nominatim (OSM) untuk Web — tanpa API key, gratis ──
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
          {
            headers: {
              'User-Agent': 'NitipinApp/1.0 (expo-web)',
              'Accept-Language': 'id,en',
            },
          }
        );
        if (!response.ok) throw new Error('Nominatim gagal merespons');
        const data = await response.json();
        const addr = data.address || {};
        // Normalisasikan ke format yang sama dengan expo-location untuk kompatibilitas tampilan
        setAddressData({
          street: addr.road || addr.pedestrian || addr.path || null,
          district: addr.suburb || addr.village || addr.county || null,
          subregion: addr.city_district || addr.municipality || null,
          city: addr.city || addr.town || addr.county || null,
          region: addr.state || null,
          country: addr.country || null,
          postalCode: addr.postcode || null,
          _rawDisplayName: data.display_name || null,
        });
      } else {
        // ── expo-location untuk Android / iOS (native) ──
        const results = await Location.reverseGeocodeAsync({ latitude, longitude });
        if (results && results.length > 0) {
          setAddressData(results[0]);
        }
      }
    } catch (err) {
      console.log('Reverse geocode error:', err);
      setAddressData(null);
    } finally {
      setGeocodingLoading(false);
    }
  };

  // ── 3. Ambil Lokasi Saat Ini (Task 01) ─────────────────────────
  const fetchCurrentLocation = useCallback(async () => {
    setLoading(true);
    setErrorMsg(null);

    try {
      const hasPermission = await requestLocationPermission();
      if (!hasPermission) {
        setLoading(false);
        return;
      }

      // Slide 15: Optimasi Akurasi Seimbang (Balanced) untuk efisiensi baterai
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const userCoords = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        accuracy: location.coords.accuracy,
        timestamp: location.timestamp,
      };

      setCoords(userCoords);

      // Evaluasi Geofencing
      const geo = evaluateGeofence(userCoords, NITIPIN_HUB);
      setGeofenceState(geo);

      // Trigger Reverse Geocoding
      fetchAddress(userCoords.latitude, userCoords.longitude);

      // Pusatkan peta ke lokasi pengguna
      if (mapRef.current) {
        mapRef.current.animateToRegion(
          {
            latitude: userCoords.latitude,
            longitude: userCoords.longitude,
            latitudeDelta: 0.015,
            longitudeDelta: 0.015,
          },
          1000
        );
      }
    } catch (err) {
      setErrorMsg(err.message || 'Gagal mengambil koordinat GPS');
      Alert.alert('Gagal Mendapatkan Lokasi', err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // ── 4. Toggle Pelacakan Real-time (Optimasi Baterai Slide 15) ─
  const toggleLiveTracking = async (enable) => {
    if (enable) {
      const hasPerm = await requestLocationPermission();
      if (!hasPerm) return;

      setIsLiveTracking(true);
      try {
        // Konfigurasi hemat baterai: interval 5000ms & jarak minimal 10m
        const sub = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.Balanced,
            timeInterval: 5000,
            distanceInterval: 10,
          },
          (loc) => {
            const userCoords = {
              latitude: loc.coords.latitude,
              longitude: loc.coords.longitude,
              accuracy: loc.coords.accuracy,
              timestamp: loc.timestamp,
            };
            setCoords(userCoords);

            // Cek status geofencing real-time
            const geo = evaluateGeofence(userCoords, NITIPIN_HUB);
            setGeofenceState(geo);

            // Notifikasi Event Masuk / Keluar Area (Task 03B)
            if (prevInsideRef.current !== null && prevInsideRef.current !== geo.isInside) {
              if (geo.isInside) {
                Alert.alert(
                  '🎉 Masuk Area Geofence!',
                  'Anda telah memasuki area NITIPIN Hub Sentral. Silakan lakukan check-in penitipan motor.'
                );
              } else {
                Alert.alert(
                  '📍 Keluar Area Geofence',
                  'Anda telah keluar dari area radius penitipan motor.'
                );
              }
            }
            prevInsideRef.current = geo.isInside;
          }
        );
        subscriptionRef.current = sub;
      } catch (err) {
        Alert.alert('Gagal Menjalankan Live Tracking', err.message);
        setIsLiveTracking(false);
      }
    } else {
      // Hentikan subscription (Slide 15: Clean-up resource)
      if (subscriptionRef.current) {
        subscriptionRef.current.remove();
        subscriptionRef.current = null;
      }
      setIsLiveTracking(false);
    }
  };

  // Clean-up saat screen unmount
  useEffect(() => {
    fetchCurrentLocation();

    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current.remove();
        subscriptionRef.current = null;
      }
    };
  }, [fetchCurrentLocation]);

  // ── 5. Simulator Geofence (Mempermudah Demo Dosen di Kelas) ───
  const simulatePosition = (type) => {
    let mockCoords;
    if (type === 'inside') {
      // Koordinat dalam radius 150 meter dari Hub Sentral
      mockCoords = {
        latitude: -7.9672,
        longitude: 112.6328,
        accuracy: 8.5,
        timestamp: Date.now(),
      };
    } else {
      // Koordinat di luar radius (sekitar 2 km dari Hub)
      mockCoords = {
        latitude: -7.982,
        longitude: 112.645,
        accuracy: 15.0,
        timestamp: Date.now(),
      };
    }

    setCoords(mockCoords);
    const geo = evaluateGeofence(mockCoords, NITIPIN_HUB);
    setGeofenceState(geo);
    fetchAddress(mockCoords.latitude, mockCoords.longitude);

    if (mapRef.current) {
      mapRef.current.animateToRegion(
        {
          latitude: mockCoords.latitude,
          longitude: mockCoords.longitude,
          latitudeDelta: 0.02,
          longitudeDelta: 0.02,
        },
        800
      );
    }

    Alert.alert(
      type === 'inside' ? 'Simulasi: Dalam Geofence ✅' : 'Simulasi: Luar Geofence 📍',
      type === 'inside'
        ? `Pengguna disimulasikan berada ${formatDistance(geo.distance)} dari Hub (DI DALAM RADIUS ${NITIPIN_HUB.radius}m).`
        : `Pengguna disimulasikan berada ${formatDistance(geo.distance)} dari Hub (DI LUAR RADIUS ${NITIPIN_HUB.radius}m).`
    );
  };

  // Format teks alamat
  // Web: Nominatim menyediakan _rawDisplayName sebagai teks lengkap siap pakai
  // Native: gabungkan field-field dari expo-location
  const formattedAddress = addressData
    ? (addressData._rawDisplayName
        ? addressData._rawDisplayName
        : [
            addressData.street,
            addressData.district || addressData.subregion,
            addressData.city,
            addressData.region,
            addressData.postalCode,
          ]
            .filter(Boolean)
            .join(', '))
    : 'Memuat alamat lokasi...';

  // Region awal peta
  const initialMapRegion = {
    latitude: coords ? coords.latitude : NITIPIN_HUB.latitude,
    longitude: coords ? coords.longitude : NITIPIN_HUB.longitude,
    latitudeDelta: 0.02,
    longitudeDelta: 0.02,
  };

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      {/* Header Navigasi */}
      <Header
        title="Peta & Lokasi Penitipan"
        subtitle="Location-Based Services · Week 10"
        showBack
        onBack={() => navigation.goBack()}
        rightComponent={
          <TouchableOpacity
            style={styles.headerBtn}
            onPress={fetchCurrentLocation}
            disabled={loading}
          >
            <Ionicons
              name="refresh"
              size={18}
              color={loading ? colors.neutral300 : colors.primary}
            />
          </TouchableOpacity>
        }
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Banner Status Geofencing (Task 03B) ──────────────── */}
        <View
          style={[
            styles.geofenceBanner,
            geofenceState.isInside ? styles.geofenceInside : styles.geofenceOutside,
          ]}
        >
          <View style={styles.geofenceIconWrap}>
            <Ionicons
              name={geofenceState.isInside ? 'checkmark-circle' : 'navigate-circle'}
              size={28}
              color={geofenceState.isInside ? colors.secondary : colors.warning}
            />
          </View>
          <View style={{ flex: 1 }}>
            <View style={styles.geofenceHeaderRow}>
              <Text
                style={[
                  styles.geofenceBadge,
                  geofenceState.isInside ? styles.badgeInside : styles.badgeOutside,
                ]}
              >
                {geofenceState.isInside ? 'DALAM AREA GEOFENCE' : 'DI LUAR AREA GEOFENCE'}
              </Text>
              <Text style={styles.geofenceDistance}>
                Jarak: {formatDistance(geofenceState.distance)}
              </Text>
            </View>
            <Text style={styles.geofenceTitle}>
              {geofenceState.isInside
                ? 'Anda Berada di Area NITIPIN Hub Sentral'
                : 'Di Luar Jangkauan Penitipan'}
            </Text>
            <Text style={styles.geofenceDesc}>
              {geofenceState.isInside
                ? `Berada dalam radius ${NITIPIN_HUB.radius}m. Anda dapat langsung check-in dan menitipkan motor.`
                : `Masuk dalam radius ${NITIPIN_HUB.radius}m dari Hub untuk proses verifikasi penitipan.`}
            </Text>
          </View>
        </View>

        {/* ── Task 02: Peta Interaktif (Maps SDK) ───────────────── */}
        <LocationMap
          ref={mapRef}
          initialRegion={initialMapRegion}
          userCoords={coords}
          hubCoords={NITIPIN_HUB}
          geofenceState={geofenceState}
          onLocateUser={() => {
            if (coords && mapRef.current) {
              mapRef.current.animateToRegion({
                latitude: coords.latitude,
                longitude: coords.longitude,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
              });
            }
          }}
          onLocateHub={() => {
            if (mapRef.current) {
              mapRef.current.animateToRegion({
                latitude: NITIPIN_HUB.latitude,
                longitude: NITIPIN_HUB.longitude,
                latitudeDelta: 0.015,
                longitudeDelta: 0.015,
              });
            }
          }}
          style={{ marginBottom: 14 }}
        />

        {/* ── Task 01: Card GPS & Koordinat (Persis Slide 12) ──── */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.cardIconBox}>
              <Ionicons name="location" size={20} color={colors.primary} />
            </View>
            <View>
              <Text style={styles.cardTitle}>Lokasi Saat Ini</Text>
              <Text style={styles.cardSubtitle}>Koordinat GPS & Akurasi Perangkat</Text>
            </View>
          </View>

          <View style={styles.coordTable}>
            <View style={styles.coordRow}>
              <View style={styles.coordLabelRow}>
                <Ionicons name="navigate-outline" size={16} color={colors.neutral500} />
                <Text style={styles.coordLabel}>Latitude</Text>
              </View>
              <Text style={styles.coordValue}>
                {coords ? coords.latitude.toFixed(6) : '-'}
              </Text>
            </View>

            <View style={styles.coordRow}>
              <View style={styles.coordLabelRow}>
                <Ionicons name="compass-outline" size={16} color={colors.neutral500} />
                <Text style={styles.coordLabel}>Longitude</Text>
              </View>
              <Text style={styles.coordValue}>
                {coords ? coords.longitude.toFixed(6) : '-'}
              </Text>
            </View>

            <View style={[styles.coordRow, { borderBottomWidth: 0 }]}>
              <View style={styles.coordLabelRow}>
                <Ionicons name="cellular-outline" size={16} color={colors.neutral500} />
                <Text style={styles.coordLabel}>Accuracy</Text>
              </View>
              <Text style={[styles.coordValue, { color: colors.secondary }]}>
                {coords && coords.accuracy != null
                  ? `± ${coords.accuracy.toFixed(1)} m`
                  : 'Mendeteksi...'}
              </Text>
            </View>
          </View>

          {/* Tombol Ambil Lokasi (Slide 12) */}
          <TouchableOpacity
            style={[styles.actionBtn, loading && styles.actionBtnDisabled]}
            onPress={fetchCurrentLocation}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator size="small" color={colors.white} />
            ) : (
              <>
                <Ionicons name="locate-outline" size={18} color={colors.white} />
                <Text style={styles.actionBtnText}>Ambil Lokasi (GPS)</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* ── Task 03A: Reverse Geocoding (Persis Slide 14A) ────── */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={[styles.cardIconBox, { backgroundColor: colors.purpleLight }]}>
              <Ionicons name="home-outline" size={20} color={colors.purple} />
            </View>
            <View>
              <Text style={styles.cardTitle}>Alamat Saat Ini (Reverse Geocoding)</Text>
              <Text style={styles.cardSubtitle}>Konversi Koordinat Menjadi Alamat Terbaca</Text>
            </View>
          </View>

          <View style={styles.addressBox}>
            {geocodingLoading ? (
              <View style={styles.addressLoading}>
                <ActivityIndicator size="small" color={colors.purple} />
                <Text style={styles.addressLoadingText}>Mencari nama jalan & alamat...</Text>
              </View>
            ) : (
              <>
                <Text style={styles.addressText}>{formattedAddress}</Text>
                {addressData && (
                  <View style={styles.addressBadgesRow}>
                    {addressData.district && (
                      <Text style={styles.addressPill}>Kec. {addressData.district}</Text>
                    )}
                    {addressData.city && (
                      <Text style={styles.addressPill}>{addressData.city}</Text>
                    )}
                    {addressData.postalCode && (
                      <Text style={styles.addressPill}>Kode Pos: {addressData.postalCode}</Text>
                    )}
                  </View>
                )}
              </>
            )}
          </View>
        </View>

        {/* ── Slide 15: Optimasi Baterai & Live Tracking ───────── */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={[styles.cardIconBox, { backgroundColor: colors.secondaryLight }]}>
              <Ionicons name="battery-charging-outline" size={20} color={colors.secondary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.cardTitle}>Pelacakan Efisien & Hemat Baterai</Text>
              <Text style={styles.cardSubtitle}>Slide 15: Balanced Accuracy & Interval Control</Text>
            </View>
            <Switch
              value={isLiveTracking}
              onValueChange={toggleLiveTracking}
              trackColor={{ false: colors.neutral200, true: colors.secondaryLight }}
              thumbColor={isLiveTracking ? colors.secondary : colors.white}
            />
          </View>

          <View style={styles.batteryTips}>
            <View style={styles.tipRow}>
              <Ionicons name="checkmark-circle" size={14} color={colors.secondary} />
              <Text style={styles.tipText}>
                <Text style={{ fontWeight: '700' }}>Akurasi Seimbang:</Text> Mode Balanced
                menghemat daya hingga 60% dibanding High GPS terus-menerus.
              </Text>
            </View>
            <View style={styles.tipRow}>
              <Ionicons name="checkmark-circle" size={14} color={colors.secondary} />
              <Text style={styles.tipText}>
                <Text style={{ fontWeight: '700' }}>Filter Jarak (10m):</Text> Lokasi hanya
                diperbarui jika perangkat berpindah minimal 10 meter.
              </Text>
            </View>
            <View style={styles.tipRow}>
              <Ionicons name="checkmark-circle" size={14} color={colors.secondary} />
              <Text style={styles.tipText}>
                <Text style={{ fontWeight: '700' }}>Auto Cleanup:</Text> Listener otomatis dimatikan
                saat Anda meninggalkan halaman ini.
              </Text>
            </View>
          </View>
        </View>

        {/* ── Demo Simulator (Bantuan Presentasi di Kelas) ─────── */}
        <View style={[styles.card, { borderColor: colors.primary, borderWidth: 1 }]}>
          <View style={styles.cardHeader}>
            <View style={[styles.cardIconBox, { backgroundColor: colors.primaryLight }]}>
              <Ionicons name="flask-outline" size={20} color={colors.primary} />
            </View>
            <View>
              <Text style={styles.cardTitle}>Simulator Geofencing (Uji Demo)</Text>
              <Text style={styles.cardSubtitle}>Uji coba event Masuk & Keluar area radius</Text>
            </View>
          </View>

          <View style={styles.simButtonsRow}>
            <TouchableOpacity
              style={[styles.simBtn, { backgroundColor: colors.secondary }]}
              onPress={() => simulatePosition('inside')}
              activeOpacity={0.8}
            >
              <Ionicons name="enter-outline" size={16} color={colors.white} />
              <Text style={styles.simBtnText}>Masuk Area Hub</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.simBtn, { backgroundColor: colors.warning }]}
              onPress={() => simulatePosition('outside')}
              activeOpacity={0.8}
            >
              <Ionicons name="exit-outline" size={16} color={colors.white} />
              <Text style={styles.simBtnText}>Keluar Area Hub</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  headerBtn: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: colors.primaryLight,
  },
  scroll: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  geofenceBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 14,
    marginBottom: 14,
    borderWidth: 1.5,
    ...shadows.sm,
  },
  geofenceInside: {
    backgroundColor: '#F0FDF4',
    borderColor: colors.secondary,
  },
  geofenceOutside: {
    backgroundColor: '#FFFBEB',
    borderColor: colors.warning,
  },
  geofenceIconWrap: {
    marginRight: 12,
  },
  geofenceHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  geofenceBadge: {
    fontSize: 9,
    fontWeight: '800',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  badgeInside: {
    backgroundColor: colors.secondary,
    color: colors.white,
  },
  badgeOutside: {
    backgroundColor: colors.warning,
    color: colors.white,
  },
  geofenceDistance: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.neutral700,
  },
  geofenceTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.neutral900,
  },
  geofenceDesc: {
    fontSize: 11,
    color: colors.neutral600,
    marginTop: 2,
    lineHeight: 16,
  },
  mapContainer: {
    height: 240,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 14,
    borderWidth: 1,
    borderColor: colors.neutral200,
    position: 'relative',
    ...shadows.sm,
  },
  map: {
    width: '100%',
    height: '100%',
  },
  mapControls: {
    position: 'absolute',
    right: 12,
    bottom: 12,
    gap: 8,
  },
  mapCtrlBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.md,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 14,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: colors.neutral200,
    ...shadows.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardIconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.neutral900,
  },
  cardSubtitle: {
    fontSize: 11,
    color: colors.neutral500,
    marginTop: 1,
  },
  coordTable: {
    backgroundColor: colors.neutral100,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginBottom: 12,
  },
  coordRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral200,
  },
  coordLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  coordLabel: {
    fontSize: 13,
    color: colors.neutral700,
    fontWeight: '500',
  },
  coordValue: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.neutral900,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingVertical: 12,
    borderRadius: 10,
    gap: 8,
  },
  actionBtnDisabled: {
    opacity: 0.6,
  },
  actionBtnText: {
    color: colors.white,
    fontSize: 13,
    fontWeight: '700',
  },
  addressBox: {
    backgroundColor: colors.neutral100,
    borderRadius: 10,
    padding: 12,
  },
  addressLoading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
  },
  addressLoadingText: {
    fontSize: 12,
    color: colors.neutral500,
  },
  addressText: {
    fontSize: 13,
    color: colors.neutral900,
    fontWeight: '600',
    lineHeight: 18,
  },
  addressBadgesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 8,
  },
  addressPill: {
    fontSize: 10,
    backgroundColor: colors.purpleLight,
    color: colors.purple,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    fontWeight: '600',
  },
  batteryTips: {
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    padding: 10,
    gap: 6,
  },
  tipRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
  },
  tipText: {
    fontSize: 11,
    color: colors.neutral700,
    flex: 1,
    lineHeight: 16,
  },
  simButtonsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  simBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  simBtnText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '700',
  },
});

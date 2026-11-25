import React, { forwardRef } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import MapView, { Marker, Circle } from 'react-native-maps';
import { colors, shadows } from '../theme/colors';

const LocationMap = forwardRef(
  (
    {
      initialRegion,
      userCoords,
      hubCoords,
      geofenceState,
      onLocateUser,
      onLocateHub,
      style,
    },
    ref
  ) => {
    return (
      <View style={[styles.container, style]}>
        <MapView
          ref={ref}
          style={styles.map}
          initialRegion={initialRegion}
          showsUserLocation={false}
          showsMyLocationButton={false}
        >
          {/* Lingkaran Virtual Geofence Radius 500m */}
          {hubCoords && (
            <Circle
              center={{
                latitude: hubCoords.latitude,
                longitude: hubCoords.longitude,
              }}
              radius={hubCoords.radius || 500}
              fillColor={
                geofenceState?.isInside
                  ? 'rgba(14, 159, 110, 0.2)'
                  : 'rgba(26, 86, 219, 0.18)'
              }
              strokeColor={geofenceState?.isInside ? colors.secondary : colors.primary}
              strokeWidth={2}
            />
          )}

          {/* Marker Hub Penitipan NITIPIN */}
          {hubCoords && (
            <Marker
              coordinate={{
                latitude: hubCoords.latitude,
                longitude: hubCoords.longitude,
              }}
              title={hubCoords.name}
              description={`Radius Geofence: ${hubCoords.radius}m`}
              pinColor={colors.primary}
            />
          )}

          {/* Marker Posisi Pengguna */}
          {userCoords && (
            <Marker
              coordinate={{
                latitude: userCoords.latitude,
                longitude: userCoords.longitude,
              }}
              title="Lokasi Saya"
              description={`Akurasi: ±${
                userCoords.accuracy ? userCoords.accuracy.toFixed(1) : '0'
              } m`}
              pinColor={geofenceState?.isInside ? colors.secondary : colors.danger}
            />
          )}
        </MapView>

        {/* Tombol Kontrol Peta Terapung */}
        <View style={styles.mapControls}>
          <TouchableOpacity
            style={styles.mapCtrlBtn}
            onPress={onLocateUser}
            activeOpacity={0.8}
          >
            <Ionicons name="locate" size={20} color={colors.primary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.mapCtrlBtn}
            onPress={onLocateHub}
            activeOpacity={0.8}
          >
            <Ionicons name="business" size={20} color={colors.secondary} />
          </TouchableOpacity>
        </View>
      </View>
    );
  }
);

LocationMap.displayName = 'LocationMapNative';

const styles = StyleSheet.create({
  container: {
    height: 240,
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 1,
    borderColor: colors.neutral200,
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
});

export default LocationMap;

import React, { forwardRef, useImperativeHandle, useRef, useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, shadows } from '../theme/colors';

const LocationMapWeb = forwardRef(
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
    const iframeRef = useRef(null);
    const [centerCoords, setCenterCoords] = useState({
      lat: userCoords ? userCoords.latitude : (hubCoords ? hubCoords.latitude : -7.9666),
      lng: userCoords ? userCoords.longitude : (hubCoords ? hubCoords.longitude : 112.6326),
    });

    useImperativeHandle(ref, () => ({
      animateToRegion: (region) => {
        if (region && region.latitude && region.longitude) {
          setCenterCoords({ lat: region.latitude, lng: region.longitude });
        }
      },
    }));

    useEffect(() => {
      if (userCoords && userCoords.latitude && userCoords.longitude) {
        setCenterCoords({ lat: userCoords.latitude, lng: userCoords.longitude });
      }
    }, [userCoords?.latitude, userCoords?.longitude]);

    // Koordinat Hub dan User untuk Leaflet
    const hubLat = hubCoords?.latitude || -7.9666;
    const hubLng = hubCoords?.longitude || 112.6326;
    const hubRadius = hubCoords?.radius || 500;
    const hubName = hubCoords?.name || 'NITIPIN Hub Sentral';

    const userLat = userCoords?.latitude;
    const userLng = userCoords?.longitude;
    const isInside = Boolean(geofenceState?.isInside);

    // HTML interaktif Leaflet untuk Web
    const mapHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
        <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
        <style>
          html, body, #map { height: 100%; margin: 0; padding: 0; }
          .leaflet-popup-content-wrapper { border-radius: 8px; font-family: sans-serif; }
        </style>
      </head>
      <body>
        <div id="map"></div>
        <script>
          const map = L.map('map', { zoomControl: true }).setView([${centerCoords.lat}, ${centerCoords.lng}], 15);
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap'
          }).addTo(map);

          // Geofence Circle
          const circleColor = '${isInside ? '#0E9F6E' : '#1A56DB'}';
          L.circle([${hubLat}, ${hubLng}], {
            color: circleColor,
            fillColor: circleColor,
            fillOpacity: 0.18,
            radius: ${hubRadius}
          }).addTo(map);

          // Marker Hub
          const hubMarker = L.marker([${hubLat}, ${hubLng}]).addTo(map)
            .bindPopup('<b>${hubName}</b><br>Radius Geofence: ${hubRadius}m');

          ${
            userLat && userLng
              ? `
          // Marker User
          const userMarker = L.marker([${userLat}, ${userLng}]).addTo(map)
            .bindPopup('<b>Lokasi Saya</b><br>${isInside ? '✅ Dalam Geofence' : '📍 Luar Geofence'}');
          `
              : ''
          }
        </script>
      </body>
      </html>
    `;

    return (
      <View style={[styles.container, style]}>
        <iframe
          ref={iframeRef}
          srcDoc={mapHtml}
          title="NITIPIN OpenStreetMap"
          style={{
            width: '100%',
            height: '100%',
            border: 'none',
          }}
        />

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

        {/* Badge Info Web */}
        <View style={styles.webBadge}>
          <Text style={styles.webBadgeText}>🌐 Web Interactive Map (OSM)</Text>
        </View>
      </View>
    );
  }
);

LocationMapWeb.displayName = 'LocationMapWeb';

const styles = StyleSheet.create({
  container: {
    height: 240,
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 1,
    borderColor: colors.neutral200,
    backgroundColor: '#E5E7EB',
    ...shadows.sm,
  },
  mapControls: {
    position: 'absolute',
    right: 12,
    bottom: 12,
    gap: 8,
    zIndex: 10,
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
  webBadge: {
    position: 'absolute',
    left: 8,
    top: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    zIndex: 10,
  },
  webBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.neutral700,
  },
});

export default LocationMapWeb;

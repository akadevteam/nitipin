// ============================================================
// LOCATION SERVICE — LOCATION-BASED SERVICES (WEEK 10)
// Modul kalkulasi GPS, Haversine Distance, dan Geofencing
// ============================================================

/**
 * Titik Lokasi Hub Penitipan Utama NITIPIN
 * Lokasi: Universitas Muhammadiyah Malang (UMM), Jl. Raya Tlogomas No. 246, Malang
 */
export const NITIPIN_HUB = {
  id: 'hub-sentral',
  name: 'NITIPIN Hub Sentral (UMM)',
  latitude: -7.9208595,
  longitude: 112.5971615,
  radius: 500, // Radius Geofence dalam meter (sesuai Slide 10: 500m)
  address: 'Universitas Muhammadiyah Malang, Jl. Raya Tlogomas No. 246, Malang',
};

/**
 * Menghitung jarak antara dua koordinat GPS menggunakan formula Haversine
 * @returns Jarak dalam satuan Meter
 */
export function calculateDistance(lat1, lon1, lat2, lon2) {
  if (lat1 == null || lon1 == null || lat2 == null || lon2 == null) return 0;

  const R = 6371000; // Radius Bumi dalam meter
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

function toRad(degrees) {
  return (degrees * Math.PI) / 180;
}

/**
 * Format jarak agar rapi ditampilkan ke antarmuka (m / km)
 */
export function formatDistance(meters) {
  if (meters == null || isNaN(meters)) return '-';
  if (meters < 1000) {
    return `${Math.round(meters)} m`;
  }
  return `${(meters / 1000).toFixed(2)} km`;
}

/**
 * Cek status geofencing apakah pengguna berada dalam batas virtual radius
 */
export function evaluateGeofence(userCoords, hubCoords = NITIPIN_HUB) {
  if (!userCoords || userCoords.latitude == null || userCoords.longitude == null) {
    return {
      isInside: false,
      distance: 0,
      radius: hubCoords.radius,
    };
  }

  const distance = calculateDistance(
    userCoords.latitude,
    userCoords.longitude,
    hubCoords.latitude,
    hubCoords.longitude
  );

  return {
    isInside: distance <= hubCoords.radius,
    distance,
    radius: hubCoords.radius,
  };
}

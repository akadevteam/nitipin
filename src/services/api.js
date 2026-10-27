// Konfigurasi Base URL Backend API
// Jika menjalankan di HP fisik via Expo Go: ganti 'localhost' dengan IP Wi-Fi komputer Anda (misal: 'http://192.168.1.5:5000/api')
import { Platform } from 'react-native';

// IP Wi-Fi laptop Anda saat ini: 192.168.0.10
export const API_BASE_URL = 'http://192.168.0.10:5000/api';


class ApiClient {
  constructor() {
    this.token = null;
  }

  setToken(token) {
    this.token = token;
  }

  getHeaders() {
    const headers = {
      'Content-Type': 'application/json',
    };
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    return headers;
  }

  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const headers = { ...this.getHeaders(), ...(options.headers || {}) };

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message || `Request gagal (${response.status})`);
      }

      return data;
    } catch (error) {
      console.warn(`[API ERROR] ${options.method || 'GET'} ${endpoint}:`, error.message);
      throw error;
    }
  }

  // Auth
  login(email, password) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  register(userData) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  getMe() {
    return this.request('/auth/me');
  }

  // Bookings
  getBookings() {
    return this.request('/bookings');
  }

  getBookingById(id) {
    return this.request(`/bookings/${id}`);
  }

  createBooking(bookingData) {
    return this.request('/bookings', {
      method: 'POST',
      body: JSON.stringify(bookingData),
    });
  }

  updateBooking(id, patchData) {
    return this.request(`/bookings/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(patchData),
    });
  }

  // Monitorings
  getMonitoring(bookingId) {
    return this.request(`/monitorings/${bookingId}`);
  }

  saveMonitoring(data) {
    return this.request('/monitorings', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Layanan & Slots
  getLayanan() {
    return this.request('/layanan');
  }

  getSlots() {
    return this.request('/slots');
  }
}

export const api = new ApiClient();

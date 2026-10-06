# 🛵 NITIPIN — Aplikasi Penitipan Motor Terpercaya

> **NITIPIN** adalah aplikasi mobile berbasis React Native (Expo) untuk manajemen penitipan motor. Tersedia dua peran pengguna: **Customer** (pemilik motor) dan **Pengelola** (pemilik jasa penitipan).

---

## 📱 Screenshot & Tampilan

Aplikasi ini dijalankan melalui **Expo Go** di perangkat Android. Semua teks antarmuka menggunakan **Bahasa Indonesia**.

---

## 🚀 Tech Stack

| Teknologi | Versi / Keterangan |
|---|---|
| React Native | via Expo SDK |
| Expo | ~51.x |
| JavaScript / JSX | (bukan TypeScript) |
| React Navigation | v6 — Bottom Tabs + Native Stack |
| expo-image-picker | Upload foto kamera & galeri |
| expo-speech | Text-to-Speech Bahasa Indonesia |
| react-native-safe-area-context | Safe area / notch handling |
| State Management | React Context API (tanpa Redux) |
| Backend / Database | ❌ Tidak ada — semua data dummy (in-memory) |

---

## 📁 Struktur Folder

```
nitipin/
├── App.js                        # Entry point, SafeAreaProvider, AppNavigator
├── app.json                      # Konfigurasi Expo
├── package.json
│
└── src/
    ├── context/
    │   └── AppContext.js          # Global state: user, bookings, monitoring
    │
    ├── data/
    │   ├── dummyData.js           # Dummy users, bookings, monitoring records
    │   └── penitipan_api.json     # Simulasi REST API (slot parkir & paket layanan)
    │
    ├── models/
    │   ├── LayananModel.js        # DTO + mapper untuk paket layanan
    │   └── SlotModel.js           # DTO + mapper untuk slot parkir
    │
    ├── services/
    │   └── apiService.js          # Fetch & parse penitipan_api.json → DTO
    │
    ├── theme/
    │   └── colors.js              # Palet warna, shadows, statusColors
    │
    ├── utils/
    │   └── helpers.js             # formatCurrency, formatDate, TTS generators, dll.
    │
    ├── navigation/
    │   ├── AppNavigator.jsx       # Root: Auth / Customer / Pengelola switcher
    │   ├── CustomerNavigator.jsx  # Bottom tabs customer (Beranda, Booking, dll.)
    │   └── PengelolaNavigator.jsx # Bottom tabs pengelola (Dashboard, dll.)
    │
    ├── components/                # Reusable UI components
    │   ├── Button.jsx
    │   ├── Input.jsx
    │   ├── Card.jsx
    │   ├── Header.jsx
    │   ├── StatusBadge.jsx
    │   ├── VehicleCard.jsx
    │   ├── BookingCard.jsx
    │   ├── MonitoringCard.jsx
    │   ├── ConditionCard.jsx
    │   ├── PaymentMethodCard.jsx
    │   ├── TTSButton.jsx
    │   ├── ApiDataDisplay.jsx     # Tampilan REST API: tab Slot Parkir & Paket Layanan
    │   └── PhotoUploader.jsx      # Upload foto via kamera atau galeri
    │
    └── screens/
        ├── auth/
        │   ├── LoginScreen.jsx
        │   └── RegisterScreen.jsx
        │
        ├── customer/
        │   ├── HomeScreen.jsx
        │   ├── BookingScreen.jsx         # Form booking + upload foto motor
        │   ├── BookingDetailScreen.jsx
        │   ├── PaymentScreen.jsx
        │   ├── MonitoringScreen.jsx
        │   ├── ConditionReportScreen.jsx
        │   ├── HistoryScreen.jsx
        │   └── ProfileScreen.jsx
        │
        └── pengelola/
            ├── DashboardScreen.jsx
            ├── BookingListScreen.jsx
            ├── BookingDetailScreen.jsx
            ├── MotorListScreen.jsx
            ├── MonitoringFormScreen.jsx  # Form monitoring + upload foto kondisi
            └── ProfileScreen.jsx
```

---

## ⚙️ Prerequisites

- **Node.js** v18+ dan **npm** v9+
- **Expo Go** terinstall di perangkat Android
  - Download: [https://expo.dev/go](https://expo.dev/go)
- (Opsional) **Expo CLI** global: `npm install -g expo-cli`

---

## 🔧 Instalasi & Menjalankan

```bash
# 1. Masuk ke folder proyek
cd C:\Users\LENOVO\.gemini\antigravity\scratch\nitipin

# 2. Install dependencies
npm install

# 3. Jalankan development server
npx expo start
```

Setelah server berjalan:
- Scan QR code yang muncul di terminal menggunakan **Expo Go** (Android)
- Atau tekan `a` di terminal untuk membuka di Android emulator

> **Catatan:** Jika PowerShell menolak script execution, gunakan `cmd /c "npx expo start"` sebagai alternatif.

---

## 🔑 Akun Demo Login

| Email | Password | Peran | Keterangan |
|---|---|---|---|
| `budi@gmail.com` | `123456` | Customer | Memiliki booking aktif (sedang dititipkan) |
| `siti@gmail.com` | `123456` | Customer | Belum ada booking aktif |
| `andi@gmail.com` | `123456` | Customer | Memiliki riwayat booking |
| `pengelola@nitipin.id` | `admin123` | Pengelola | Akses dashboard pengelola |

> Anda juga bisa **membuat akun baru** sebagai Customer melalui tombol "Buat Akun" di halaman login.

---

## ✨ Fitur Utama

### 👤 Customer

| Fitur | Deskripsi |
|---|---|
| **Login & Register** | Masuk atau daftar akun baru |
| **Booking Penitipan** | Isi form data motor + upload foto kendaraan |
| **Konfirmasi & Pembayaran** | Pilih metode: Tunai, QRIS, atau Transfer Bank |
| **Monitoring Motor** | Lihat foto & status terkini motor yang dititipkan |
| **Laporan Kondisi** | Detail kondisi, bensin, dan catatan dari pengelola |
| **Riwayat Booking** | Semua booking masa lalu |
| **Text-to-Speech** | Dengarkan info monitoring dalam Bahasa Indonesia |
| **Profil** | Lihat data akun dan logout |

**Alur Customer:**
```
Booking Form → Menunggu Konfirmasi → Dikonfirmasi → Bayar → Sedang Dititipkan → Selesai
```

---

### 🏢 Pengelola

| Fitur | Deskripsi |
|---|---|
| **Dashboard** | Statistik: total motor, slot tersedia, pendapatan, dll. |
| **Daftar Booking** | Kelola semua booking masuk |
| **Konfirmasi Booking** | Setujui/tolak permintaan booking customer |
| **Daftar Motor** | Lihat semua motor yang sedang dititipkan |
| **Form Monitoring** | Upload foto kondisi motor + isi laporan (kondisi, bensin, catatan) |
| **Data API (REST Simulation)** | Lihat slot parkir & paket layanan dari JSON API |
| **Profil** | Data akun pengelola dan logout |

---

## 📸 Fitur Upload Foto

Menggunakan **`expo-image-picker`** — bukan dummy/placeholder.

- **Customer (BookingScreen):** Upload foto motor saat mengajukan booking
  - Bisa pilih dari **Galeri** atau ambil langsung dari **Kamera**
- **Pengelola (MonitoringFormScreen):** Upload foto kondisi motor terkini
  - Foto kondisi ditampilkan di MonitoringCard milik customer

```js
// Contoh penggunaan di BookingScreen:
import * as ImagePicker from 'expo-image-picker';

const result = await ImagePicker.launchImageLibraryAsync({
  mediaTypes: ['images'],
  allowsEditing: true,
  aspect: [4, 3],
  quality: 0.8,
});
```

---

## 🔊 Fitur Aksesibilitas (TTS)

Menggunakan **`expo-speech`** — Text-to-Speech dalam Bahasa Indonesia.

- Tersedia di **MonitoringScreen** customer (tombol speaker di header)
- Membacakan: status motor, lokasi penyimpanan, kondisi, dan catatan pengelola
- Juga aktif otomatis saat **pembayaran berhasil**

```js
import * as Speech from 'expo-speech';
Speech.speak(text, { language: 'id-ID', pitch: 1.0, rate: 0.88 });
```

---

## 🗄️ Simulasi REST API (Sprint 03)

Data slot parkir dan paket layanan disimulasikan sebagai REST API:

```
src/data/penitipan_api.json        ← Sumber data JSON (raw API response)
        ↓
src/services/apiService.js         ← fetchPenitipanData() — parse + map ke DTO
        ↓
src/models/LayananModel.js         ← LayananDTO (dengan getter formattedTarif)
src/models/SlotModel.js            ← SlotDTO, KendaraanTerparkirDTO
        ↓
src/components/ApiDataDisplay.jsx  ← Tampilan tab: Slot Parkir | Paket Layanan
```

Komponen `ApiDataDisplay` ditampilkan di:
- **HomeScreen** (Customer) — tab bawah beranda
- **DashboardScreen** (Pengelola) — setelah grid statistik

---

## 🎨 Sistem Warna

Defined in [`src/theme/colors.js`](file:///C:/Users/LENOVO/.gemini/antigravity/scratch/nitipin/src/theme/colors.js):

| Token | Warna | Kegunaan |
|---|---|---|
| `colors.primary` | `#2563EB` | Biru utama (tombol, aksen) |
| `colors.secondary` | `#10B981` | Hijau (sukses, konfirmasi) |
| `colors.warning` | `#F59E0B` | Kuning (peringatan, pending) |
| `colors.danger` | `#EF4444` | Merah (error, batal) |
| `colors.background` | `#F8FAFC` | Latar belakang layar |
| `colors.white` | `#FFFFFF` | Card, panel |

---

## 🗂️ Data & State Management

Semua state dikelola melalui **React Context** (`AppContext`):

| State | Deskripsi |
|---|---|
| `currentUser` | User yang sedang login (null = belum login) |
| `bookings` | Array semua booking (dummy + yang dibuat saat runtime) |
| `monitorings` | Array semua data monitoring |
| `login(email, pass)` | Autentikasi — return `{ success, message }` |
| `register(data)` | Daftar akun baru customer |
| `addBooking(data)` | Buat booking baru, return objek booking |
| `updateBooking(id, patch)` | Update status/data booking |
| `addOrUpdateMonitoring(data)` | Tambah/update data monitoring |

---

## 🛠️ Mengelola Slot Parkir & Paket Layanan

Edit file berikut:

- **Slot Parkir & Motor Terparkir:** [`src/data/penitipan_api.json`](file:///C:/Users/LENOVO/.gemini/antigravity/scratch/nitipin/src/data/penitipan_api.json) — bagian `"slot_parkir"`
- **Paket Layanan & Tarif:** [`src/data/penitipan_api.json`](file:///C:/Users/LENOVO/.gemini/antigravity/scratch/nitipin/src/data/penitipan_api.json) — bagian `"layanan_penitipan"`
- **Data Dummy Booking/User:** [`src/data/dummyData.js`](file:///C:/Users/LENOVO/.gemini/antigravity/scratch/nitipin/src/data/dummyData.js)

---

## 🚧 Catatan Pengembangan Lanjutan

Aplikasi ini adalah **prototipe/demo** tanpa backend nyata. Untuk produksi:

- [ ] Ganti `AppContext` dengan API calls ke backend (Node.js/Django/Laravel)
- [ ] Tambahkan database (PostgreSQL / Firebase Firestore)
- [ ] Integrasi payment gateway nyata (Midtrans, Xendit)
- [ ] Push notification (expo-notifications) untuk update status booking
- [ ] Autentikasi JWT / OAuth
- [ ] Upload foto ke cloud storage (Cloudinary, Firebase Storage)
- [ ] Ganti `penitipan_api.json` dengan endpoint REST API sungguhan

---

## 📄 Lisensi

Proyek ini dibuat untuk keperluan **tugas / pembelajaran**. Bebas dimodifikasi.

---

> Dibuat dengan ❤️ menggunakan **React Native + Expo**

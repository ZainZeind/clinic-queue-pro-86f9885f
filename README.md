# Klinik Sehat - Sistem Informasi Klinik

Aplikasi web untuk manajemen klinik kesehatan dengan fitur pendaftaran online, antrian pasien, konsultasi online, dan rekam medis.

## 🚀 Fitur Utama

### Admin
- Dashboard statistik klinik
- Manajemen antrian pasien real-time
- Manajemen user (ubah role & hapus user)
- Database pasien lengkap
- Broadcast notifikasi ke pasien

### Dokter
- Dashboard pasien hari ini
- Manajemen jadwal praktik
- Rekam medis pasien
- Konsultasi online dengan pasien
- Lihat daftar pasien yang terdaftar

### Pasien
- Pendaftaran online dengan validasi kapasitas
- Pilih slot waktu dengan indikator ketersediaan
- Status antrian real-time
- Konsultasi online dengan dokter
- Riwayat kunjungan dan rekam medis

## 🛠️ Tech Stack

**Frontend:**
- React + TypeScript
- Vite
- TailwindCSS
- shadcn/ui
- React Router
- Sonner (toast notifications)

**Backend:**
- Node.js + Express
- MySQL
- JWT Authentication
- bcryptjs

## 📋 Prerequisites

- Node.js (v16 atau lebih baru)
- MySQL (v8 atau lebih baru)
- npm atau yarn

## 🔧 Instalasi

### 1. Clone Repository
```bash
git clone <repository-url>
cd klinik-sehat
```

### 2. Setup Backend

```bash
cd backend
npm install
```

Buat file `.env` di folder `backend`:
```env
PORT=5001
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=klinik_sehat
JWT_SECRET=your_jwt_secret_key_here
```

### 3. Setup Database

```bash
# Login ke MySQL
mysql -u root -p

# Buat database
CREATE DATABASE klinik_sehat;

# Import schema (jika ada file SQL)
mysql -u root -p klinik_sehat < database/schema.sql
```

### 4. Setup Frontend

```bash
# Kembali ke root directory
cd ..
npm install
```

Buat file `.env` di root directory:
```env
VITE_API_URL=http://localhost:5001/api
```

## 🚀 Menjalankan Aplikasi

### Development Mode

**1. Jalankan Backend**
```bash
cd backend
node server.js
```
Backend akan berjalan di `http://localhost:5001`

**2. Jalankan Frontend** (di terminal baru)
```bash
npm run dev
```
Frontend akan berjalan di `http://localhost:5173`

### Build Production

```bash
# Build frontend
npm run build

# Preview build
npm run preview
```

## 👥 Default User Credentials

Setelah setup database, Anda dapat login dengan:

**Admin:**
- Email: admin@klinik.com
- Password: admin123

**Dokter:**
- Email: dokter@klinik.com
- Password: dokter123

**Pasien:**
- Email: pasien@klinik.com
- Password: pasien123

> **Note**: Ganti password default setelah login pertama kali di production.

## 📁 Struktur Project

```
klinik-sehat/
├── backend/
│   ├── config/          # Database configuration
│   ├── controllers/     # Route controllers
│   ├── middleware/      # Authentication & authorization
│   ├── routes/          # API routes
│   ├── utils/           # Utility functions
│   └── server.js        # Entry point
├── src/
│   ├── components/      # React components
│   ├── pages/           # Page components
│   │   ├── admin/       # Admin pages
│   │   ├── doctor/      # Doctor pages
│   │   └── patient/     # Patient pages
│   ├── contexts/        # React contexts
│   ├── lib/             # API client & utilities
│   └── App.tsx          # Main app component
└── public/              # Static assets
```

## 🔐 API Endpoints

### Authentication
- `POST /api/auth/register` - Registrasi user baru
- `POST /api/auth/login` - Login
- `GET /api/auth/profile` - Get user profile

### Patient
- `GET /api/patient/doctors` - Daftar dokter
- `GET /api/patient/doctors/:id/timeslots` - Slot waktu tersedia
- `POST /api/patient/appointments` - Buat pendaftaran
- `GET /api/patient/appointments` - Riwayat pendaftaran
- `GET /api/patient/queue/:id` - Status antrian

### Doctor
- `GET /api/doctor/schedules` - Jadwal praktik
- `POST /api/doctor/schedules` - Update jadwal
- `GET /api/doctor/today-patients` - Pasien hari ini
- `GET /api/doctor/consultations` - Daftar konsultasi
- `POST /api/doctor/medical-records` - Buat rekam medis

### Admin
- `GET /api/admin/queue/today` - Antrian hari ini
- `POST /api/admin/queue/call` - Panggil antrian
- `POST /api/admin/queue/complete` - Selesaikan antrian
- `GET /api/admin/users` - Daftar user
- `PUT /api/admin/users/:id` - Update user
- `DELETE /api/admin/users/:id` - Hapus user

## 📝 Fitur Validasi

### Kapasitas Antrian
- Maximum 20 pasien per slot waktu (1 jam)
- Real-time indicator ketersediaan slot:
  - 🟢 Hijau: Banyak tersedia (>5 slot)
  - 🟡 Kuning: Hampir penuh (≤5 slot)
  - 🔴 Merah: Penuh (tidak bisa booking)

### Jadwal Praktik
- Validasi hari dan waktu praktik dokter
- Pasien hanya bisa booking sesuai jadwal dokter

## 🤝 Contributing

1. Fork repository
2. Buat branch baru (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push ke branch (`git push origin feature/AmazingFeature`)
5. Buat Pull Request

## 📄 License

This project is licensed under the MIT License.

## 📧 Contact

Untuk pertanyaan atau dukungan, hubungi: support@kliniksehat.com

---

Made with ❤️ for better healthcare management

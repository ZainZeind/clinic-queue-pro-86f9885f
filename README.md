# 🏥 Klinik Sehat - Sistem Manajemen Klinik

Aplikasi web untuk manajemen klinik dengan fitur antrian digital, rekam medis, dan konsultasi online.

---

## 📋 Fitur Utama

### 👨‍💼 Admin
- Dashboard statistik klinik
- Manajemen antrian pasien
- Manajemen user (Admin, Dokter, Pasien)
- Database pasien lengkap

### 👨‍⚕️ Dokter
- Jadwal praktik
- Daftar pasien hari ini
- Input rekam medis elektronik
- Riwayat kunjungan pasien

### 👤 Pasien
- Registrasi online (publik)
- Pendaftaran kunjungan
- Cek status antrian real-time
- Notifikasi antrian
- Konsultasi online dengan dokter
- Riwayat rekam medis

---

## 🛠️ Teknologi

**Backend:** Node.js, Express.js, MySQL, JWT  
**Frontend:** React, TypeScript, Tailwind CSS, Vite

---

## 📦 Instalasi

### 1. Clone Repository
```bash
git clone <repository-url>
cd klinik-sehat
```

### 2. Install Dependencies
```bash
# Backend
cd backend
npm install

# Frontend
cd ..
npm install
```

### 3. Setup Database
```bash
# Buat database
mysql -u root -p
CREATE DATABASE clinic_queue_db;
EXIT;

# Jalankan migration
cd backend
node scripts/apply-new-schema.js
```

### 4. Konfigurasi Environment

Buat file `.env` di folder `backend/`:

```env
# Database
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=clinic_queue_db
DB_PORT=3308

# JWT Secret
JWT_SECRET=clinic_queue_secret_key_2024

# Server
PORT=5001
```

---

## 🚀 Menjalankan Aplikasi

### Development
```bash
# Terminal 1: Backend
cd backend
npm start

# Terminal 2: Frontend
npm run dev
```

**Backend:** `http://localhost:5001`  
**Frontend:** `http://localhost:5173`

### Production Build
```bash
npm run build
npm run preview
```

---

## 🔑 Akun Default untuk Testing

### Admin
| Email | Password |
|-------|----------|
| admin@kliniksehat.com | Admin123 |

### Dokter
| Email | Password | Nama |
|-------|----------|------|
| ahmad.hidayat@kliniksehat.com | Dokter123 | dr. Ahmad Hidayat |
| siti.nurhaliza@kliniksehat.com | Dokter123 | dr. Siti Nurhaliza |

### Pasien
| Email | Password | Nama |
|-------|----------|------|
| andi.wijaya@email.com | Pasien123 | Andi Wijaya |
| dewi.lestari@email.com | Pasien123 | Dewi Lestari |

⚠️ **Penting:** 
- Ganti password default setelah login pertama
- Registrasi publik hanya untuk **Pasien**
- Admin/Dokter dibuat oleh Admin

---

## ✅ Validasi Input

### 📱 Nomor Telepon
- Hanya angka (0-9)
- Minimal 10 digit, maksimal 13 digit
- Contoh: `081234567890`

### 🔐 Password
- Minimal 8 karakter
- Harus ada huruf besar (A-Z)
- Harus ada huruf kecil (a-z)
- Harus ada angka (0-9)
- Contoh: `Admin123`

### 🆔 NIK (Pasien)
- Tepat 16 digit angka
- Contoh: `3374010101900001`

---

## 🗄️ Database

Aplikasi menggunakan **10 tabel** dengan nama dalam Bahasa Indonesia:

1. **admin** - Data admin sistem
2. **dokter** - Data dokter dan jadwal praktik
3. **pasien** - Data pasien (NIK sebagai primary key)
4. **pendaftaran_online** - Pendaftaran kunjungan
5. **nomor_antrian** - Sistem antrian
6. **rekam_medis** - Rekam medis elektronik
7. **riwayat_kunjungan** - History kunjungan pasien
8. **konsultasi_online** - Chat konsultasi
9. **notifikasi** - Notifikasi untuk pasien
10. **dashboard_klinik** - Statistik klinik

---

## 🔧 Troubleshooting

### Port Sudah Digunakan
```bash
# Cari process
lsof -i :5001

# Kill process
kill -9 <PID>
```

### MySQL Connection Error
```bash
# Start MySQL
mysql.server start
# atau
brew services start mysql

# Cek port di .env (default: 3308)
```

### Login Tidak Bisa
```bash
# Reset password
cd backend
node scripts/fix-passwords.js
```

### Database Error
```bash
# Drop dan buat ulang
mysql -u root -p
DROP DATABASE clinic_queue_db;
CREATE DATABASE clinic_queue_db;
EXIT;

# Jalankan migration lagi
cd backend
node scripts/apply-new-schema.js
```

---

## 📡 API Endpoints (Ringkasan)

### Authentication
- `POST /api/auth/register` - Registrasi pasien baru
- `POST /api/auth/login` - Login (semua role)
- `GET /api/auth/profile` - Get profile
- `GET /api/auth/notifications` - Get notifikasi

### Admin
- `GET /api/admin/queue/today` - Antrian hari ini
- `POST /api/admin/queue/call` - Panggil antrian
- `GET /api/admin/users` - Get semua user
- `POST /api/admin/users` - Buat user baru

### Dokter
- `GET /api/doctor/schedules` - Get jadwal praktik
- `POST /api/doctor/medical-records` - Buat rekam medis
- `GET /api/doctor/patients/today` - Pasien hari ini

### Pasien
- `GET /api/patient/doctors` - List dokter
- `POST /api/patient/appointments` - Daftar kunjungan
- `GET /api/patient/queue/:id` - Cek status antrian
- `POST /api/patient/consultations` - Konsultasi online

---

## 🎯 Status Project

✅ Core Features Complete  
✅ Authentication & Authorization  
✅ Queue Management System  
✅ Medical Records  
✅ Online Consultation  
✅ Real-time Notifications  
✅ Responsive UI  

**Project is Ready for Production!** 🚀

---

## 📚 Dokumentasi Tambahan

Untuk dokumentasi lengkap, lihat folder docs:
- `DATABASE_MIGRATION_SUMMARY.md`
- `PHONE_VALIDATION.md`
- `PASSWORD_REQUIREMENTS.md`
- `MESSAGES_UPDATE.md`
- `CLEANUP_SUMMARY.md`

---

## 📞 Support

Jika ada pertanyaan atau issues, silakan buat [GitHub Issue](../../issues).

---

## 📄 License

MIT License

---

**Developed with ❤️ for Klinik Sehat**

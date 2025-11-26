# 🏥 Klinik Sehat - Sistem Informasi Klinik

Aplikasi manajemen klinik modern dengan fitur lengkap untuk mengelola antrian, rekam medis, dan konsultasi online.

## 📋 Daftar Isi

- [Fitur Utama](#-fitur-utama)
- [Teknologi](#-teknologi)
- [Database Schema](#-database-schema)
- [Instalasi](#-instalasi)
- [Konfigurasi](#-konfigurasi)
- [Menjalankan Aplikasi](#-menjalankan-aplikasi)
- [Akun Default](#-akun-default)
- [Validasi Input](#-validasi-input)
- [API Documentation](#-api-documentation)
- [Troubleshooting](#-troubleshooting)

---

## ✨ Fitur Utama

### 👨‍💼 Admin
- ✅ Dashboard statistik klinik
- ✅ Manajemen user (Admin, Dokter, Pasien)
- ✅ Manajemen antrian real-time
- ✅ Panggilan antrian otomatis
- ✅ Notifikasi broadcast ke pasien
- ✅ Database pasien lengkap

### 👨‍⚕️ Dokter
- ✅ Jadwal praktik (format JSON)
- ✅ Daftar pasien hari ini
- ✅ Rekam medis elektronik
- ✅ Input diagnosa & resep obat
- ✅ Riwayat kunjungan pasien

### 👤 Pasien
- ✅ Pendaftaran online
- ✅ Sistem antrian digital
- ✅ Status antrian real-time
- ✅ Konsultasi online dengan dokter
- ✅ Riwayat rekam medis
- ✅ Notifikasi antrian

---

## 🛠️ Teknologi

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MySQL** - Database (MariaDB compatible)
- **JWT** - Authentication
- **bcryptjs** - Password hashing

### Frontend
- **React + Vite** - UI Framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Shadcn/UI** - Component library

---

## 🗄️ Database Schema

### Struktur Database (Bahasa Indonesia)

Aplikasi menggunakan **10 tabel utama** dengan nama dalam bahasa Indonesia:

#### 1. **admin**
```sql
- id_admin (Primary Key)
- nama_admin
- email (Unique)
- password (Hashed)
- created_at, updated_at
```

#### 2. **pasien**
```sql
- NIK_pasien (Primary Key, 16 digit)
- nama_pasien
- tanggal_lahir
- alamat
- no_hp (10-13 digit, hanya angka)
- email
- jenis_kelamin (Laki-laki/Perempuan)
- golongan_darah
- password (Hashed)
- created_at, updated_at
```

#### 3. **dokter**
```sql
- id_dokter (Primary Key)
- nama_dokter
- spesialisasi
- no_sip (Surat Izin Praktik)
- no_hp (10-13 digit, hanya angka)
- email (Unique)
- password (Hashed)
- jadwal_praktik (JSON format)
- status_aktif (Aktif/Tidak Aktif)
- created_at, updated_at
```

#### 4. **pendaftaran_online**
```sql
- id_pendaftaran (Primary Key)
- NIK_pasien (Foreign Key)
- nama_pasien
- id_dokter (Foreign Key)
- tanggal_pendaftaran
- waktu_daftar
- keluhan_pasien
- jenis_layanan
- status_pendaftaran
- created_at, updated_at
```

#### 5. **nomor_antrian** ⭐
```sql
- id_antrian (Primary Key)
- nomor_antrian
- id_pendaftaran (Foreign Key)
- NIK_pasien (Foreign Key)
- nama_pasien
- id_dokter (Foreign Key)
- tanggal_antrian
- waktu_mulai, waktu_selesai
- status_antrian (Menunggu/Dipanggil/Selesai/Batal)
- prioritas (Normal/Urgent)
- created_at, updated_at
```

#### 6. **rekam_medis**
```sql
- id_rekam_medis (Primary Key)
- NIK_pasien (Foreign Key)
- nama_pasien
- id_dokter (Foreign Key)
- tanggal_periksa
- keluhan
- diagnosa_pasien
- hasil_pemeriksaan
- tindakan
- resep_obat
- catatan_dokter
- biaya_pemeriksaan
- created_at, updated_at
```

#### 7. **riwayat_kunjungan**
```sql
- id_kunjungan (Primary Key)
- NIK_pasien (Foreign Key)
- nama_pasien
- id_dokter (Foreign Key)
- tanggal_kunjungan
- jenis_kunjungan
- status_kunjungan
- catatan
- created_at
```

#### 8. **konsultasi_online**
```sql
- id_konsultasi (Primary Key)
- NIK_pasien (Foreign Key)
- nama_pasien
- id_dokter (Foreign Key)
- teks_pesan
- status_pesan (Terkirim/Terbaca/Dibalas)
- pengirim (Pasien/Dokter)
- waktu_kirim, waktu_dibaca
- created_at
```

#### 9. **notifikasi**
```sql
- id_notifikasi (Primary Key)
- id_antrian (Foreign Key)
- NIK_pasien (Foreign Key)
- judul_notifikasi
- isi_notifikasi
- jenis_notifikasi (Antrian/Pendaftaran/Hasil/Pengingat/Umum)
- status_antrian
- status_baca (Belum Dibaca/Sudah Dibaca)
- waktu_kirim
- metode_kirim (Email/SMS/Push/In-App)
- created_at
```

#### 10. **dashboard_klinik**
```sql
- id_dashboard (Primary Key)
- tanggal_laporan (Unique)
- jumlah_pasien_datang
- jumlah_pasien_antri
- jumlah_pasien_selesai
- jumlah_pasien_batal
- jumlah_pendaftaran_online
- rata_rata_waktu_tunggu
- catatan
- created_at, updated_at
```

---

## 📦 Instalasi

### Prerequisites
- Node.js v16+ 
- MySQL/MariaDB
- npm atau yarn

### 1. Clone Repository
```bash
git clone <repository-url>
cd klinik-sehat
```

### 2. Install Dependencies

#### Backend
```bash
cd backend
npm install
```

#### Frontend
```bash
cd ..
npm install
```

### 3. Setup Database

#### Buat Database
```bash
mysql -u root -p
CREATE DATABASE clinic_queue_db;
EXIT;
```

#### Jalankan Migration
```bash
cd backend
node scripts/apply-new-schema.js
```

Script ini akan:
- ✅ Membuat semua tabel dengan nama Indonesia
- ✅ Membuat indexes untuk performa
- ✅ Insert sample data (Admin, Dokter, Pasien)
- ✅ Setup credentials default

---

## ⚙️ Konfigurasi

### Backend Environment (.env)

Buat file `.env` di folder `backend/`:

```env
# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=clinic_queue_db
DB_PORT=3308

# JWT Secret
JWT_SECRET=clinic_queue_secret_key_2024_change_this_in_production

# Server Port
PORT=5001
```

### Frontend Environment

API endpoint sudah dikonfigurasi di `src/lib/api.ts`:
```typescript
const API_BASE_URL = 'http://localhost:5001/api';
```

---

## 🚀 Menjalankan Aplikasi

### Development Mode

#### Terminal 1: Backend
```bash
cd backend
npm start
# atau
./start-backend.sh
```

Server berjalan di: `http://localhost:5001`

#### Terminal 2: Frontend
```bash
npm run dev
# atau
./start-frontend.sh
```

Aplikasi berjalan di: `http://localhost:5173`

### Production Build

#### Frontend
```bash
npm run build
npm run preview
```

---

## 🔑 Akun Default

Gunakan credentials berikut untuk login:

| Role | Email | Password | Keterangan |
|------|-------|----------|------------|
| **Admin** | admin@kliniksehat.com | Admin123 | Full access |
| **Admin** | admin2@kliniksehat.com | Admin123 | Backup admin |
| **Dokter** | dokter@kliniksehat.com | Dokter123 | dr. Ahmad Hidayat, Sp.PD |
| **Dokter** | siti@kliniksehat.com | Dokter123 | dr. Siti Nurhaliza, Sp.A |
| **Dokter** | budi@kliniksehat.com | Dokter123 | dr. Budi Santoso, Sp.OG |
| **Pasien** | pasien@kliniksehat.com | Pasien123 | Andi Wijaya (NIK: 3374010101900001) |
| **Pasien** | dewi@email.com | Pasien123 | Dewi Lestari (NIK: 3374020202910002) |
| **Pasien** | citra@email.com | Pasien123 | Citra Pratiwi (NIK: 3374030303920003) |

⚠️ **PENTING:** Ganti password default setelah login pertama!

---

## ✅ Validasi Input

### 📱 Nomor Telepon (Strict)

**Aturan:**
- ✅ **Hanya angka** (0-9)
- ✅ **Minimal 10 digit**
- ✅ **Maksimal 13 digit**

**Contoh:**
- ✅ `081234567890` → Valid
- ✅ `0812345678` → Valid (10 digit)
- ✅ `0812345678901` → Valid (13 digit)
- ❌ `081234abc567` → Invalid (ada huruf)
- ❌ `0812 3456 7890` → Invalid (ada spasi)
- ❌ `+62-812-3456-7890` → Invalid (ada karakter khusus)
- ❌ `081234` → Invalid (kurang dari 10 digit)
- ❌ `08123456789012345` → Invalid (lebih dari 13 digit)

**Error Messages:**
- "Nomor telepon hanya boleh berisi angka"
- "Nomor telepon minimal 10 digit"
- "Nomor telepon maksimal 13 digit"

### 🔐 Password (Strong)

**Aturan:**
- ✅ **Minimal 8 karakter**
- ✅ **Harus ada huruf besar** (A-Z)
- ✅ **Harus ada huruf kecil** (a-z)
- ✅ **Harus ada angka** (0-9)

**Contoh:**
- ✅ `Admin123` → Valid
- ✅ `Welcome2024` → Valid
- ✅ `MyPass99` → Valid
- ❌ `admin123` → Invalid (tidak ada huruf besar)
- ❌ `ADMIN123` → Invalid (tidak ada huruf kecil)
- ❌ `Admin` → Invalid (kurang dari 8 karakter)
- ❌ `Password` → Invalid (tidak ada angka)
- ❌ `12345678` → Invalid (tidak ada huruf)

**Error Messages:**
- "Password minimal 8 karakter"
- "Password harus mengandung huruf"
- "Password harus mengandung angka"
- "Password harus mengandung huruf besar dan kecil"

### 🆔 NIK (Pasien)

**Aturan:**
- ✅ **Tepat 16 digit**
- ✅ **Hanya angka**

**Contoh:**
- ✅ `3374010101900001` → Valid
- ❌ `337401010190000` → Invalid (15 digit)
- ❌ `337401010190000A` → Invalid (ada huruf)

**Error Message:**
- "NIK harus 16 digit angka"

---

## 📡 API Documentation

### Base URL
```
http://localhost:5001/api
```

### Authentication

Gunakan JWT token di header:
```
Authorization: Bearer <token>
```

### Endpoints

#### 🔐 Auth (`/auth`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/register` | Registrasi user baru | ❌ |
| POST | `/login` | Login user | ❌ |
| GET | `/profile` | Get user profile | ✅ |
| PUT | `/profile` | Update profile | ✅ |
| PUT | `/change-password` | Ganti password | ✅ |

#### 👨‍💼 Admin (`/admin`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/queue/today` | Antrian hari ini | ✅ Admin |
| POST | `/queue/call` | Panggil antrian | ✅ Admin |
| POST | `/queue/complete` | Selesaikan antrian | ✅ Admin |
| POST | `/queue/skip` | Batalkan antrian | ✅ Admin |
| GET | `/users` | Get all users | ✅ Admin |
| POST | `/users` | Create user | ✅ Admin |
| PUT | `/users/:id` | Update user | ✅ Admin |
| DELETE | `/users/:id` | Delete user | ✅ Admin |
| GET | `/patients` | Get all patients | ✅ Admin |
| GET | `/patients/:id` | Get patient detail | ✅ Admin |
| POST | `/notifications` | Create notification | ✅ Admin |
| POST | `/notifications/bulk` | Broadcast notification | ✅ Admin |
| GET | `/dashboard/stats` | Dashboard statistics | ✅ Admin |

#### 👨‍⚕️ Dokter (`/doctor`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/schedules` | Get jadwal praktik | ✅ Dokter |
| POST | `/schedules` | Create jadwal | ✅ Dokter |
| PUT | `/schedules/:id` | Update jadwal | ✅ Dokter |
| DELETE | `/schedules/:id` | Delete jadwal | ✅ Dokter |
| POST | `/medical-records` | Create rekam medis | ✅ Dokter |
| GET | `/medical-records/:patient_id` | Get rekam medis pasien | ✅ Dokter |
| PUT | `/medical-records/:id` | Update rekam medis | ✅ Dokter |
| GET | `/patients/today` | Pasien hari ini | ✅ Dokter |

#### 👤 Pasien (`/patient`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/doctors` | Get daftar dokter | ✅ Pasien |
| GET | `/doctors/:id/schedules` | Get jadwal dokter | ✅ Pasien |
| POST | `/appointments` | Daftar online | ✅ Pasien |
| GET | `/appointments` | Riwayat pendaftaran | ✅ Pasien |
| GET | `/queue/:appointment_id` | Status antrian | ✅ Pasien |
| POST | `/consultations` | Buat konsultasi | ✅ Pasien |
| GET | `/consultations` | Riwayat konsultasi | ✅ Pasien |
| POST | `/consultations/messages` | Kirim pesan | ✅ Pasien |
| GET | `/consultations/:doctor_id/messages` | Get messages | ✅ Pasien |

### Response Format

#### Success Response
```json
{
  "message": "Operasi berhasil",
  "data": { ... }
}
```

#### Error Response
```json
{
  "message": "Deskripsi error"
}
```

---

## 🎨 Pesan Notifikasi

Semua pesan notifikasi dibuat **user-friendly** tanpa istilah teknis:

### Sebelum vs Sesudah

| Lama | Baru |
|------|------|
| ❌ "Registrasi berhasil" | ✅ "Akun Anda telah berhasil dibuat" |
| ❌ "Login berhasil" | ✅ "Selamat datang! Login berhasil" |
| ❌ "Profil berhasil diperbarui" | ✅ "Profil Anda telah diperbarui" |
| ❌ "Password berhasil diubah" | ✅ "Password Anda telah diperbarui" |
| ❌ "Terjadi kesalahan server" | ✅ "Terjadi kesalahan, silakan coba lagi" |
| ❌ "Antrian berhasil dipanggil" | ✅ "Pasien telah dipanggil" |
| ❌ "Data tersimpan di database" | ✅ (dihapus) |

---

## 🔧 Troubleshooting

### Login Tidak Bisa

**Problem:** Password lama tidak bekerja

**Solution:**
```bash
cd backend
node scripts/fix-passwords.js
```

Gunakan password baru:
- Admin: `Admin123`
- Dokter: `Dokter123`
- Pasien: `Pasien123`

---

### Database Connection Error

**Problem:** `ECONNREFUSED` atau `Cannot connect to database`

**Solution:**
1. Pastikan MySQL running:
   ```bash
   mysql.server start
   # atau
   brew services start mysql
   ```

2. Cek port di `.env` (default: 3308):
   ```bash
   mysql -u root -p -P 3308
   ```

3. Cek credentials di `.env`

---

### Port Already in Use

**Problem:** `Error: listen EADDRINUSE: address already in use :::5001`

**Solution:**
```bash
# Cari process yang menggunakan port
lsof -i :5001

# Kill process
kill -9 <PID>
```

---

### Migration Error

**Problem:** Error saat jalankan migration

**Solution:**
```bash
# Drop database dan buat ulang
mysql -u root -p
DROP DATABASE clinic_queue_db;
CREATE DATABASE clinic_queue_db;
EXIT;

# Jalankan migration lagi
cd backend
node scripts/apply-new-schema.js
```

---

### Validasi Error

**Problem:** Input ditolak terus

**Cek:**
1. **Nomor Telepon:**
   - Hanya angka (0-9)
   - 10-13 digit
   - Contoh valid: `081234567890`

2. **Password:**
   - Minimal 8 karakter
   - Ada huruf besar: A-Z
   - Ada huruf kecil: a-z
   - Ada angka: 0-9
   - Contoh valid: `Admin123`

3. **NIK:**
   - Tepat 16 digit
   - Hanya angka
   - Contoh valid: `3374010101900001`

---

## 📚 Dokumentasi Tambahan

- [`DATABASE_MIGRATION_SUMMARY.md`](./DATABASE_MIGRATION_SUMMARY.md) - Detail migrasi database
- [`PHONE_VALIDATION.md`](./PHONE_VALIDATION.md) - Validasi nomor telepon
- [`PASSWORD_REQUIREMENTS.md`](./PASSWORD_REQUIREMENTS.md) - Requirement password
- [`MESSAGES_UPDATE.md`](./MESSAGES_UPDATE.md) - Perubahan pesan notifikasi
- [`LOGIN_FIXED.md`](./LOGIN_FIXED.md) - Fix login issues

---

## 🤝 Kontribusi

Untuk berkontribusi:
1. Fork repository
2. Buat branch baru (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push ke branch (`git push origin feature/AmazingFeature`)
5. Buat Pull Request

---

## 📄 License

This project is licensed under the MIT License.

---

## 👨‍💻 Developer

Developed with ❤️ for Klinik Sehat

---

## 📞 Support

Jika ada pertanyaan atau issues, silakan buat [GitHub Issue](../../issues).

---

## 🎉 Status Project

✅ Database Migration - Complete
✅ Phone Validation - Complete
✅ Password Validation - Complete
✅ User-Friendly Messages - Complete
✅ Authentication System - Complete
✅ Queue Management - Complete
✅ Medical Records - Complete
✅ Online Consultation - Complete
✅ Notification System - Complete

**Project is Production Ready!** 🚀

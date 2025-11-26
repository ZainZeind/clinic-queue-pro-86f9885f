# 🏥 Klinik Sehat

Sistem antrian digital klinik modern dengan role-based access control untuk Admin, Dokter, dan Pasien.

## 📋 Table of Contents

- [Tech Stack](#-tech-stack)
- [Features](#-features)
- [Quick Start](#-quick-start)
- [Installation & Setup](#-installation--setup)
- [Test Accounts](#-test-accounts)
- [Testing Guide](#-testing-guide)
- [Project Structure](#-project-structure)
- [API Documentation](#-api-documentation)
- [Troubleshooting](#-troubleshooting)

---

## 🛠 Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** - Build tool
- **TailwindCSS** - Styling
- **shadcn/ui** - UI components
- **React Router** - Routing
- **Tanstack Query** - Data fetching

### Backend
- **Node.js** with Express
- **MySQL** - Database (v5.7+)
- **JWT** - Authentication
- **bcryptjs** - Password hashing

---

## ✨ Features

### 👨‍💼 Admin
- **Dashboard Statistics**: Real-time data (total pasien, dokter, appointments, active queue)
- **Queue Management**: Panggil, selesai, lewati antrian dengan notifikasi otomatis
- **User Management**: CRUD lengkap dengan role assignment (admin, dokter, pasien)
- **Patient Database**: Search & filter pasien, view detail lengkap dengan history
- **Bulk Notifications**: Kirim notifikasi massal per role dengan berbagai tipe

### 👨‍⚕️ Dokter
- **Dashboard**: View pasien hari ini dengan status antrian
- **Schedule Management**: CRUD jadwal praktik per hari dengan max patients
- **Medical Records**: Input lengkap (diagnosis, gejala, tindakan, resep, vital signs)
- **Patient History**: View riwayat medis pasien lengkap

### 👤 Pasien
- **Online Registration**: Pilih dokter, tanggal, dan waktu appointment
- **Real-time Queue**: Status antrian auto-refresh setiap 10 detik
- **Online Consultation**: Chat dengan dokter via messaging system
- **Appointment History**: Filter by status (all, completed, upcoming, cancelled)
- **Notifications**: Reminder appointment & notifikasi giliran antrian

---

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- MySQL (v5.7 or higher)
- npm

### Run Application (2 Terminals)

**Terminal 1 - Backend:**
```bash
./start-backend.sh
```

**Terminal 2 - Frontend:**
```bash
./start-frontend.sh
```

**Browser:**
Open: **http://localhost:5173**

> **💡 Tentang Start Scripts:**
> 
> `start-backend.sh` dan `start-frontend.sh` adalah helper scripts yang otomatis:
> - ✅ Check MySQL running
> - ✅ Check & create database jika belum ada
> - ✅ Install dependencies (`npm install`) jika belum
> - ✅ Check file `.env` dan create dari `.env.example` jika belum ada
> - ✅ Start server dengan informasi login credentials
> 
> **Manual start (tanpa scripts):**
> ```bash
> # Backend
> cd backend && npm run dev
> 
> # Frontend
> npm run dev
> ```

---

## 📦 Installation & Setup

### 1. Clone Repository
```bash
git clone <your-repo-url>
cd clinic-queue-pro
```

### 2. Install Dependencies

**Frontend:**
```bash
npm install
```

**Backend:**
```bash
cd backend
npm install
cd ..
```

### 3. Setup MySQL Database

```bash
# Login to MySQL
mysql -u root -p

# Create database
CREATE DATABASE clinic_queue_db;
exit;

# Import schema
mysql -u root -p clinic_queue_db < backend/database/schema.sql
```

### 4. Configure Environment Variables

**Backend (.env):**
```bash
cd backend
cp .env.example .env
```

Edit `backend/.env`:
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=clinic_queue_db
DB_PORT=3306

JWT_SECRET=your_random_secret_key_here
PORT=5000
```

**Frontend (.env):**
```bash
# Di root folder
cp .env.example .env
```

Edit `.env`:
```env
VITE_API_URL=http://localhost:5000/api
```

### 5. Start the Application

**Terminal 1 - Start Backend:**
```bash
cd backend
npm run dev
```
✅ Output: `Server is running on port 5000`

**Terminal 2 - Start Frontend:**
```bash
npm run dev
```
✅ Output: `Local: http://localhost:5173/`

---

## 🔑 Test Accounts

Database schema sudah include 3 akun default untuk testing:

| Role | Email | Password | Nama |
|------|-------|----------|------|
| **Admin** | admin@clinic.com | admin123 | Administrator |
| **Dokter** | dokter@clinic.com | dokter123 | Dr. Budi Santoso, Sp.PD |
| **Pasien** | pasien@clinic.com | pasien123 | Ahmad Rizki |

### Fitur per Role:

**Admin Dashboard:**
- Kelola Antrian
- Kelola User
- Database Pasien
- Notifikasi

**Dokter Dashboard:**
- Jadwal Praktik (Default: Senin-Jumat 08:00-12:00)
- Rekam Medis
- Pasien Hari Ini

**Pasien Dashboard:**
- Daftar Online
- Konsultasi
- Status Antrian
- Riwayat

---

## 🧪 Testing Guide

### Flow 1: Sebagai Pasien (Registration → Queue)

1. **Login** sebagai pasien (`pasien@clinic.com`)
2. **Daftar Online**:
   - Pilih dokter: Dr. Budi Santoso
   - Pilih tanggal: Hari ini atau besok
   - Pilih waktu: Sesuai jadwal dokter
   - Isi keluhan
   - Submit → Dapat nomor antrian
3. **Status Antrian**:
   - Lihat posisi antrian (auto-refresh 10s)
   - Notifikasi saat giliran dekat
4. **Riwayat**:
   - Lihat appointment yang baru dibuat

### Flow 2: Sebagai Admin (Manage Queue)

1. **Login** sebagai admin (`admin@clinic.com`)
2. **Dashboard**:
   - Lihat statistik (Total Pasien, Dokter, Appointments)
3. **Kelola Antrian**:
   - Lihat antrian hari ini
   - Klik "Panggil" → Status: Sedang Dilayani
   - Pasien menerima notifikasi
   - Klik "Selesai" → Status: Selesai
4. **Kelola User**:
   - Tambah user baru (role: admin/dokter/pasien)
   - Edit user existing
   - Delete user
5. **Notifikasi**:
   - Kirim notifikasi ke semua pasien

### Flow 3: Sebagai Dokter (Medical Records)

1. **Login** sebagai dokter (`dokter@clinic.com`)
2. **Dashboard**:
   - Lihat pasien hari ini (dari appointment)
3. **Jadwal Praktik**:
   - Lihat jadwal default (Senin-Jumat)
   - Edit atau tambah jadwal baru
4. **Rekam Medis**:
   - Pilih pasien yang sudah appointment
   - Klik "Tambah Rekam Medis"
   - Isi lengkap:
     - Diagnosis
     - Gejala
     - Tindakan
     - Resep
     - Vital Signs (Tekanan Darah, Suhu, BB, TB)
   - Simpan

---

## 📁 Project Structure

```
clinic-queue-pro/
├── backend/
│   ├── config/              # Database config (MySQL)
│   ├── controllers/         # Business logic
│   │   ├── adminController.js
│   │   ├── authController.js
│   │   ├── doctorController.js
│   │   └── patientController.js
│   ├── middleware/          # Auth middleware (JWT)
│   ├── routes/              # API routes
│   │   ├── adminRoutes.js
│   │   ├── authRoutes.js
│   │   ├── doctorRoutes.js
│   │   └── patientRoutes.js
│   ├── database/
│   │   └── schema.sql       # MySQL schema
│   ├── scripts/
│   │   ├── create-users.js  # Create default users
│   │   └── test-login.js    # Test password hash
│   ├── .env.example
│   └── server.js            # Entry point
│
├── src/
│   ├── components/
│   │   ├── DashboardLayout.tsx
│   │   ├── ProtectedRoute.tsx
│   │   ├── Navigation.tsx
│   │   └── ui/              # shadcn/ui components
│   ├── contexts/
│   │   └── AuthContext.tsx  # Auth state management
│   ├── hooks/
│   │   ├── use-mobile.tsx
│   │   └── use-toast.ts
│   ├── lib/
│   │   ├── api.ts           # API service layer
│   │   └── utils.ts
│   ├── pages/
│   │   ├── admin/           # Admin pages
│   │   │   ├── QueueManagement.tsx
│   │   │   ├── UserManagement.tsx
│   │   │   ├── PatientDatabase.tsx
│   │   │   └── Notifications.tsx
│   │   ├── doctor/          # Doctor pages
│   │   │   ├── Schedule.tsx
│   │   │   ├── MedicalRecords.tsx
│   │   │   └── TodayPatients.tsx
│   │   ├── patient/         # Patient pages
│   │   │   ├── Registration.tsx
│   │   │   ├── Consultation.tsx
│   │   │   ├── QueueStatus.tsx
│   │   │   └── History.tsx
│   │   ├── dashboard/       # Role-specific dashboards
│   │   │   ├── AdminDashboard.tsx
│   │   │   ├── DoctorDashboard.tsx
│   │   │   └── PatientDashboard.tsx
│   │   ├── Auth.tsx
│   │   ├── Index.tsx
│   │   ├── NotFound.tsx
│   │   └── Unauthorized.tsx
│   ├── App.tsx
│   └── main.tsx
│
├── start-backend.sh         # Script untuk start backend
├── start-frontend.sh        # Script untuk start frontend
├── .env.example
├── package.json
└── README.md
```

---

## 📡 API Documentation

### Authentication
- `POST /api/auth/register` - Register user baru
- `POST /api/auth/login` - Login
- `GET /api/auth/profile` - Get user profile (protected)

### Admin Endpoints
- `GET /api/admin/dashboard/stats` - Dashboard statistics
- `GET /api/admin/queue/today` - Today's queue
- `POST /api/admin/queue/call` - Call queue
- `POST /api/admin/queue/complete` - Complete queue
- `POST /api/admin/queue/skip` - Skip queue
- `GET /api/admin/users` - Get all users
- `POST /api/admin/users` - Create user
- `PUT /api/admin/users/:id` - Update user
- `DELETE /api/admin/users/:id` - Delete user
- `GET /api/admin/patients` - Get all patients
- `GET /api/admin/patients/:id` - Get patient detail
- `POST /api/admin/notifications/bulk` - Send bulk notification

### Doctor Endpoints
- `GET /api/doctor/schedules` - Get doctor schedules
- `POST /api/doctor/schedules` - Create schedule
- `PUT /api/doctor/schedules/:id` - Update schedule
- `DELETE /api/doctor/schedules/:id` - Delete schedule
- `GET /api/doctor/today-patients` - Get today's patients
- `POST /api/doctor/medical-records` - Create medical record
- `GET /api/doctor/medical-records/:patientId` - Get patient medical records
- `PUT /api/doctor/medical-records/:id` - Update medical record

### Patient Endpoints
- `GET /api/patient/doctors` - Get all doctors
- `GET /api/patient/doctors/:id/schedules` - Get doctor schedules
- `POST /api/patient/appointments` - Create appointment
- `GET /api/patient/appointments` - Get my appointments
- `GET /api/patient/queue/:appointmentId` - Get queue status
- `POST /api/patient/consultations` - Create consultation
- `GET /api/patient/consultations` - Get my consultations
- `POST /api/patient/consultations/messages` - Send message
- `GET /api/patient/consultations/:id/messages` - Get messages

**Note:** Semua protected endpoints require JWT token di header:
```
Authorization: Bearer <token>
```

---

## 🔧 Troubleshooting

### ❌ Error "Kesalahan Server" (500 Internal Server Error)

**Gejala:** Muncul error "Kesalahan Server" saat login atau error 500 di console

**Quick Diagnosis:**
```bash
# Jalankan script diagnose otomatis
cd backend
node scripts/diagnose.js

# Script akan check:
# ✅ .env file
# ✅ MySQL connection
# ✅ Database exists
# ✅ Tables created
# ✅ Users exist
```

**Quick Fix:**
```bash
# 1. Check MySQL running
mysql.server status || mysql.server start

# 2. Check backend console untuk error message
# 3. Fix database jika perlu:
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS clinic_queue_db;"
mysql -u root -p clinic_queue_db < backend/database/schema.sql

# 4. Restart backend
cd backend && npm run dev
```

**📖 Troubleshooting lengkap:** Lihat [TROUBLESHOOTING.md](TROUBLESHOOTING.md#-problem-1-error-kesalahan-server--500-internal-server-error)

---

### ❌ Tidak Bisa Login dengan Akun Dummy

**Gejala:** Login dengan `admin@clinic.com` / `admin123` gagal dengan error "Email atau password salah"

**Penyebab & Solusi:**

#### 1. Backend Belum Jalan
```bash
# Check apakah backend running
lsof -i :5000

# Jika tidak ada, start backend
cd backend
npm run dev

# ✅ Harus muncul: "Server is running on port 5000"
```

#### 2. Database Belum Di-import
```bash
# Check apakah database exist
mysql -u root -p -e "SHOW DATABASES LIKE 'clinic_queue_db';"

# Jika tidak ada, import schema
mysql -u root -p -e "CREATE DATABASE clinic_queue_db;"
mysql -u root -p clinic_queue_db < backend/database/schema.sql

# ✅ Harus muncul 3 users (admin, dokter, pasien)
```

#### 3. User Dummy Belum Ada di Database
```bash
cd backend

# Test apakah users exist dan password cocok
node scripts/test-login.js

# Output harus:
# ✅ Connected to database
# Testing: admin@clinic.com
#    Found: Administrator (admin)
#    ✅ Password match! Login should work
```

**Jika password mismatch atau user not found:**
```bash
# Create users otomatis
node scripts/create-users.js

# ✅ Script akan create:
# - admin@clinic.com / admin123
# - dokter@clinic.com / dokter123
# - pasien@clinic.com / pasien123
```

#### 4. Port Backend Salah
```bash
# Check backend/.env
cat backend/.env

# Harus ada:
PORT=5000

# Check frontend .env
cat .env

# Harus ada:
VITE_API_URL=http://localhost:5000/api
```

### "Failed to Fetch" atau "ERR_CONNECTION_REFUSED"

**Penyebab:** Backend belum jalan atau port salah.

**Solusi:**
```bash
# Check apakah backend running
lsof -i :5000

# Start backend
cd backend
npm run dev

# Pastikan output: "Server is running on port 5000"
```

### Quick Fix - One Command Solution

```bash
# Stop semua, fresh start
cd backend

# 1. Drop & create database
mysql -u root -p -e "DROP DATABASE IF EXISTS clinic_queue_db; CREATE DATABASE clinic_queue_db;"

# 2. Import schema (sudah include 3 users)
mysql -u root -p clinic_queue_db < database/schema.sql

# 3. Verify users
mysql -u root -p -e "SELECT email, role FROM clinic_queue_db.users;"

# Output harus:
# +----------------------+--------+
# | email                | role   |
# +----------------------+--------+
# | admin@clinic.com     | admin  |
# | dokter@clinic.com    | dokter |
# | pasien@clinic.com    | pasien |
# +----------------------+--------+

# 4. Start backend
npm run dev

# ✅ Sekarang login harus work!
```

### Database Error / "Access Denied"

**Penyebab:** MySQL credentials salah atau database belum dibuat.

**Solusi:**
```bash
# Check MySQL running
mysql.server status
# atau
sudo service mysql status

# Check database exists
mysql -u root -p -e "SHOW DATABASES;"

# Re-import schema jika perlu
mysql -u root -p -e "DROP DATABASE IF EXISTS clinic_queue_db;"
mysql -u root -p -e "CREATE DATABASE clinic_queue_db;"
mysql -u root -p clinic_queue_db < backend/database/schema.sql

# Verify users
mysql -u root -p -e "SELECT email, role FROM clinic_queue_db.users;"
```

### Port 5000 Already in Use

**Solusi 1:** Matikan aplikasi yang pakai port 5000
```bash
lsof -i :5000
kill -9 <PID>
```

**Solusi 2:** Ganti port
```bash
# Edit backend/.env
PORT=5001

# Edit .env (root)
VITE_API_URL=http://localhost:5001/api
```

### Frontend Tidak Menampilkan Data

**Check:**
1. Backend running di port 5000
2. Browser console (F12) untuk error
3. Network tab untuk failed requests
4. Verify VITE_API_URL di `.env`

**Test API manual:**
```bash
# Test health endpoint
curl http://localhost:5000/health

# Test login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@clinic.com","password":"admin123"}'
```

### User Management Section Kosong

**Penyebab:** Backend belum jalan atau database kosong.

**Solusi:**
1. Pastikan backend running
2. Check browser console untuk error
3. Test API: `GET /api/admin/users`
4. Jika database kosong, run `node backend/scripts/create-users.js`

---

## 🚀 Deployment

### Backend (Node.js + MySQL)

1. **Setup MySQL di production server**
2. **Import schema**: `mysql -u user -p db_name < backend/database/schema.sql`
3. **Set environment variables** (jangan commit .env!)
4. **Run**: `npm start` atau gunakan PM2

### Frontend (React)

```bash
npm run build
```

Deploy folder `dist/` ke hosting (Vercel, Netlify, dll)

**Set environment variable:**
```
VITE_API_URL=https://your-backend-api.com/api
```

---

## 📝 License

This project is for educational purposes.

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:
1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

---

## 📧 Support

For issues and questions, please open an issue on GitHub.

---

## ✅ Success Indicators

- ✅ MySQL database "clinic_queue_db" created
- ✅ 3 default users exist (admin, dokter, pasien)
- ✅ Backend running on port 5000 without errors
- ✅ Frontend running on port 5173
- ✅ Login works for all 3 accounts
- ✅ Dashboard redirects correctly based on role
- ✅ All CRUD operations working

**Selamat! Aplikasi siap digunakan!** 🎉

---

## Project info

**URL**: https://lovable.dev/projects/c68f2b3e-75cd-4146-9170-1d16c456804d

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/c68f2b3e-75cd-4146-9170-1d16c456804d) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/c68f2b3e-75cd-4146-9170-1d16c456804d) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)

# 🏥 Klinik Sehat - Backend API

RESTful API untuk sistem informasi klinik dengan database MySQL dan autentikasi JWT.

## 📋 Daftar Isi

- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Setup & Installation](#-setup--installation)
- [Database Schema](#-database-schema)
- [Environment Variables](#-environment-variables)
- [API Endpoints](#-api-endpoints)
- [Validation Rules](#-validation-rules)
- [Authentication](#-authentication)
- [Scripts](#-scripts)

---

## 🛠️ Tech Stack

- **Node.js** v16+
- **Express.js** - Web framework
- **MySQL2** - Database driver
- **JWT (jsonwebtoken)** - Authentication
- **bcryptjs** - Password hashing
- **dotenv** - Environment variables
- **cors** - Cross-Origin Resource Sharing
- **nodemon** - Development auto-reload

---

## 📁 Project Structure

```
backend/
├── config/
│   └── database.js          # Database connection
├── controllers/
│   ├── authController.js    # Authentication logic
│   ├── adminController.js   # Admin operations
│   ├── doctorController.js  # Doctor operations
│   └── patientController.js # Patient operations
├── middleware/
│   └── auth.js              # JWT authentication middleware
├── routes/
│   ├── authRoutes.js        # Auth endpoints
│   ├── adminRoutes.js       # Admin endpoints
│   ├── doctorRoutes.js      # Doctor endpoints
│   └── patientRoutes.js     # Patient endpoints
├── utils/
│   └── validation.js        # Input validation functions
├── database/
│   └── schema.sql           # Old database schema
├── migrations/
│   ├── create_new_schema.sql     # Full schema with procedures
│   └── create_tables_only.sql    # Simplified schema
├── scripts/
│   ├── apply-new-schema.js       # Migration script
│   ├── fix-passwords.js          # Fix password hashes
│   └── generate-passwords.js     # Generate password hashes
├── .env                     # Environment variables
├── .env.example             # Environment template
├── server.js                # Entry point
├── package.json             # Dependencies
└── README.md                # This file
```

---

## 🚀 Setup & Installation

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Edit `.env`:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=clinic_queue_db
DB_PORT=3308

JWT_SECRET=your_secret_key_here_change_in_production
PORT=5001
```

### 3. Setup Database

#### Create Database

```bash
mysql -u root -p
CREATE DATABASE clinic_queue_db;
EXIT;
```

#### Run Migration

```bash
node scripts/apply-new-schema.js
```

This will:
- Create all tables with Indonesian names
- Insert sample data
- Setup default credentials

### 4. Start Server

#### Development Mode (with auto-reload)

```bash
npm start
# or
npm run dev
```

#### Production Mode

```bash
npm run start:prod
```

Server will run on: `http://localhost:5001`

---

## 🗄️ Database Schema

### Tables Overview

| Table | Description | Primary Key |
|-------|-------------|-------------|
| `admin` | Admin users | `id_admin` |
| `pasien` | Patient data | `NIK_pasien` (16 digit) |
| `dokter` | Doctor data | `id_dokter` |
| `pendaftaran_online` | Online registrations | `id_pendaftaran` |
| `nomor_antrian` | Queue numbers | `id_antrian` |
| `rekam_medis` | Medical records | `id_rekam_medis` |
| `riwayat_kunjungan` | Visit history | `id_kunjungan` |
| `konsultasi_online` | Online consultations | `id_konsultasi` |
| `notifikasi` | Notifications | `id_notifikasi` |
| `dashboard_klinik` | Dashboard stats | `id_dashboard` |

### Key Features

- ✅ All table names in **Bahasa Indonesia**
- ✅ Foreign key constraints for data integrity
- ✅ Indexes on frequently queried columns
- ✅ Timestamps (created_at, updated_at) on all tables
- ✅ ENUM fields for status management

### Sample Data

Default accounts are created automatically:

```sql
-- Admin
admin@kliniksehat.com / Admin123

-- Dokter (3 doctors)
dokter@kliniksehat.com / Dokter123
siti@kliniksehat.com / Dokter123
budi@kliniksehat.com / Dokter123

-- Pasien (3 patients)
pasien@kliniksehat.com / Pasien123
dewi@email.com / Pasien123
citra@email.com / Pasien123
```

---

## 🔐 Environment Variables

### Required Variables

```env
# Database
DB_HOST=localhost           # Database host
DB_USER=root               # Database user
DB_PASSWORD=               # Database password
DB_NAME=clinic_queue_db    # Database name
DB_PORT=3308               # Database port

# JWT
JWT_SECRET=your_secret_key # Change in production!

# Server
PORT=5001                  # API server port
```

### Production Considerations

⚠️ **IMPORTANT:**
- Change `JWT_SECRET` to a strong random string
- Use environment variables manager (e.g., AWS Secrets Manager)
- Never commit `.env` file to repository

---

## 📡 API Endpoints

### Base URL

```
http://localhost:5001/api
```

### Authentication Required

Most endpoints require JWT token in header:

```
Authorization: Bearer <your-jwt-token>
```

### Endpoint Groups

#### 🔐 Auth (`/api/auth`)

```
POST   /register              # Register new user
POST   /login                 # User login
GET    /profile               # Get user profile (Auth required)
PUT    /profile               # Update profile (Auth required)
PUT    /change-password       # Change password (Auth required)
```

#### 👨‍💼 Admin (`/api/admin`)

**Queue Management:**
```
GET    /queue/today           # Get today's queue
POST   /queue/call            # Call next in queue
POST   /queue/complete        # Complete queue
POST   /queue/skip            # Skip/cancel queue
```

**User Management:**
```
GET    /users                 # Get all users (query: ?role=admin|dokter|pasien)
POST   /users                 # Create new user
PUT    /users/:id             # Update user
DELETE /users/:id             # Delete user (query: ?role=)
```

**Patient Management:**
```
GET    /patients              # Get all patients
GET    /patients/:id          # Get patient detail with history
```

**Notifications:**
```
POST   /notifications         # Create notification
POST   /notifications/bulk    # Broadcast notification
```

**Dashboard:**
```
GET    /dashboard/stats       # Get dashboard statistics
```

#### 👨‍⚕️ Doctor (`/api/doctor`)

```
GET    /schedules             # Get doctor schedules
POST   /schedules             # Create schedule
PUT    /schedules/:id         # Update schedule
DELETE /schedules/:id         # Delete schedule

POST   /medical-records       # Create medical record
GET    /medical-records/:patient_id  # Get patient medical records
PUT    /medical-records/:id   # Update medical record

GET    /patients/today        # Get today's patients
```

#### 👤 Patient (`/api/patient`)

```
GET    /doctors               # Get all active doctors
GET    /doctors/:id/schedules # Get doctor schedules

POST   /appointments          # Create appointment
GET    /appointments          # Get my appointments
GET    /queue/:appointment_id # Get queue status

POST   /consultations         # Create consultation
GET    /consultations         # Get my consultations
POST   /consultations/messages       # Send message
GET    /consultations/:doctor_id/messages  # Get messages
```

---

## ✅ Validation Rules

### 📱 Phone Number (no_hp)

**Rules:**
- Only digits (0-9)
- Minimum 10 digits
- Maximum 13 digits

**Valid Examples:**
- `081234567890` ✓
- `0812345678` ✓ (10 digits)
- `0812345678901` ✓ (13 digits)

**Invalid Examples:**
- `081234abc567` ✗ (contains letters)
- `0812 3456 7890` ✗ (contains spaces)
- `+62-812-3456-7890` ✗ (special characters)
- `081234` ✗ (less than 10 digits)

**Error Messages:**
- "Nomor telepon hanya boleh berisi angka"
- "Nomor telepon minimal 10 digit"
- "Nomor telepon maksimal 13 digit"

### 🔐 Password

**Rules:**
- Minimum 8 characters
- Must contain uppercase letter (A-Z)
- Must contain lowercase letter (a-z)
- Must contain number (0-9)

**Valid Examples:**
- `Admin123` ✓
- `Welcome2024` ✓
- `MyPass99` ✓

**Invalid Examples:**
- `admin123` ✗ (no uppercase)
- `ADMIN123` ✗ (no lowercase)
- `Admin` ✗ (less than 8 characters)
- `Password` ✗ (no number)

**Error Messages:**
- "Password minimal 8 karakter"
- "Password harus mengandung huruf"
- "Password harus mengandung angka"
- "Password harus mengandung huruf besar dan kecil"

### 🆔 NIK (National ID - Pasien only)

**Rules:**
- Exactly 16 digits
- Only numbers

**Valid Example:**
- `3374010101900001` ✓

**Invalid Examples:**
- `337401010190000` ✗ (15 digits)
- `337401010190000A` ✗ (contains letter)

**Error Message:**
- "NIK harus 16 digit angka"

### 📧 Email

**Rules:**
- Valid email format
- Must contain @ and domain

**Valid Examples:**
- `user@example.com` ✓
- `admin@kliniksehat.com` ✓

**Invalid Examples:**
- `userexample.com` ✗
- `@example.com` ✗

**Error Message:**
- "Format email tidak valid"

---

## 🔑 Authentication

### JWT Token

API uses JWT (JSON Web Token) for authentication.

### Token Structure

```json
{
  "id": "user_id",
  "email": "user@example.com",
  "role": "admin|dokter|pasien",
  "iat": 1234567890,
  "exp": 1234567890
}
```

### Token Expiration

- Default: **7 days**
- Configured in: `authController.js`

### How to Use

1. **Login to get token:**

```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@kliniksehat.com",
  "password": "Admin123"
}
```

Response:
```json
{
  "message": "Selamat datang! Login berhasil",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "admin@kliniksehat.com",
    "role": "admin",
    "full_name": "Admin Klinik"
  }
}
```

2. **Use token in subsequent requests:**

```bash
GET /api/auth/profile
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Role-Based Access

Different roles have different access levels:

| Endpoint | Admin | Dokter | Pasien |
|----------|-------|--------|--------|
| `/auth/*` | ✅ | ✅ | ✅ |
| `/admin/*` | ✅ | ❌ | ❌ |
| `/doctor/*` | ❌ | ✅ | ❌ |
| `/patient/*` | ❌ | ❌ | ✅ |

---

## 📜 Scripts

### Available Scripts

```bash
# Start development server (with nodemon)
npm start
npm run dev

# Start production server
npm run start:prod

# Apply database migration
node scripts/apply-new-schema.js

# Fix password hashes (if login fails)
node scripts/fix-passwords.js

# Generate new password hashes
node scripts/generate-passwords.js
```

### Custom Scripts

#### apply-new-schema.js

Creates database structure with Indonesian table names.

```bash
node scripts/apply-new-schema.js
```

**What it does:**
- Drops old tables (English names)
- Creates new tables (Indonesian names)
- Inserts sample data
- Shows default credentials

#### fix-passwords.js

Updates password hashes to meet new requirements.

```bash
node scripts/fix-passwords.js
```

**What it does:**
- Generates proper bcrypt hashes
- Updates all default accounts
- New passwords: Admin123, Dokter123, Pasien123

#### generate-passwords.js

Helper to generate password hashes for SQL.

```bash
node scripts/generate-passwords.js
```

**Output:**
```sql
-- Password hashes for migration
-- admin123 = $2a$10$...
-- dokter123 = $2a$10$...
-- pasien123 = $2a$10$...
```

---

## 🔍 Troubleshooting

### Cannot connect to database

**Error:** `ECONNREFUSED` or `Cannot connect to MySQL`

**Solution:**
1. Check if MySQL is running:
   ```bash
   mysql.server start
   ```
2. Verify `.env` credentials
3. Check port (default: 3308)

### Login fails with correct password

**Error:** "Email atau password salah"

**Solution:**
```bash
node scripts/fix-passwords.js
```

Then use new passwords: `Admin123`, `Dokter123`, `Pasien123`

### Validation errors

**Error:** Input rejected even though it looks correct

**Check:**
1. **Phone:** Only digits, 10-13 length
2. **Password:** 8+ chars, uppercase, lowercase, number
3. **NIK:** Exactly 16 digits

### Port already in use

**Error:** `EADDRINUSE: address already in use :::5001`

**Solution:**
```bash
# Find process using port
lsof -i :5001

# Kill process
kill -9 <PID>

# Or change PORT in .env
```

---

## 🧪 Testing

### Manual Testing with curl

#### Register
```bash
curl -X POST http://localhost:5001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@test.com",
    "password": "Test1234",
    "full_name": "Test User",
    "role": "pasien",
    "nik": "1234567890123456",
    "phone": "081234567890"
  }'
```

#### Login
```bash
curl -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@kliniksehat.com",
    "password": "Admin123"
  }'
```

#### Get Profile (with token)
```bash
curl -X GET http://localhost:5001/api/auth/profile \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## 📚 Additional Documentation

- [Main README](../README.md) - Complete project documentation
- [Database Migration Summary](../DATABASE_MIGRATION_SUMMARY.md)
- [Phone Validation Rules](../PHONE_VALIDATION.md)
- [Password Requirements](../PASSWORD_REQUIREMENTS.md)
- [Login Fix Guide](../LOGIN_FIXED.md)

---

## 🤝 Contributing

1. Follow existing code structure
2. Use meaningful variable names in Bahasa Indonesia for database fields
3. Add validation for all user inputs
4. Use proper HTTP status codes
5. Return user-friendly error messages

---

## 📄 License

MIT License

---

## 👨‍💻 Maintainer

Backend API for Klinik Sehat

For issues, please check the [Troubleshooting](#-troubleshooting) section first.
